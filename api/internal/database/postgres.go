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
		&models.Alert{},
		&models.Notification{},
		&models.Order{},
		&models.PlanSetting{},
	)

	// Seed default Pro plan setting if absent
	var count int64
	db.Model(&models.PlanSetting{}).Where("plan_code = ?", "pro").Count(&count)
	if count == 0 {
		db.Create(&models.PlanSetting{
			PlanCode:              "pro",
			PlanName:              "CostOp Pro",
			MonthlyPrice:          999.00,
			YearlyDiscountPercent: 20.00,
			Currency:              "INR",
			MaxMembers:            100,
			IsActive:              true,
		})
	}

	// Allow email/pass users without google_id to coexist without duplicate key error on empty strings
	db.Exec("DROP INDEX IF EXISTS idx_users_google_id")
	db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id_nonempty ON users(google_id) WHERE google_id IS NOT NULL AND google_id != ''")
	db.Exec("UPDATE users SET is_email_verified = true WHERE is_email_verified IS NULL OR email = 'demo@costop.in'")

	DB = db
}
