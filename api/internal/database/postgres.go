package database

import (
	"fmt"
	"log"

	"costop/internal/config"
	"costop/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// dsn is managed globally by config.go in the config.PostgresDSN property!
	dsn := config.PostgresDSN

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v\n", err)
	}

	fmt.Println("Connected to PostgreSQL successfully")

	db.AutoMigrate(&models.User{}, &models.Team{}, &models.TeamMember{}, &models.TeamInvite{}, &models.Subscription{}, &models.Category{})

	DB = db
}
