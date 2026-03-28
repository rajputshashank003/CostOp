package database

import (
	"fmt"
	"log"
	"time"

	"costop/internal/config"
	"costop/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// dsn is managed globally by config.go in the config.PostgresDSN property!
	dsn := config.PostgresDSN

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false,
	})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v\n", err)
	}

	fmt.Println("Connected to PostgreSQL successfully")

	db.AutoMigrate(
		&models.User{},
		&models.Team{},
		&models.TeamMember{},
		&models.TeamInvite{},
		&models.Category{},
		&models.Subscription{},
		&models.SubscriptionAssignment{},
		&models.SubscriptionTeam{},
		&models.SubscriptionRequest{},
	)

	// Backfill subscription_teams and materialized assignments from legacy TeamID data.
	// migrateSubscriptionTeams(db)

	DB = db
}

// migrateSubscriptionTeams is an idempotent, one-time migration that creates
// SubscriptionTeam policy rows and materialized SubscriptionAssignment rows
// from the legacy Subscription.TeamID column.
func migrateSubscriptionTeams(db *gorm.DB) {
	var subs []models.Subscription
	db.Where("team_id IS NOT NULL").Find(&subs)

	if len(subs) == 0 {
		return
	}

	log.Printf("[MIGRATION] Found %d subscriptions with legacy TeamID — backfilling subscription_teams...", len(subs))

	for _, s := range subs {
		teamID := *s.TeamID

		// 1. Create SubscriptionTeam if missing
		var stCount int64
		db.Model(&models.SubscriptionTeam{}).
			Where("subscription_id = ? AND team_id = ?", s.ID, teamID).
			Count(&stCount)

		if stCount == 0 {
			db.Create(&models.SubscriptionTeam{
				SubscriptionID: s.ID,
				TeamID:         teamID,
				GrantedAt:      s.CreatedAt,
				GrantedBy:      s.OwnerID,
			})
		}

		// 2. Materialize assignments for all team members (skip if already assigned)
		var members []models.TeamMember
		db.Where("team_id = ?", teamID).Find(&members)

		for _, m := range members {
			var saCount int64
			db.Model(&models.SubscriptionAssignment{}).
				Where("subscription_id = ? AND user_id = ?", s.ID, m.UserID).
				Count(&saCount)

			if saCount == 0 {
				db.Create(&models.SubscriptionAssignment{
					SubscriptionID: s.ID,
					UserID:         m.UserID,
					Source:         "team",
					SourceTeamID:   &teamID,
					AssignedAt:     time.Now(),
				})
			}
		}
	}

	// 3. Backfill source/source_team_id on existing assignments that are missing them
	db.Exec(`
		UPDATE subscription_assignments sa
		SET source = 'team',
		    source_team_id = st.team_id
		FROM subscription_teams st
		JOIN team_members tm ON tm.team_id = st.team_id AND tm.user_id = sa.user_id
		WHERE sa.subscription_id = st.subscription_id
		  AND (sa.source IS NULL OR sa.source = '')
	`)

	log.Println("[MIGRATION] subscription_teams backfill complete.")
}
