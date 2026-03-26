package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetProfileSubscriptions returns all active subscriptions where the logged-in user holds a seat assignment.
func GetProfileSubscriptions(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var subscriptions []models.Subscription

	err := database.DB.
		Joins("JOIN subscription_assignments ON subscription_assignments.subscription_id = subscriptions.id").
		Where("subscription_assignments.user_id = ?", userID).
		Where("subscriptions.status = ?", "active").
		Find(&subscriptions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profile subscriptions"})
		return
	}

	c.JSON(http.StatusOK, enrichSubscriptions(subscriptions))
}

// OnboardUser sets up the initial workspace name and user designation for an organic sign-up.
// PATCH /api/users/onboard
func OnboardUser(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input struct {
		TeamName    string `json:"team_name" binding:"required"`
		Designation string `json:"designation" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Workspace Name and Designation are required"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		fmt.Printf("[DEBUG] OnboardUser: User %d not found. Checking unscoped...\n", userID)
		var exists bool
		database.DB.Unscoped().Model(&models.User{}).Select("count(*) > 0").Where("id = ?", userID).Find(&exists)
		if exists {
			fmt.Printf("[DEBUG] OnboardUser: User %d exists but is SOFT-DELETED\n", userID)
			c.JSON(http.StatusNotFound, gin.H{"error": "User found but is deleted. Please log in again."})
		} else {
			fmt.Printf("[DEBUG] OnboardUser: User %d really does not exist in DB\n", userID)
			c.JSON(http.StatusNotFound, gin.H{"error": "User account not found. Please log in again."})
		}
		return
	}

	if user.IsOnboarded {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is already onboarded"})
		return
	}

	// Update the default team's name
	var team models.Team
	if err := database.DB.First(&team, user.DefaultTeamID).Error; err == nil {
		team.Name = input.TeamName
		database.DB.Save(&team)
	}

	// Update the user's designation in that team
	var membership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, user.ID).First(&membership).Error; err == nil {
		membership.Designation = input.Designation
		database.DB.Save(&membership)
	}

	// Mark user as onboarded
	user.IsOnboarded = true
	database.DB.Save(&user)

	// The user who sets up their own workspace is the owner — return is_admin:true
	c.JSON(http.StatusOK, gin.H{
		"message":  "Onboarding complete",
		"user":     user,
		"is_admin": true,
	})
}
