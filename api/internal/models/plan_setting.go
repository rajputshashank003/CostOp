package models

import (
	"time"

	"gorm.io/gorm"
)

// PlanSetting stores dynamic pricing configuration for subscription plans.
type PlanSetting struct {
	ID                    uint           `gorm:"primaryKey" json:"id"`
	PlanCode              string         `gorm:"uniqueIndex;not null;default:'pro'" json:"plan_code"`
	PlanName              string         `gorm:"not null;default:'CostOp Pro'" json:"plan_name"`
	MonthlyPrice          float64        `gorm:"not null;default:999.00" json:"monthly_price"`
	YearlyDiscountPercent float64        `gorm:"not null;default:20.00" json:"yearly_discount_percent"`
	Currency              string         `gorm:"default:'INR'" json:"currency"`
	MaxMembers            int            `gorm:"default:100" json:"max_members"`
	IsActive              bool           `gorm:"default:true" json:"is_active"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}
