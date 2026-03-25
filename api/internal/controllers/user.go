package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
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
