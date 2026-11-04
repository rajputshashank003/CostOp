package models

import (
	"time"

	"gorm.io/gorm"
)

// Category represents a subscription category (e.g., Productivity, Marketing).
type Category struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	OrgID     uint           `gorm:"uniqueIndex:idx_category_org_name;not null;default:0" json:"-"` // 0 = shared
	Name      string         `gorm:"uniqueIndex:idx_category_org_name;not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
