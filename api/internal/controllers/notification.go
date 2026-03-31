package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetNotifications returns all notifications for the current user, sorted by newest first.
// GET /api/notifications
func GetNotifications(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var notifications []models.Notification
	if err := database.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(10).
		Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	// Count unread
	var unreadCount int64
	database.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = false", userID).
		Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"unread_count":  unreadCount,
	})
}

// MarkNotificationRead marks a single notification as read.
// PATCH /api/notifications/:id/read
func MarkNotificationRead(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	notifID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	result := database.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", uint(notifID), userID).
		Update("is_read", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAllNotificationsRead marks all of the user's notifications as read.
// PATCH /api/notifications/read-all
func MarkAllNotificationsRead(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	if err := database.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = false", userID).
		Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all notifications as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// DeleteNotification deletes a single notification belonging to the user.
// DELETE /api/notifications/:id
func DeleteNotification(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	notifID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	var notif models.Notification
	if err := database.DB.Where("id = ? AND user_id = ?", uint(notifID), userID).First(&notif).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	if err := database.DB.Delete(&notif).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}
