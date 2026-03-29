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

	// Optimize connection pooling to prevent parallel request latency
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(20)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
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

	// Add performance indexes for the dashboard hot path
	// db.Exec("CREATE INDEX IF NOT EXISTS idx_subscriptions_org_status ON subscriptions(org_id, status) WHERE deleted_at IS NULL")
	// db.Exec("CREATE INDEX IF NOT EXISTS idx_subscription_assignments_sub_id ON subscription_assignments(subscription_id)")
	// db.Exec("CREATE INDEX IF NOT EXISTS idx_subscription_teams_sub_id ON subscription_teams(subscription_id)")
	// db.Exec("CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal ON subscriptions(org_id, status, is_auto_pay, next_billing_date) WHERE deleted_at IS NULL")

	DB = db
}
