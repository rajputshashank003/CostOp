package models

import "time"

// SubscriptionAssignment tracks which users have access to a specific subscription seat.
// This is the single source of truth for access — both team-granted and individual.
//
// Source: "team" = auto-created when a team is granted access.
//         "individual" = manually assigned by an admin.
// SourceTeamID: links to the SubscriptionTeam grant that created this row (NULL if individual).
//
// Seat utilization = COUNT(*) FROM subscription_assignments WHERE subscription_id = X
type SubscriptionAssignment struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	SubscriptionID uint      `gorm:"uniqueIndex:idx_sa_sub_user;index:idx_sa_sub;not null" json:"subscription_id"`
	UserID         uint      `gorm:"uniqueIndex:idx_sa_sub_user;index:idx_sa_user;not null" json:"user_id"`
	Source         string    `gorm:"not null;default:'individual'" json:"source"`    // "team" | "individual"
	SourceTeamID   *uint     `gorm:"index:idx_sa_source_team" json:"source_team_id"` // which team grant created this
	AssignedAt     time.Time `json:"assigned_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
