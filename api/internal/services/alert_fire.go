package services

import (
	"fmt"
	"log"
	"time"

	"costop/internal/database"
	"costop/internal/models"
)

// fireSubscriptionAlert sends emails for a renewal/expiration alert and creates an in-app notification.
func fireSubscriptionAlert(alert models.Alert, sub models.Subscription, offset int, now time.Time) {
	actionWord := "renews"
	if !sub.IsAutoPay {
		actionWord = "expires"
	}

	var title, message string
	if offset == 0 {
		title = fmt.Sprintf("%s %s today", sub.Name, actionWord)
		message = fmt.Sprintf("Your subscription to %s %s today ($%.2f).", sub.Name, actionWord, sub.Cost)
	} else {
		title = fmt.Sprintf("%s %s in %d day(s)", sub.Name, actionWord, offset)
		message = fmt.Sprintf("Your subscription to %s %s in %d day(s) for $%.2f.", sub.Name, actionWord, offset, sub.Cost)
	}

	for _, email := range alert.Recipients {
		if err := SendAlertEmail(email, title, message, sub.Name, sub.Cost, offset, sub.IsAutoPay); err != nil {
			log.Printf("[CRON ERROR] Failed to send alert email to %s (alert %d): %v\n", email, alert.ID, err)
		} else {
			log.Printf("[CRON] Alert email sent to %s for subscription %s (offset=%d)\n", email, sub.Name, offset)
		}
	}

	createNotification(alert.UserID, alert.OrgID, &alert.ID, alert.SubscriptionID,
		title, message, "alert_triggered")

	markOffsetTriggered(alert, offset)
}

// fireCustomAlert sends emails for a custom/standalone reminder and creates an in-app notification.
func fireCustomAlert(alert models.Alert, now time.Time) {
	title := fmt.Sprintf("Reminder: %s", alert.CustomTitle)
	message := fmt.Sprintf("Your custom reminder \"%s\" is due today.", alert.CustomTitle)

	for _, email := range alert.Recipients {
		if err := SendCustomAlertEmail(email, title, message); err != nil {
			log.Printf("[CRON ERROR] Failed to send custom alert email to %s (alert %d): %v\n", email, alert.ID, err)
		} else {
			log.Printf("[CRON] Custom alert email sent to %s (alert %d)\n", email, alert.ID)
		}
	}

	createNotification(alert.UserID, alert.OrgID, &alert.ID, nil,
		title, message, "custom_alert")

	markOffsetTriggered(alert, 0)

	// Custom alerts only fire once — mark as triggered
	database.DB.Model(&models.Alert{}).Where("id = ?", alert.ID).Update("status", "triggered")
}
