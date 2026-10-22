package models

import (
	"time"

	"gorm.io/gorm"
)

// Order represents a billing transaction or plan purchase for an organization.
type Order struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	OrgID             uint           `gorm:"index;not null" json:"org_id"`
	UserID            uint           `gorm:"index;not null" json:"user_id"`
	RazorpayOrderID   string         `gorm:"index;not null" json:"razorpay_order_id"`
	RazorpayPaymentID string         `gorm:"index" json:"razorpay_payment_id,omitempty"`
	Plan              string         `gorm:"not null;default:'pro'" json:"plan"`
	Interval          string         `gorm:"not null;default:'monthly'" json:"interval"` // "monthly" | "yearly"
	Amount            float64        `gorm:"not null" json:"amount"`                     // in rupees, e.g. 999.00 or 9588.00
	Currency          string         `gorm:"not null;default:'INR'" json:"currency"`
	Status            string         `gorm:"not null;default:'created'" json:"status"` // "created" | "paid" | "failed"
	Receipt           string         `json:"receipt"`
	FailureReason     string         `json:"failure_reason,omitempty"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}
