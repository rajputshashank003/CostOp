package services

import (
	"log"
	"time"
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

		for range ticker.C {
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
