package models

import (
	"time"

	"gorm.io/gorm"
)

// SubscriptionRequest represents a member's request to add a new subscription.
// Flow: member creates request (status="pending") → admin approves or rejects.
// On approval, a new Subscription is automatically created from the request fields.
type SubscriptionRequest struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	RequesterID   uint    `gorm:"index;not null" json:"requester_id"`     // FK → users
	OrgID         uint    `gorm:"index;not null;default:0" json:"org_id"` // FK → organizations
	TeamID        uint    `gorm:"index;not null" json:"team_id"`          // FK → teams
	Name          string  `gorm:"not null" json:"name"`
	Category      string  `json:"category"`
	PlanType      string  `json:"plan_type"`                            // "Individual" | "Team"
	BillingCycle  string  `json:"billing_cycle"`                        // "Monthly" | "Yearly"
	Scope         string  `gorm:"not null;default:'team'" json:"scope"` // "team" | "individual"
	Cost          float64 `json:"cost"`
	SeatCount     int     `gorm:"not null;default:1" json:"seat_count"`
	Justification string  `json:"justification"` // why the member needs this tool

	// Review state
	Status     string `gorm:"not null;default:'pending'" json:"status"` // "pending" | "approved" | "rejected"
	ReviewedBy *uint  `json:"reviewed_by"`                              // FK → users (admin who actioned)

	// Virtual fields enriched at read time
	RequesterName string `gorm:"-" json:"requester_name"`
	ReviewerName  string `gorm:"-" json:"reviewer_name"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
