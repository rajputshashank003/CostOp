package models

import (
	"time"

	"gorm.io/gorm"
)

// Subscription represents a SaaS tool tracked on the platform.
//
// TeamID is DEPRECATED — kept for backward compatibility during migration.
// Use the subscription_teams junction table for team grants instead.
//
// Scope: UI display hint only ("team" | "individual" | "organization").
// Access is always resolved from subscription_assignments.
//
// OwnerID: the user who actually pays/purchased the subscription.
// SeatCount: total purchased seats; enforced via subscription_assignments count.
type Subscription struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	UserID          uint       `gorm:"index;not null" json:"user_id"`        // who added it to the system
	OwnerID         uint       `gorm:"index;not null" json:"owner_id"`       // who actually pays for it
	TeamID          *uint      `gorm:"index" json:"team_id"`                 // DEPRECATED: use subscription_teams
	Scope           string     `gorm:"not null;default:'team'" json:"scope"` // UI hint: "team" | "individual" | "organization"
	Name            string     `gorm:"not null" json:"name"`
	Category        string     `json:"category"`
	PlanType        string     `json:"plan_type"`     // "Individual" or "Team"
	BillingCycle    string     `json:"billing_cycle"` // "Monthly", "Yearly"
	Cost            float64    `json:"cost"`
	SeatCount       int        `gorm:"not null;default:1" json:"seat_count"`
	IsAutoPay       bool       `json:"is_auto_pay"`
	StartDate       time.Time  `json:"start_date"`
	NextBillingDate time.Time  `json:"next_billing_date"`
	Status          string     `gorm:"default:'active'" json:"status"` // "active" | "archived"
	ArchivedBy      *uint      `json:"archived_by"`
	LastAlertedAt   *time.Time `json:"last_alerted_at"`

	// Virtual fields — enriched at query time, not stored in DB
	AddedByName    string `gorm:"-" json:"added_by_name"`
	OwnerName      string `gorm:"-" json:"owner_name"`
	ArchivedByName string `gorm:"-" json:"archived_by_name"`
	AssignedCount  int    `gorm:"-" json:"assigned_count"`
	AvailableSeats int    `gorm:"-" json:"available_seats"`
	OccupiedSeats  int    `gorm:"-" json:"occupied_seats"` // total materialized assignments

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
