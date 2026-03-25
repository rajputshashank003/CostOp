package models

import (
	"time"

	"gorm.io/gorm"
)

type Team struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	OwnerID   uint           `gorm:"not null" json:"owner_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations (used for preloading)
	Members []TeamMember `gorm:"foreignKey:TeamID" json:"-"`
	Invites []TeamInvite `gorm:"foreignKey:TeamID" json:"-"`
}

type TeamMember struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TeamID      uint      `gorm:"index;not null" json:"team_id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	Role        string    `gorm:"default:'member'" json:"role"` // 'owner', 'member'
	Designation string    `json:"designation"`                  // e.g., 'frontend', 'design'
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type TeamInvite struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TeamID      uint      `gorm:"index;not null" json:"team_id"`
	Email       string    `gorm:"not null" json:"email"`
	Designation string    `json:"designation"`
	Token       string    `gorm:"uniqueIndex;not null" json:"token"`
	Status      string    `gorm:"default:'pending'" json:"status"` // 'pending', 'accepted'
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
