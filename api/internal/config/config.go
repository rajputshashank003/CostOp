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
	GeminiAPIKey string

	// App
	FrontendURL string
	Port        string

	// Health Ping Cron
	HealthURLs    string
	HealthWait    string
	RunUptimeCron bool

	// Razorpay
	RazorpayKeyID         string
	RazorpayKeySecret     string
	RazorpayWebhookSecret string
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
	GeminiAPIKey = os.Getenv("GEMINI_API_KEY")
	FrontendURL = getEnvOrDefault("VITE_FRONTEND_URL", "http://localhost:5173")
	Port = getEnvOrDefault("PORT", "8081")
	HealthURLs = os.Getenv("URL")
	HealthWait = getEnvOrDefault("HEALTH_WAIT", "8")
	RunUptimeCron = os.Getenv("RUN_UPTIME_CRON") == "true"

	RazorpayKeyID = getEnvOrDefault("RAZORPAY_KEY_ID", "rzp_test_Tr306sywUEBzzY")
	RazorpayKeySecret = getEnvOrDefault("RAZORPAY_KEY_SECRET", "aUfXOSRzFnsxRkt28CAG23x5")
	RazorpayWebhookSecret = getEnvOrDefault("RAZORPAY_WEBHOOK_SECRET", "costop_razorpay_secret_2026")
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
