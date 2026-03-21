package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Email         string         `gorm:"uniqueIndex;not null" json:"email"`
	Name          string         `json:"name"`
	AvatarURL     string         `json:"avatar_url"`
	GoogleID      string         `gorm:"uniqueIndex" json:"google_id"`
	DefaultTeamID uint           `json:"default_team_id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
