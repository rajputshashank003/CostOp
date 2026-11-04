package controllers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/idtoken"
)

type GoogleLoginRequest struct {
	Token       string `json:"credential" binding:"required"`
	InviteToken string `json:"invite_token"`
}

func VerifyGoogleToken(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing Google token"})
		return
	}

	clientID := config.GoogleClientID

	// Validate the Google ID Token
	payload, err := idtoken.Validate(context.Background(), req.Token, clientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token"})
		return
	}

	// Extract user details; only a Google-verified email may sign in or link to an account
	email, _ := payload.Claims["email"].(string)
	googleID, _ := payload.Claims["sub"].(string)
	emailVerified, _ := payload.Claims["email_verified"].(bool)
	if email == "" || googleID == "" || !emailVerified {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Your Google account email must be verified"})
		return
	}
	name, _ := payload.Claims["name"].(string)
	if name == "" {
		name = strings.Split(email, "@")[0]
	}
	avatarURL := ""
	if pict, ok := payload.Claims["picture"].(string); ok {
		avatarURL = pict
	}

	// Check for a valid Invite (an invite only works for the address it was sent to)
	var invite models.TeamInvite
	var hasInvite bool = false
	if req.InviteToken != "" {
		if err := database.DB.Where("token = ? AND status = ? AND LOWER(email) = ?", req.InviteToken, "pending", strings.ToLower(email)).First(&invite).Error; err == nil {
			// Verify target organization has capacity
			var inviteTeam models.Team
			if err := database.DB.First(&inviteTeam, invite.TeamID).Error; err == nil {
				var org models.Organization
				if err := database.DB.First(&org, inviteTeam.OrgID).Error; err == nil {
					var activeCount int64
					database.DB.Model(&models.User{}).Where("org_id = ? AND deleted_at IS NULL", org.ID).Count(&activeCount)
					limit := 30
					if org.Plan == "pro" {
						limit = 100
					}
					if int(activeCount) >= limit {
						c.JSON(http.StatusForbidden, gin.H{
							"error": "This workspace has reached its member limit. Please ask an administrator to upgrade the workspace plan.",
							"code":  "PLAN_LIMIT_REACHED",
						})
						return
					}
				}
			}
			hasInvite = true
		}
	}

	// Fetch user + their current team role in a single LEFT JOIN query.
	// For new users (ID == 0) the role is determined by the code path below.
	type userWithRole struct {
		models.User
		Role string `gorm:"column:role"`
	}
	var uwr userWithRole
	database.DB.Table("users").
		Select("users.*, team_members.role").
		Joins("LEFT JOIN team_members ON team_members.user_id = users.id AND team_members.team_id = users.default_team_id").
		Where("(users.google_id = ? OR (LOWER(users.email) = ? AND users.email != '')) AND users.deleted_at IS NULL", googleID, strings.ToLower(email)).
		Scan(&uwr)

	user := uwr.User
	isAdmin := false
	isNewUser := false

	if user.ID == 0 {
		user = models.User{
			Email:           email,
			Name:            name,
			GoogleID:        googleID,
			AvatarURL:       avatarURL,
			IsEmailVerified: true,
		}
		if hasInvite {
			user.DefaultTeamID = invite.TeamID
		}
		if err := database.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
			return
		}
		isNewUser = true

		if hasInvite {
			// Invited → joins as member of an existing team; inherit org_id from the team
			var inviteTeam models.Team
			database.DB.First(&inviteTeam, invite.TeamID)
			user.OrgID = inviteTeam.OrgID
			database.DB.Save(&user)
			database.DB.Create(&models.TeamMember{TeamID: invite.TeamID, UserID: user.ID, Role: "member", Designation: invite.Designation})
			database.DB.Model(&invite).Update("status", "accepted")
			user.IsOnboarded = true
			database.DB.Save(&user)
			isAdmin = false
		} else {
			// Organic signup → create org + personal workspace and become owner
			newOrg := models.Organization{Name: user.Name + "'s Organization", OwnerID: user.ID}
			database.DB.Create(&newOrg)
			newTeam := models.Team{Name: user.Name + "'s Workspace", OwnerID: user.ID, OrgID: newOrg.ID}
			database.DB.Create(&newTeam)
			database.DB.Create(&models.TeamMember{TeamID: newTeam.ID, UserID: user.ID, Role: "owner"})
			user.DefaultTeamID = newTeam.ID
			user.OrgID = newOrg.ID
			database.DB.Save(&user)
			isAdmin = true
		}
	} else {
		// Google has proven ownership of this email. If someone pre-registered it with a password
		// and never verified it, that password belongs to them, not the owner: drop it.
		if !user.IsEmailVerified && user.PasswordHash != "" {
			user.PasswordHash = ""
			user.EmailVerifyToken = ""
			user.EmailVerifyExpiresAt = nil
		}

		var inviteTeam models.Team
		if hasInvite {
			database.DB.First(&inviteTeam, invite.TeamID)
			if user.OrgID != 0 && inviteTeam.OrgID != user.OrgID {
				c.JSON(http.StatusConflict, gin.H{"error": "This account already belongs to another workspace"})
				return
			}
		}
		if hasInvite && user.DefaultTeamID != invite.TeamID {
			// Accepted invite to a different team in the same organization
			user.DefaultTeamID = invite.TeamID
			if user.OrgID == 0 {
				user.OrgID = inviteTeam.OrgID
			}
			var exists int64
			database.DB.Model(&models.TeamMember{}).Where("team_id = ? AND user_id = ?", invite.TeamID, user.ID).Count(&exists)
			if exists == 0 {
				database.DB.Create(&models.TeamMember{TeamID: invite.TeamID, UserID: user.ID, Role: "member", Designation: invite.Designation})
			}
			database.DB.Model(&invite).Update("status", "accepted")
			isAdmin = false
		} else {
			// Regular login — role came from the JOIN, no extra query needed
			isAdmin = uwr.Role == "owner"
		}
		user.Name = name
		if avatarURL != "" {
			user.AvatarURL = avatarURL
		}
		if user.GoogleID == "" {
			user.GoogleID = googleID
		}
		user.IsEmailVerified = true
		database.DB.Save(&user)
	}

	// ── Signup emails — only for brand-new users (non-blocking) ─────────────
	if isNewUser {
		accountType := "organic_owner"
		if !isAdmin {
			accountType = "invited_member"
		}
		go func(u models.User, at string) {
			_ = services.SendWelcomeEmail(u.Email, u.Name, u.AvatarURL)
			_ = services.SendAdminSignupNotification(u.Name, u.Email, u.AvatarURL, at)
		}(user, accountType)
	}

	secret := config.JWTSecret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate auth token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    tokenString,
		"user":     user,
		"is_admin": isAdmin,
	})
}

