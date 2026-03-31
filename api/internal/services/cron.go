package services

import (
	"fmt"
	"log"
	"time"

	"costop/internal/database"
	"costop/internal/models"
)

// StartCronJobs boots the background alert polling goroutine.
func StartCronJobs() {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[CRON] CRITICAL PANIC Recovered in polling daemon: %v\n", r)
			}
		}()

		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		log.Println("[CRON] Production Automated Engine Hook launched successfully.")

		// Run immediately on boot
		processSmartAlerts()

		for {
			<-ticker.C
			processSmartAlerts()
		}
	}()
}

// processSmartAlerts is the main daily sweep:
//  1. Processes user-defined Alerts (renewal, expiration, custom)
//  2. Auto-generates "expiring tomorrow" in-app notifications for all active subs
func processSmartAlerts() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[CRON] Panic recovered during processSmartAlerts: %v\n", r)
		}
	}()

	now := time.Now().UTC()
	log.Printf("[CRON] Starting smart alert sweep at %s\n", now.Format(time.RFC3339))

	processUserAlerts(now)
	processExpiringTomorrow(now)

	log.Println("[CRON] Smart alert sweep complete.")
}

// processUserAlerts queries all active user-defined alerts and fires those whose
// trigger date (target_date - offset days) falls within today's window.
func processUserAlerts(now time.Time) {
	var alerts []models.Alert
	if err := database.DB.Where("status = 'active'").Find(&alerts).Error; err != nil {
		log.Printf("[CRON ERROR] Failed to fetch alerts: %v\n", err)
		return
	}

	log.Printf("[CRON] Processing %d active user alerts\n", len(alerts))

	for _, alert := range alerts {
		processSingleSmartAlert(alert, now)
	}
}

// ProcessSingleAlertNow is called from the controller immediately after creating an alert.
// It runs the same logic as the cron, so the user doesn't have to wait 24 hours for email delivery.
func ProcessSingleAlertNow(alert models.Alert) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[ALERT-NOW] Panic processing alert %d: %v\n", alert.ID, r)
		}
	}()

	now := time.Now().UTC()
	log.Printf("[ALERT-NOW] Immediately processing alert ID=%d type=%s\n", alert.ID, alert.AlertType)
	processSingleSmartAlert(alert, now)
}

// processSingleSmartAlert checks each offset for a given alert and fires if matched.
func processSingleSmartAlert(alert models.Alert, now time.Time) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[CRON] Panic for alert %d: %v\n", alert.ID, r)
		}
	}()

	if alert.AlertType == "custom" {
		if alert.CustomDate == nil {
			return
		}
		targetDate := *alert.CustomDate

		// For custom alerts: fire on the exact day
		if isSameDay(now, targetDate) && !hasTriggeredOffset(alert.TriggeredOffsets, 0) {
			fireCustomAlert(alert, now)
		}
		return
	}

	// For renewal/expiration alerts: need a linked subscription
	if alert.SubscriptionID == nil {
		return
	}

	var sub models.Subscription
	if err := database.DB.First(&sub, *alert.SubscriptionID).Error; err != nil {
		log.Printf("[CRON] Alert %d: subscription %d not found\n", alert.ID, *alert.SubscriptionID)
		return
	}
	if sub.Status != "active" {
		return
	}

	targetDate := sub.NextBillingDate.UTC()

	for _, offset := range alert.TriggerOffsets {
		fireDate := targetDate.AddDate(0, 0, -offset)

		if isSameDay(now, fireDate) && !hasTriggeredOffset(alert.TriggeredOffsets, offset) {
			fireSubscriptionAlert(alert, sub, offset, now)
		}
	}
}

// fireSubscriptionAlert sends emails for a renewal/expiration alert and creates a notification.
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

	// Send email to all recipients
	for _, email := range alert.Recipients {
		err := SendAlertEmail(email, title, message, sub.Name, sub.Cost, offset, sub.IsAutoPay)
		if err != nil {
			log.Printf("[CRON ERROR] Failed to send alert email to %s (alert %d): %v\n", email, alert.ID, err)
		} else {
			log.Printf("[CRON] Alert email sent to %s for subscription %s (offset=%d)\n", email, sub.Name, offset)
		}
	}

	// Create in-app notification
	createNotification(alert.UserID, alert.OrgID, &alert.ID, alert.SubscriptionID,
		title, message, "alert_triggered")

	markOffsetTriggered(alert, offset)
}

// fireCustomAlert sends emails for a custom/standalone reminder and creates a notification.
func fireCustomAlert(alert models.Alert, now time.Time) {
	title := fmt.Sprintf("Reminder: %s", alert.CustomTitle)
	message := fmt.Sprintf("Your custom reminder \"%s\" is due today.", alert.CustomTitle)

	for _, email := range alert.Recipients {
		err := SendCustomAlertEmail(email, title, message)
		if err != nil {
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

	for _, sub := range subs {
		// Only create a notification if one doesn't already exist for today
		var existing int64
		database.DB.Model(&models.Notification{}).
			Where("subscription_id = ? AND source = 'expiring_tomorrow' AND created_at >= ?",
				sub.ID, time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)).
			Count(&existing)
		if existing > 0 {
			continue
		}

		// Fetch the owner's user record
		var owner models.User
		if err := database.DB.First(&owner, sub.OwnerID).Error; err != nil {
			continue
		}

		action := "renews"
		if !sub.IsAutoPay {
			action = "expires"
		}
		title := fmt.Sprintf("%s %s tomorrow", sub.Name, action)
		msg := fmt.Sprintf("Your subscription to %s %s tomorrow ($%.2f).", sub.Name, action, sub.Cost)

		subID := sub.ID
		createNotification(owner.ID, owner.OrgID, nil, &subID, title, msg, "expiring_tomorrow")
		log.Printf("[CRON] Created 'expiring_tomorrow' notification for subscription %s (owner %d)\n", sub.Name, owner.ID)
	}
}

// createNotification inserts an in-app Notification record.
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

// markOffsetTriggered appends the offset to TriggeredOffsets in the DB.
func markOffsetTriggered(alert models.Alert, offset int) {
	newTriggered := append(alert.TriggeredOffsets, offset)
	if err := database.DB.Model(&models.Alert{}).Where("id = ?", alert.ID).Update("triggered_offsets", models.IntArray(newTriggered)).Error; err != nil {
		log.Printf("[CRON ERROR] Failed to update triggered_offsets for alert %d: %v\n", alert.ID, err)
	}
}

// isSameDay returns true if two UTC times fall on the same calendar day.
func isSameDay(a, b time.Time) bool {
	ay, am, ad := a.UTC().Date()
	by, bm, bd := b.UTC().Date()
	return ay == by && am == bm && ad == bd
}

// hasTriggeredOffset checks whether a given offset has already been fired.
func hasTriggeredOffset(triggered models.IntArray, offset int) bool {
	for _, t := range triggered {
		if t == offset {
			return true
		}
	}
	return false
}
