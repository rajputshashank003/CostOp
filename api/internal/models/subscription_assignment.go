package models

import "time"

// SubscriptionAssignment tracks which users are assigned to a specific subscription seat.
// This is the industry-standard approach for calculating available seats accurately:
//
//	available_seats = subscription.seat_count - COUNT(subscription_assignments WHERE subscription_id = X)
type SubscriptionAssignment struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	SubscriptionID uint      `gorm:"index;not null" json:"subscription_id"`
	UserID         uint      `gorm:"index;not null" json:"user_id"`
	AssignedAt     time.Time `json:"assigned_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