// ── Email & Password Authentication ──────────────────────────────────────────

type EmailLoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type EmailSignupRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required"`
	Password    string `json:"password" binding:"required"`
	InviteToken string `json:"invite_token"`
}

// EmailPasswordLogin handles credential-based sign in
func EmailPasswordLogin(c *gin.Context) {
	var req EmailLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide your email and password"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	if cleanEmail == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	type userWithRole struct {
		models.User
		Role string `gorm:"column:role"`
	}
	var uwr userWithRole
	database.DB.Table("users").
		Select("users.*, team_members.role").
		Joins("LEFT JOIN team_members ON team_members.user_id = users.id AND team_members.team_id = users.default_team_id").
		Where("LOWER(users.email) = ? AND users.deleted_at IS NULL", cleanEmail).
		Scan(&uwr)

	user := uwr.User
	if user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if user.PasswordHash == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "This account was registered using Google. Please continue with Google."})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !user.IsEmailVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"error":                 "Please verify your email address to log in. We sent a verification link to your email.",
			"requires_verification": true,
			"email":                 user.Email,
		})
		return
	}

	isAdmin := uwr.Role == "owner"

	secret := config.JWTSecret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate auth token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    tokenString,
		"user":     user,
		"is_admin": isAdmin,
	})
}

