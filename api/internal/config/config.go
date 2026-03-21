package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	// Database
	PostgresDSN string

	// Auth & Security
	JWTSecret      string
	GoogleClientID string

	// Services
	ResendAPIKey string

	// App
	FrontendURL string
	Port        string
)

// Load initializes all environment variables natively into the Go process.
func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables.")
	}

	PostgresDSN = getEnvOrDefault("POSTGRES_DSN", "host=localhost user=postgres password=postgres dbname=costop port=5432 sslmode=disable")
	JWTSecret = getEnvOrDefault("JWT_SECRET", "supersecret_change_in_production")
	GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")
	ResendAPIKey = os.Getenv("RESEND_API_KEY")
	FrontendURL = getEnvOrDefault("VITE_FRONTEND_URL", "http://localhost:5173")
	Port = getEnvOrDefault("PORT", "8081")
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
