package config

import (
	"log"
	"os"
	"strconv"
	"strings"

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

	// Admin
	AdminEmail string

	// Razorpay
	RazorpayKeyID         string
	RazorpayKeySecret     string
	RazorpayWebhookSecret string

	// Currency: USD→INR rate used when the live FX source is unreachable
	FXUSDINRFallback float64

	// Demo account (for payment-gateway verification); not created when unset
	DemoUserPassword string
)

// Load initializes all environment variables natively into the Go process.
func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables.")
	}

	PostgresDSN = getEnvOrDefault("POSTGRES_DSN", "host=localhost user=postgres password=postgres dbname=costop port=5432 sslmode=disable")
	// Tokens are forgeable with a known or short secret, so refuse to start without a strong one
	JWTSecret = strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if len(JWTSecret) < 32 || strings.Contains(strings.ToLower(JWTSecret), "change_in_production") {
		log.Fatal("JWT_SECRET must be set to a random value of at least 32 characters (e.g. `openssl rand -hex 32`)")
	}
	GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")
	ResendAPIKey = os.Getenv("RESEND_API_KEY")
	GeminiAPIKey = os.Getenv("GEMINI_API_KEY")
	FrontendURL = getEnvOrDefault("FRONTEND_URL", getEnvOrDefault("VITE_FRONTEND_URL", "http://localhost:5173"))
	Port = getEnvOrDefault("PORT", "8081")
	HealthURLs = os.Getenv("URL")
	HealthWait = getEnvOrDefault("HEALTH_WAIT", "8")
	RunUptimeCron = os.Getenv("RUN_UPTIME_CRON") == "true"
	AdminEmail = os.Getenv("ADMIN_EMAIL")
	DemoUserPassword = os.Getenv("DEMO_USER_PASSWORD")

	RazorpayKeyID = os.Getenv("RAZORPAY_KEY_ID")
	RazorpayKeySecret = os.Getenv("RAZORPAY_KEY_SECRET")
	RazorpayWebhookSecret = os.Getenv("RAZORPAY_WEBHOOK_SECRET")

	FXUSDINRFallback = 95.0
	if v, err := strconv.ParseFloat(os.Getenv("FX_USD_INR_FALLBACK"), 64); err == nil && v > 0 {
		FXUSDINRFallback = v
	}

	if RazorpayKeyID == "" || RazorpayKeySecret == "" {
		log.Println("[CONFIG WARNING] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in environment.")
	}
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
