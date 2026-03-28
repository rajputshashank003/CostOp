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
		Where("users.google_id = ? AND users.deleted_at IS NULL", googleID).
		Scan(&uwr)

	user := uwr.User
	isAdmin := false

	if user.ID == 0 {
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
		if hasInvite && user.DefaultTeamID != invite.TeamID {
			// Accepted invite to a different team
			user.DefaultTeamID = invite.TeamID
			// Inherit org_id from the invited team
			var inviteTeam models.Team
			database.DB.First(&inviteTeam, invite.TeamID)
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
		user.AvatarURL = avatarURL
		database.DB.Save(&user)
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
