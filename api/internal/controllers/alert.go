package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetAlerts returns all alerts for the current user (optionally filtered by subscription_id).
// GET /api/alerts?subscription_id=X
func GetAlerts(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	query := database.DB.Where("user_id = ?", userID)

	if subIDStr := c.Query("subscription_id"); subIDStr != "" {
		subID, err := strconv.Atoi(subIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription_id"})
			return
		}
		query = query.Where("subscription_id = ?", uint(subID))
	}

	var alerts []models.Alert
	if err := query.Order("created_at DESC").Find(&alerts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alerts"})
		return
	}

	// Ensure arrays are never null in JSON response
	for i := range alerts {
		if alerts[i].TriggerOffsets == nil {
			alerts[i].TriggerOffsets = models.IntArray{}
		}
		if alerts[i].TriggeredOffsets == nil {
			alerts[i].TriggeredOffsets = models.IntArray{}
		}
		if alerts[i].Recipients == nil {
			alerts[i].Recipients = models.StringArray{}
		}
	}

	c.JSON(http.StatusOK, alerts)
}

// CreateAlert creates a new alert for the current user.
// POST /api/alerts
func CreateAlert(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var input struct {
		SubscriptionID *uint    `json:"subscription_id"`
		AlertType      string   `json:"alert_type"`
		TriggerOffsets []int    `json:"trigger_offsets"`
		CustomDate     *string  `json:"custom_date"`
		CustomTitle    string   `json:"custom_title"`
		Recipients     []string `json:"recipients"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[ALERT] JSON bind error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[ALERT] CreateAlert input: type=%s subID=%v offsets=%v recipients=%v customTitle=%s customDate=%v\n",
		input.AlertType, input.SubscriptionID, input.TriggerOffsets, input.Recipients, input.CustomTitle, input.CustomDate)

	// Validate alert type
	if input.AlertType == "" {
		input.AlertType = "renewal"
	}
	validTypes := map[string]bool{"renewal": true, "expiration": true, "custom": true}
	if !validTypes[input.AlertType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "alert_type must be one of: renewal, expiration, custom"})
		return
	}

	// Custom alerts need a date and title
	if input.AlertType == "custom" {
		if input.CustomDate == nil || *input.CustomDate == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "custom_date is required for custom alerts"})
			return
		}
		if input.CustomTitle == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "custom_title is required for custom alerts"})
			return
		}
	}

	// Renewal/expiration alerts need a subscription
	if input.AlertType != "custom" && input.SubscriptionID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "subscription_id is required for renewal/expiration alerts"})
		return
	}

	// Validate recipients (max 5)
	if len(input.Recipients) > 5 {
		input.Recipients = input.Recipients[:5]
	}

	// Default recipient to the creator's email if none provided
	if len(input.Recipients) == 0 {
		input.Recipients = []string{user.Email}
	}

	// Default trigger offsets for non-custom alerts
	if input.AlertType != "custom" && len(input.TriggerOffsets) == 0 {
		input.TriggerOffsets = []int{7}
	}

	// Parse custom date string into *time.Time
	var customDatePtr *time.Time
	if input.CustomDate != nil && *input.CustomDate != "" {
		parsed, err := time.Parse(time.RFC3339, *input.CustomDate)
		if err != nil {
			// Try alternate format
			parsed, err = time.Parse("2006-01-02T15:04:05.000Z", *input.CustomDate)
			if err != nil {
				log.Printf("[ALERT] Failed to parse custom_date '%s': %v\n", *input.CustomDate, err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid custom_date format. Use ISO 8601."})
				return
			}
		}
		customDatePtr = &parsed
	}

	alert := models.Alert{
		UserID:           userID,
		OrgID:            user.OrgID,
		SubscriptionID:   input.SubscriptionID,
		AlertType:        input.AlertType,
		TriggerOffsets:   models.IntArray(input.TriggerOffsets),
		TriggeredOffsets: models.IntArray{},
		CustomDate:       customDatePtr,
		CustomTitle:      input.CustomTitle,
		Recipients:       models.StringArray(input.Recipients),
		Status:           "active",
	}

	if err := database.DB.Create(&alert).Error; err != nil {
		log.Printf("[ALERT] DB create error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create alert"})
		return
	}

	log.Printf("[ALERT] Created alert ID=%d type=%s for user=%d\n", alert.ID, alert.AlertType, userID)

	// Immediately process this alert if it's due today (don't wait for daily cron)
	go services.ProcessSingleAlertNow(alert)

	c.JSON(http.StatusCreated, alert)
}

// UpdateAlert updates an existing alert's settings.
// PATCH /api/alerts/:id
func UpdateAlert(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	alertID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID"})
		return
	}

	var alert models.Alert
	if err := database.DB.Where("id = ? AND user_id = ?", uint(alertID), userID).First(&alert).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	var input struct {
		TriggerOffsets []int    `json:"trigger_offsets"`
		CustomDate     *string  `json:"custom_date"`
		CustomTitle    string   `json:"custom_title"`
		Recipients     []string `json:"recipients"`
		Status         string   `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(input.Recipients) > 5 {
		input.Recipients = input.Recipients[:5]
	}

	updates := map[string]interface{}{}
	if input.TriggerOffsets != nil {
		updates["trigger_offsets"] = models.IntArray(input.TriggerOffsets)
		// Reset triggered offsets so re-fires can happen with the new configuration
		updates["triggered_offsets"] = models.IntArray{}
	}
	if input.CustomDate != nil && *input.CustomDate != "" {
		parsed, err := time.Parse(time.RFC3339, *input.CustomDate)
		if err == nil {
			updates["custom_date"] = parsed
		}
	}
	if input.CustomTitle != "" {
		updates["custom_title"] = input.CustomTitle
	}
	if input.Recipients != nil {
		updates["recipients"] = models.StringArray(input.Recipients)
	}
	if input.Status != "" {
		updates["status"] = input.Status
	}

	if err := database.DB.Model(&models.Alert{}).Where("id = ?", alert.ID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update alert"})
		return
	}

	// Reload the updated record
	database.DB.First(&alert, alert.ID)
	c.JSON(http.StatusOK, alert)
}

// DeleteAlert deletes an alert owned by the current user.
// DELETE /api/alerts/:id
func DeleteAlert(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	alertID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID"})
		return
	}

	var alert models.Alert
	if err := database.DB.Where("id = ? AND user_id = ?", uint(alertID), userID).First(&alert).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	if err := database.DB.Delete(&alert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete alert"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Alert deleted successfully"})
}
