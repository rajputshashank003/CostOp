package models

import "time"

// SubscriptionTeam is a junction table declaring that a team has been granted
// access to a subscription. Actual user-level access is materialized into
// SubscriptionAssignment rows — this table is the "policy" record.
type SubscriptionTeam struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	SubscriptionID uint      `gorm:"uniqueIndex:idx_sub_team;not null" json:"subscription_id"`
	TeamID         uint      `gorm:"uniqueIndex:idx_sub_team;not null" json:"team_id"`
	GrantedAt      time.Time `json:"granted_at"`
	GrantedBy      uint      `json:"granted_by"` // admin who granted access
}
