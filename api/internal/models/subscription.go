package models

import (
	"time"

	"gorm.io/gorm"
)

// Subscription represents a SaaS tool adding to the platform.
type Subscription struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	UserID           uint       `gorm:"index;not null" json:"user_id"`
	TeamID           uint       `gorm:"index;not null" json:"team_id"`
	Name             string     `gorm:"not null" json:"name"` // e.g. "Zoom", "Slack"
	Category         string     `json:"category"`             // e.g. "Communication", "Design"
	PlanType         string     `json:"plan_type"`            // "Individual" or "Team"
	TeamName         string     `json:"team_name"`
	TeamMembersCount int        `json:"team_members_count"`
	BillingCycle     string     `json:"billing_cycle"` // "Monthly", "Yearly"
	Cost             float64    `json:"cost"`
	IsAutoPay        bool       `json:"is_auto_pay"` // Is this a recurring charge?
	StartDate        time.Time  `json:"start_date"`
	NextBillingDate  time.Time  `json:"next_billing_date"`
	Status           string     `gorm:"default:'active'" json:"status"`
	ArchivedBy       uint       `json:"archived_by"`
	LastAlertedAt    *time.Time `json:"last_alerted_at"`

	// Virtual mapped properties for frontend visualization
	AddedByName    string `gorm:"-" json:"added_by_name"`
	ArchivedByName string `gorm:"-" json:"archived_by_name"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