// EmailPasswordSignup handles credential-based registration
func EmailPasswordSignup(c *gin.Context) {
	var req EmailSignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a valid name, email, and password"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	cleanName := strings.TrimSpace(req.Name)

	if cleanEmail == "" || cleanName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and email are required"})
		return
	}

	if len(req.Password) < 8 || len(req.Password) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be between 8 and 72 characters long"})
		return
	}

	var existing models.User
	if err := database.DB.Where("LOWER(email) = ? AND deleted_at IS NULL", cleanEmail).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "An account with this email already exists. Please sign in."})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Check for a valid Invite
	var invite models.TeamInvite
	var hasInvite bool = false
	if req.InviteToken != "" {
		if err := database.DB.Where("token = ? AND status = ? AND LOWER(email) = ?", req.InviteToken, "pending", cleanEmail).First(&invite).Error; err == nil {
			var inviteTeam models.Team
			if err := database.DB.First(&inviteTeam, invite.TeamID).Error; err == nil {
				var org models.Organization
				if err := database.DB.First(&org, inviteTeam.OrgID).Error; err == nil {
					var activeCount int64
					database.DB.Model(&models.User{}).Where("org_id = ? AND deleted_at IS NULL", org.ID).Count(&activeCount)
					limit := 30
					if org.Plan == "pro" {
						limit = 100
					}
					if int(activeCount) >= limit {
						c.JSON(http.StatusForbidden, gin.H{
							"error": "This workspace has reached its member limit. Please ask an administrator to upgrade the workspace plan.",
							"code":  "PLAN_LIMIT_REACHED",
						})
						return
					}
				}
			}
			hasInvite = true
		}
	}

	verifyToken := generateSecureToken()
	expiresAt := time.Now().Add(24 * time.Hour)

	user := models.User{
		Email:                cleanEmail,
		Name:                 cleanName,
		PasswordHash:         string(hashedPassword),
		IsEmailVerified:      false,
		EmailVerifyToken:     verifyToken,
		EmailVerifyExpiresAt: &expiresAt,
	}
	if hasInvite {
		user.DefaultTeamID = invite.TeamID
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user account"})
		return
	}

	if hasInvite {
		var inviteTeam models.Team
		database.DB.First(&inviteTeam, invite.TeamID)
		user.OrgID = inviteTeam.OrgID
		database.DB.Save(&user)
		database.DB.Create(&models.TeamMember{TeamID: invite.TeamID, UserID: user.ID, Role: "member", Designation: invite.Designation})
		database.DB.Model(&invite).Update("status", "accepted")
		user.IsOnboarded = true
		database.DB.Save(&user)
	} else {
		newOrg := models.Organization{Name: user.Name + "'s Organization", OwnerID: user.ID}
		database.DB.Create(&newOrg)
		newTeam := models.Team{Name: user.Name + "'s Workspace", OwnerID: user.ID, OrgID: newOrg.ID}
		database.DB.Create(&newTeam)
		database.DB.Create(&models.TeamMember{TeamID: newTeam.ID, UserID: user.ID, Role: "owner"})
		user.DefaultTeamID = newTeam.ID
		user.OrgID = newOrg.ID
		database.DB.Save(&user)
	}

	// Dispatch email verification link asynchronously via Resend
	frontendURL := config.FrontendURL
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", frontendURL, verifyToken)
	go func(toEmail, toName, vURL string) {
		_ = services.SendVerificationEmail(toEmail, toName, vURL)
	}(user.Email, user.Name, verifyURL)

	c.JSON(http.StatusOK, gin.H{
		"message":               "Account created! Please check your email to verify your account.",
		"requires_verification": true,
		"email":                 user.Email,
	})
}

// ── Email Verification Endpoints ──────────────────────────────────────────────

func generateSecureToken() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

type ResendVerificationRequest struct {
	Email string `json:"email" binding:"required"`
}

// VerifyEmail marks a user account as verified when given a valid link token
func VerifyEmail(c *gin.Context) {
	var req VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Token) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
		return
	}

	cleanToken := strings.TrimSpace(req.Token)

	var user models.User
	if err := database.DB.Where("email_verify_token = ? AND deleted_at IS NULL", cleanToken).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This verification link is invalid or has already been used."})
		return
	}

	if user.EmailVerifyExpiresAt != nil && user.EmailVerifyExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This verification link has expired. Please request a new one.",
			"email": user.Email,
		})
		return
	}

	// Mark user verified and clear token
	user.IsEmailVerified = true
	user.EmailVerifyToken = ""
	user.EmailVerifyExpiresAt = nil
	database.DB.Save(&user)

	// Fetch user's role in their default team
	var role string
	if user.DefaultTeamID > 0 {
		var member models.TeamMember
		if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, user.ID).First(&member).Error; err == nil {
			role = member.Role
		}
	}
	isAdmin := role == "owner"

	// Async welcome and admin emails upon verified activation
	accountType := "organic_owner"
	if !isAdmin {
		accountType = "invited_member"
	}
	go func(u models.User, at string) {
		_ = services.SendWelcomeEmail(u.Email, u.Name, u.AvatarURL)
		_ = services.SendAdminSignupNotification(u.Name, u.Email, u.AvatarURL, at)
	}(user, accountType)

	// Issue JWT token so user is automatically authenticated upon verification
	secret := config.JWTSecret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate auth token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Email verified successfully",
		"token":    tokenString,
		"user":     user,
		"is_admin": isAdmin,
	})
}

