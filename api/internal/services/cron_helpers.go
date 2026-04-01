package services

import (
	"log"

	"costop/internal/database"
	"costop/internal/models"
	"time"
)

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

// markOffsetTriggered appends the offset to TriggeredOffsets in the DB.
func markOffsetTriggered(alert models.Alert, offset int) {
	newTriggered := append(alert.TriggeredOffsets, offset)
	if err := database.DB.Model(&models.Alert{}).
		Where("id = ?", alert.ID).
		Update("triggered_offsets", models.IntArray(newTriggered)).Error; err != nil {
		log.Printf("[CRON ERROR] Failed to update triggered_offsets for alert %d: %v\n", alert.ID, err)
	}
}
