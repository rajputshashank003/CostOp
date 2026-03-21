package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"

	"costop/internal/config"

	"github.com/gin-gonic/gin"
)

// Generate a secure random string for tokens
func generateToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GetTeamMembers fetches all active members and pending invites for the user's active workspace
func GetTeamMembers(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Fetch active members
	var members []models.TeamMember
	if err := database.DB.Where("team_id = ?", user.DefaultTeamID).Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
		return
	}

	// Fetch pending invites
	var invites []models.TeamInvite
	if err := database.DB.Where("team_id = ? AND status = ?", user.DefaultTeamID, "pending").Find(&invites).Error; err != nil {
		invites = []models.TeamInvite{} // safe fallback
	}

	// Enrich member data with User info
	type MemberResponse struct {
		Role string      `json:"role"`
		User models.User `json:"user"`
	}
	var enrichedMembers []MemberResponse
	for _, m := range members {
		var u models.User
		database.DB.First(&u, m.UserID)
		enrichedMembers = append(enrichedMembers, MemberResponse{
			Role: m.Role,
			User: u,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"members": enrichedMembers,
		"invites": invites,
	})
}

// InviteMember securely generates a token and fires a Resend email invitation
func InviteMember(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	// 1. Get the current user's workspace context
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var team models.Team
	if err := database.DB.First(&team, user.DefaultTeamID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Workspace not found"})
		return
	}

	// 2. Prevent duplicate active invites for the exact same email & team
	type InviteCheck struct{ ID uint }
	var existing InviteCheck
	if err := database.DB.Model(&models.TeamInvite{}).Where("team_id = ? AND email = ? AND status = ?", team.ID, input.Email, "pending").First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "This email already has a pending invite for this workspace."})
		return
	}

	// 3. Generate secure cryptographic token
	token, err := generateToken(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate security token"})
		return
	}

	// 4. Save invite record
	invite := models.TeamInvite{
		TeamID: team.ID,
		Email:  input.Email,
		Token:  token,
		Status: "pending",
	}
	if err := database.DB.Create(&invite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to construct invite record"})
		return
	}

	// 5. Fire Email via Resend Go SDK gracefully (Warning: Requires verified domain)
	go func() {
		services.SendTeamInviteEmail(input.Email, user.Name, team.Name, token)
	}()

	frontendURL := config.FrontendURL
	inviteLink := fmt.Sprintf("%s/login?token=%s", frontendURL, token)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Invitation created! You can copy the link below.",
		"invite_link": inviteLink,
	})
}

// RevokeInvite safely drops a pending invitation ensuring workspace authorization
func RevokeInvite(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	inviteID := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var invite models.TeamInvite
	if err := database.DB.Where("id = ? AND team_id = ?", inviteID, user.DefaultTeamID).First(&invite).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invite not found or unauthorized"})
		return
	}

	if err := database.DB.Delete(&invite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke invitation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invite successfully revoked"})
}
