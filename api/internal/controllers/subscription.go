package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetSubscriptions fetches all subscriptions for a user.
func GetSubscriptions(c *gin.Context) {
	// Extract the UserID set by the RequireAuth middleware
	userID := c.MustGet("userID").(uint)
	status := c.DefaultQuery("status", "active")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var subscriptions []models.Subscription
	if err := database.DB.Where("team_id = ? AND status = ?", user.DefaultTeamID, status).Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	// 1. Audit Trail Enrichment - Map Identities
	for i, sub := range subscriptions {
		var creator models.User
		if err := database.DB.First(&creator, sub.UserID).Error; err == nil {
			subscriptions[i].AddedByName = creator.Name
		}

		if sub.ArchivedBy != 0 {
			var archiver models.User
			if err := database.DB.First(&archiver, sub.ArchivedBy).Error; err == nil {
				subscriptions[i].ArchivedByName = archiver.Name
			}
		}
	}

	c.JSON(http.StatusOK, subscriptions)
}

// AddSubscription creates a new manual subscription entry.
func AddSubscription(c *gin.Context) {
	// Extract the UserID set by the RequireAuth middleware
	userID := c.MustGet("userID").(uint)

	var input models.Subscription
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if input.Name == "" || input.Cost < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription data"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Assign user mapping
	input.UserID = userID
	input.TeamID = user.DefaultTeamID

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// DeleteSubscription removes a subscription by its ID for the authenticated user.
func DeleteSubscription(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	subIDParam := c.Param("id")

	subID, err := strconv.Atoi(subIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID format"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND team_id = ?", uint(subID), user.DefaultTeamID).First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found or unauthorized", "details": err.Error()})
		return
	}

	if err := database.DB.Model(&sub).UpdateColumns(map[string]interface{}{
		"status":      "archived",
		"archived_by": userID,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription archived successfully"})
}
