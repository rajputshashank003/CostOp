package services

import (
	"log"
	"time"

	"costop/internal/database"
	"costop/internal/models"
)

// StartCronJobs boots a localized resilient goroutine looping native database constraints for automation hooks
func StartCronJobs() {
	go func() {
		// Production Safety: Recover from unexpected panics to keep the daemon alive continuously
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[CRON] CRITICAL PANIC Recovered in polling daemon: %v\n", r)
			}
		}()

		// Production Frequency: Run the check once every 24 hours
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		log.Println("[CRON] Production Automated Engine Hook launched successfully.")

		// Process immediately on server boot so deployments instantly flush notifications
		processWeeklyRenewals()

		for {
			<-ticker.C
			processWeeklyRenewals()
		}
	}()
}

// processWeeklyRenewals actively surveys the PostgreSQL table bounds for 7-day targets
func processWeeklyRenewals() {
	// Add local panic recovery to isolate memory faults
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[CRON] Panic recovered during batch processing: %v\n", r)
		}
	}()

	now := time.Now()
	// Target exactly 7 days from right now
	sevenDaysOut := now.AddDate(0, 0, 7)

	// Open a generous 24-hour verification window around the 7 day mark
	windowStart := sevenDaysOut.Add(-12 * time.Hour)
	windowEnd := sevenDaysOut.Add(12 * time.Hour)

	// Create a safe guard so we never email the same user more than once per week for this charge!
	spamGuardDate := now.AddDate(0, 0, -6)

	var targets []models.Subscription

	err := database.DB.Where(
		"status = 'active' AND next_billing_date >= ? AND next_billing_date <= ? AND (last_alerted_at IS NULL OR last_alerted_at < ?)",
		windowStart, windowEnd, spamGuardDate,
	).Find(&targets).Error

	if err != nil {
		log.Printf("[CRON ERROR] Alert sweep failed to query database: %v\n", err)
		return
	}

	if len(targets) > 0 {
		log.Printf("[CRON] Sweep found %d isolated Subscriptions crossing the 7-day renewal timeline!\n", len(targets))
	} else {
		log.Println("[CRON] Sweep completed: 0 targets found for 7-day renewal.")
	}

	for _, sub := range targets {
		processSingleAlert(sub, now)
	}
}

// processSingleAlert encapsulates the alert payload dispatching securely to prevent single faults crashing the batch
func processSingleAlert(sub models.Subscription, runTime time.Time) {
	// Acquire Target Identity globally
	var user models.User
	if err := database.DB.First(&user, sub.UserID).Error; err != nil {
		log.Printf("[CRON ERROR] Failed to fetch User %d for Subscription %d: %v\n", sub.UserID, sub.ID, err)
		return
	}

	// Dispatch Payload
	err := SendRenewalAlertEmail(user.Email, user.Name, sub.Name, sub.Cost, sub.IsAutoPay)

	if err == nil {
		// Update the database guard to prevent infinite looping
		if updateErr := database.DB.Model(&sub).Update("last_alerted_at", runTime).Error; updateErr != nil {
			log.Printf("[CRON ERROR] Alert sent, but failed to update last_alerted_at guard for Subscription %d: %v\n", sub.ID, updateErr)
		} else {
			log.Printf("[CRON] Successfully dispatched 7-day alert to %s for tool %s\n", user.Email, sub.Name)
		}
	} else {
		log.Printf("[CRON ERROR] Failed to map Resend trigger for %s's tool %s: %v\n", user.Email, sub.Name, err)
	}
}
