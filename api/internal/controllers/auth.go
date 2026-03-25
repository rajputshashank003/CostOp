package controllers

import (
	"context"
	"net/http"
	"time"

	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/api/idtoken"
)

type GoogleLoginRequest struct {
	Token       string `json:"credential" binding:"required"`
	InviteToken string `json:"invite_token"`
}

// VerifyGoogleToken receives the Google ID Token from the frontend, validates it, and issues our own JWT.
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

	// Extract user details
	email := payload.Claims["email"].(string)
	name := payload.Claims["name"].(string)
	googleID := payload.Claims["sub"].(string)
	avatarURL := ""
	if pict, ok := payload.Claims["picture"].(string); ok {
		avatarURL = pict
	}

	// Check for a valid Invite
	var invite models.TeamInvite
	var hasInvite bool = false
	if req.InviteToken != "" {
		if err := database.DB.Where("token = ? AND status = ?", req.InviteToken, "pending").First(&invite).Error; err == nil {
			hasInvite = true
		}
	}

	// Upsert user in database
	var user models.User
	if err := database.DB.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		// Create new user
		user = models.User{
			Email:     email,
			Name:      name,
			GoogleID:  googleID,
			AvatarURL: avatarURL,
		}
		if hasInvite {
			user.DefaultTeamID = invite.TeamID
		}
		if err := database.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
			return
		}

		if hasInvite {
			database.DB.Create(&models.TeamMember{TeamID: invite.TeamID, UserID: user.ID, Role: "member", Designation: invite.Designation})
			database.DB.Model(&invite).Update("status", "accepted")
		} else {
			// Phase 5: Auto-provision a completely isolated Default Team space for organic signups!
			newTeam := models.Team{
				Name:    user.Name + "'s Workspace",
				OwnerID: user.ID,
			}
			database.DB.Create(&newTeam)

			// Establish strict Owner access mapping
			database.DB.Create(&models.TeamMember{TeamID: newTeam.ID, UserID: user.ID, Role: "owner"})

			// Elevate their default UI context permanently
			user.DefaultTeamID = newTeam.ID
			database.DB.Save(&user)
		}
	} else {
		if hasInvite && user.DefaultTeamID != invite.TeamID {
			// Pre-existing user clicked an invite link to jump into a new Team!
			user.DefaultTeamID = invite.TeamID
			database.DB.Save(&user)

			// Check if they are already in the team somehow
			var exists int64
			database.DB.Model(&models.TeamMember{}).Where("team_id = ? AND user_id = ?", invite.TeamID, user.ID).Count(&exists)
			if exists == 0 {
				database.DB.Create(&models.TeamMember{TeamID: invite.TeamID, UserID: user.ID, Role: "member", Designation: invite.Designation})
			}
			database.DB.Model(&invite).Update("status", "accepted")
		}

		// Update existing user info just in case
		user.Name = name
		user.AvatarURL = avatarURL
		database.DB.Save(&user)
	}

	// Generate JWT our backend will use
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

	// Determine admin status from TeamMember role
	var member models.TeamMember
	isAdmin := false
	if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, user.ID).First(&member).Error; err == nil {
		isAdmin = member.Role == "owner"
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    tokenString,
		"user":     user,
		"is_admin": isAdmin,
	})
}
