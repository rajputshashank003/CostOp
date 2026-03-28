package main

import (
	"log"
	"time"

	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/routes"

	// "costop/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load Configuration natively
	config.Load()

	// Connect to Database
	database.Connect()

	// Setup Router
	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "https://costop1.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Initializing Routes
	routes.SetupRoutes(r)

	// Start Cron Schedulers
	// services.StartCronJobs()

	// Start server natively
	log.Printf("Server is running on port %s\n", config.Port)
	r.Run(":" + config.Port)
}
