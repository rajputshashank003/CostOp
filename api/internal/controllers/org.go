package controllers

import (
	"costop/internal/database"
	"costop/internal/models"

	"gorm.io/gorm"
)

// resolveOrgID returns the org_id for a given user.
func resolveOrgID(userID uint) (uint, error) {
	var user models.User
	if err := database.DB.Select("org_id").First(&user, userID).Error; err != nil {
		return 0, err
	}
	return user.OrgID, nil
}

// orgSubscriptionQuery returns a base GORM query for all subscriptions
// belonging to a given organization, filtered by status.
// This replaces the old 3-level nested team-graph subquery.
func orgSubscriptionQuery(orgID uint, status string) *gorm.DB {
	return database.DB.Where("org_id = ? AND status = ?", orgID, status)
}
