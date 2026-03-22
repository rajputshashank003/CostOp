package main

import (
	"costop/internal/models"
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=postgres password=postgres dbname=postgres port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return
	}
	var subs []models.Subscription
	db.Find(&subs)

	current := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	monthEnd := current.AddDate(0, 1, -1).Add(24*time.Hour - time.Nanosecond)

	total := float64(0)
	for i, sub := range subs {
		after := sub.StartDate.After(monthEnd)
		if !after {
			total += sub.Cost
		}
		fmt.Printf("[%d] %s | Cost: %v | StartDate: %v | After(Jan2026): %v\n", i, sub.Name, sub.Cost, sub.StartDate.Format("2006-01-02"), after)
	}
	fmt.Printf("Total if we allow: %v\n", total)
}