// ResendVerificationEmail sends a fresh verification link to the user's email
func ResendVerificationEmail(c *gin.Context) {
	var req ResendVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email address is required"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	if cleanEmail == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email address is required"})
		return
	}

	var user models.User
	if err := database.DB.Where("LOWER(email) = ? AND deleted_at IS NULL", cleanEmail).First(&user).Error; err != nil {
		// Generic response to prevent email enumeration
		c.JSON(http.StatusOK, gin.H{"message": "If an account exists with this email, a verification link has been sent."})
		return
	}

	if user.IsEmailVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This email address is already verified. Please sign in."})
		return
	}

	// Generate fresh token and 24h expiry
	newToken := generateSecureToken()
	expiresAt := time.Now().Add(24 * time.Hour)
	user.EmailVerifyToken = newToken
	user.EmailVerifyExpiresAt = &expiresAt
	database.DB.Save(&user)

	frontendURL := config.FrontendURL
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", frontendURL, newToken)
	go func(toEmail, toName, vURL string) {
		_ = services.SendVerificationEmail(toEmail, toName, vURL)
	}(user.Email, user.Name, verifyURL)

	c.JSON(http.StatusOK, gin.H{"message": "A new verification link has been sent to your email."})
}

// EnsureDemoUser creates or synchronizes the demo account required for verification
func EnsureDemoUser() {
	demoEmail := "demo@costop.in"
	demoPass := config.DemoUserPassword
	if len(demoPass) < 12 {
		log.Println("[DEMO_USER] DEMO_USER_PASSWORD not set (min 12 chars): demo account disabled")
		// Lock any existing demo account whose password was published in source
		database.DB.Model(&models.User{}).Where("LOWER(email) = ?", demoEmail).Update("password_hash", "")
		return
	}

	var user models.User
	err := database.DB.Where("LOWER(email) = ?", demoEmail).First(&user).Error

	hash, errHash := bcrypt.GenerateFromPassword([]byte(demoPass), bcrypt.DefaultCost)
	if errHash != nil {
		log.Printf("[DEMO_USER] Failed to hash demo password: %v", errHash)
		return
	}

	if err != nil {
		// Create new demo user
		user = models.User{
			Email:           demoEmail,
			Name:            "Demo User",
			PasswordHash:    string(hash),
			IsOnboarded:     true,
			IsEmailVerified: true,
		}
		if err := database.DB.Create(&user).Error; err != nil {
			log.Printf("[DEMO_USER] Failed to create demo user: %v", err)
			return
		}

		// Create Demo Org
		org := models.Organization{
			Name:    "Demo Org",
			OwnerID: user.ID,
			Plan:    "free",
		}
		database.DB.Create(&org)

		// Create Team
		team := models.Team{
			Name:    "Demo Org",
			OwnerID: user.ID,
			OrgID:   org.ID,
		}
		database.DB.Create(&team)

		// Create Team Member with designation
		database.DB.Create(&models.TeamMember{
			TeamID:      team.ID,
			UserID:      user.ID,
			Role:        "owner",
			Designation: "Founder & CEO",
		})

		user.DefaultTeamID = team.ID
		user.OrgID = org.ID
		database.DB.Save(&user)
		log.Println("[DEMO_USER] Created demo user demo@costop.in with Demo Org")
	} else {
		// User already exists: ensure password, onboarded status, email verified status, org name and designation
		user.PasswordHash = string(hash)
		user.IsOnboarded = true
		user.IsEmailVerified = true
		database.DB.Save(&user)

		if user.OrgID != 0 {
			database.DB.Model(&models.Organization{}).Where("id = ?", user.OrgID).Update("name", "Demo Org")
		} else {
			org := models.Organization{
				Name:    "Demo Org",
				OwnerID: user.ID,
				Plan:    "free",
			}
			database.DB.Create(&org)
			user.OrgID = org.ID
			database.DB.Save(&user)
		}

		if user.DefaultTeamID != 0 {
			database.DB.Model(&models.Team{}).Where("id = ?", user.DefaultTeamID).Update("name", "Demo Org")
			var member models.TeamMember
			if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, user.ID).First(&member).Error; err == nil {
				member.Role = "owner"
				member.Designation = "Founder & CEO"
				database.DB.Save(&member)
			} else {
				database.DB.Create(&models.TeamMember{
					TeamID:      user.DefaultTeamID,
					UserID:      user.ID,
					Role:        "owner",
					Designation: "Founder & CEO",
				})
			}
		} else {
			team := models.Team{
				Name:    "Demo Org",
				OwnerID: user.ID,
				OrgID:   user.OrgID,
			}
			database.DB.Create(&team)
			database.DB.Create(&models.TeamMember{
				TeamID:      team.ID,
				UserID:      user.ID,
				Role:        "owner",
				Designation: "Founder & CEO",
			})
			user.DefaultTeamID = team.ID
			database.DB.Save(&user)
		}
		log.Println("[DEMO_USER] Demo user demo@costop.in verified and synchronized with Demo Org")
	}
}

