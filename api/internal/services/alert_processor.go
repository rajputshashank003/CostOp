package services

import (
	"log"
	"time"

	"costop/internal/database"
	"costop/internal/models"
)

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
