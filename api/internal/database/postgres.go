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
		&models.Organization{},
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

	DB = db
}

// migrateOrganizations is an idempotent, one-time migration that creates
// Organization rows from existing Team.OwnerID groupings and backfills
// org_id on users, teams, subscriptions, and subscription_requests.
func migrateOrganizations(db *gorm.DB) {
	// Skip if all users already have an org_id set
	var unmigrated int64
	db.Model(&models.User{}).Where("org_id = 0 OR org_id IS NULL").Count(&unmigrated)
	if unmigrated == 0 {
		return
	}

	log.Printf("[MIGRATION] Found %d users without org_id — backfilling organizations...", unmigrated)

	// Find all unique workspace owners (each represents one org)
	var ownerIDs []uint
	db.Model(&models.Team{}).Distinct("owner_id").Pluck("owner_id", &ownerIDs)

	for _, ownerID := range ownerIDs {
		// Find the owner's first team to use its name as the org name
		var firstTeam models.Team
		if err := db.Where("owner_id = ?", ownerID).First(&firstTeam).Error; err != nil {
			continue
		}

		// Create Organization if one doesn't already exist for this owner
		var org models.Organization
		if err := db.Where("owner_id = ?", ownerID).First(&org).Error; err != nil {
			org = models.Organization{
				Name:    firstTeam.Name,
				OwnerID: ownerID,
			}
			db.Create(&org)
		}

		// Backfill org_id on all teams with this owner
		db.Model(&models.Team{}).Where("owner_id = ? AND (org_id = 0 OR org_id IS NULL)", ownerID).Update("org_id", org.ID)

		// Backfill org_id on all users who are members of these teams
		db.Exec(`
			UPDATE users SET org_id = ?
			WHERE (org_id = 0 OR org_id IS NULL)
			  AND id IN (
			    SELECT DISTINCT tm.user_id FROM team_members tm
			    JOIN teams t ON t.id = tm.team_id
			    WHERE t.owner_id = ?
			  )
		`, org.ID, ownerID)

		// Backfill org_id on subscriptions owned by users in this org
		db.Exec(`
			UPDATE subscriptions SET org_id = ?
			WHERE (org_id = 0 OR org_id IS NULL)
			  AND (user_id IN (SELECT id FROM users WHERE org_id = ?)
			       OR owner_id IN (SELECT id FROM users WHERE org_id = ?))
		`, org.ID, org.ID, org.ID)

		// Backfill org_id on subscription_requests from users in this org
		db.Exec(`
			UPDATE subscription_requests SET org_id = ?
			WHERE (org_id = 0 OR org_id IS NULL)
			  AND requester_id IN (SELECT id FROM users WHERE org_id = ?)
		`, org.ID, org.ID)
	}

	log.Println("[MIGRATION] Organization backfill complete.")
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
