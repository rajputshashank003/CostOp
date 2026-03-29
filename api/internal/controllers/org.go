package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"errors"
	"time"

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
// Falls back to unscoped query for un-migrated data (orgID=0).
func orgSubscriptionQuery(orgID uint, status string) *gorm.DB {
	if orgID == 0 {
		return database.DB.Where("status = ?", status)
	}
	return database.DB.Where("org_id = ? AND status = ?", orgID, status)
}

// ErrNoSeats is returned when no seats are available for assignment.
var ErrNoSeats = errors.New("no seats available")

// acquireSeats atomically assigns seats to the given userIDs on a subscription.
//
// It locks the subscription row with SELECT FOR UPDATE to prevent race conditions,
// counts occupied seats while the lock is held, then inserts assignment rows only
// for users where seats are still available.
//
// Returns:
//   - assigned: user IDs that were successfully assigned a seat
//   - skipped:  user IDs that could not be assigned (seats exhausted or already assigned)
//   - err:      database error (nil on success, even if some were skipped)
func acquireSeats(
	tx *gorm.DB,
	subID uint,
	userIDs []uint,
	source string,
	teamID *uint,
) (assigned []uint, skipped []uint, err error) {
	// 1. Lock the subscription row — concurrent callers block here
	var sub models.Subscription
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&sub, subID).Error; err != nil {
		return nil, nil, err
	}

	// 2. Count currently occupied seats while the row is locked
	var occupied int64
	if err := tx.Model(&models.SubscriptionAssignment{}).
		Where("subscription_id = ?", subID).
		Count(&occupied).Error; err != nil {
		return nil, nil, err
	}

	available := sub.SeatCount - int(occupied)

	// 3. Assign seats one by one, respecting the limit
	for _, uid := range userIDs {
		// Skip users who already have an assignment (idempotent)
		var exists int64
		tx.Model(&models.SubscriptionAssignment{}).
			Where("subscription_id = ? AND user_id = ?", subID, uid).
			Count(&exists)
		if exists > 0 {
			continue // already assigned, don't count as skipped
		}

		if available <= 0 {
			skipped = append(skipped, uid)
			continue
		}

		if err := tx.Create(&models.SubscriptionAssignment{
			SubscriptionID: subID,
			UserID:         uid,
			Source:         source,
			SourceTeamID:   teamID,
			AssignedAt:     time.Now(),
		}).Error; err != nil {
			return assigned, skipped, err
		}

		assigned = append(assigned, uid)
		available--
	}

	return assigned, skipped, nil
}
