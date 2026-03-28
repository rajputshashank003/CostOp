package models

import (
	"time"

	"gorm.io/gorm"
)

// Organization represents a workspace/company. All teams, users, and subscriptions
// belong to exactly one organization. This replaces the old pattern of inferring
// org membership by traversing the team_members graph.
type Organization struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	OwnerID   uint           `gorm:"not null" json:"owner_id"` // creator/admin user
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
