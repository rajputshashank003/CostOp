package services

import (
	"fmt"
	"log"
	"time"

	"costop/internal/database"
	"costop/internal/models"
)

// processExpiringTomorrow auto-generates system notifications for subscriptions expiring tomorrow.
func processExpiringTomorrow(now time.Time) {
	tomorrow := now.AddDate(0, 0, 1)
	windowStart := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, time.UTC)
	windowEnd := windowStart.Add(24 * time.Hour)

	var subs []models.Subscription
	if err := database.DB.Where(
		"status = 'active' AND next_billing_date >= ? AND next_billing_date < ?",
		windowStart, windowEnd,
	).Find(&subs).Error; err != nil {
		log.Printf("[CRON ERROR] processExpiringTomorrow query failed: %v\n", err)
		return
	}

	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	for _, sub := range subs {
		// Skip if a notification was already generated for this sub today
		var existing int64
		database.DB.Model(&models.Notification{}).
			Where("subscription_id = ? AND source = 'expiring_tomorrow' AND created_at >= ?",
				sub.ID, todayStart).
			Count(&existing)

		if existing > 0 {
			continue
		}

		var owner models.User
		if err := database.DB.First(&owner, sub.OwnerID).Error; err != nil {
			continue
		}

		action := "renews"
		if !sub.IsAutoPay {
			action = "expires"
		}

		title := fmt.Sprintf("%s %s tomorrow", sub.Name, action)
		msg := fmt.Sprintf("Your subscription to %s %s tomorrow (%s).", sub.Name, action, FormatMoney(sub.Cost, OrgCurrency(sub.OrgID)))

		subID := sub.ID
		createNotification(owner.ID, owner.OrgID, nil, &subID, title, msg, "expiring_tomorrow")
		log.Printf("[CRON] Created 'expiring_tomorrow' notification for subscription %s (owner %d)\n", sub.Name, owner.ID)
	}
}

// createNotification inserts an in-app Notification record into the database.
func createNotification(userID, orgID uint, alertID *uint, subID *uint, title, message, source string) {
	notif := models.Notification{
		UserID:         userID,
		OrgID:          orgID,
		AlertID:        alertID,
		SubscriptionID: subID,
		Title:          title,
		Message:        message,
		Source:         source,
		IsRead:         false,
	}
	if err := database.DB.Create(&notif).Error; err != nil {
		log.Printf("[CRON ERROR] Failed to create notification for user %d: %v\n", userID, err)
	}
}
