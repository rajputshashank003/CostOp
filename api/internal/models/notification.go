package models

import (
	"time"

	"gorm.io/gorm"
)

// Notification is an in-app notification record surfaced in the dashboard header.
//
// Source:
//   - "alert_triggered" → an alert email was sent by the cron job
//   - "expiring_tomorrow" → auto-generated: subscription expires tomorrow (no explicit alert needed)
//   - "custom_alert"  → a custom/standalone reminder fired today
type Notification struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	OrgID          uint           `gorm:"index;not null" json:"org_id"`
	AlertID        *uint          `gorm:"index" json:"alert_id"`         // the alert that generated this (if any)
	SubscriptionID *uint          `gorm:"index" json:"subscription_id"`  // the subscription this relates to (if any)
	Title          string         `gorm:"not null" json:"title"`
	Message        string         `json:"message"`
	Source         string         `gorm:"not null;default:'alert_triggered'" json:"source"` // "alert_triggered" | "expiring_tomorrow" | "custom_alert"
	IsRead         bool           `gorm:"default:false" json:"is_read"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
