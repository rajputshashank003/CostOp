package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	urls := mustParseURLs()
	waitMins := mustParseWait()
	port := getEnvOrDefault("PORT", "8080")

	log.Printf("Starting cron job. Checking %d URLs every %d minutes.", len(urls), waitMins)
	for i, u := range urls {
		log.Printf("URL %d: %s", i+1, u)
	}

	// --- HTTP health-check server (required for Render Web Service) ---
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Health server listening on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Health server error: %v", err)
		}
	}()

	// --- Graceful shutdown on SIGINT / SIGTERM ---
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Run once immediately, then on every tick
	checkURLs(urls)

	ticker := time.NewTicker(time.Duration(waitMins) * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			checkURLs(urls)
		case <-ctx.Done():
			log.Println("Shutdown signal received. Stopping...")
			shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			if err := server.Shutdown(shutdownCtx); err != nil {
				log.Printf("Health server shutdown error: %v", err)
			}
			log.Println("Shutdown complete.")
			return
		}
	}
}

// checkURLs pings all URLs concurrently and waits for all to finish.
func checkURLs(urls []string) {
	log.Println("--- Checking URLs ---")

	client := &http.Client{Timeout: 15 * time.Second}

	var wg sync.WaitGroup
	for _, u := range urls {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()
			resp, err := client.Get(url)
			if err != nil {
				log.Printf("[ERROR] %s — %v", url, err)
				return
			}
			defer resp.Body.Close()
			log.Printf("[%s] %s — %s", statusLabel(resp.StatusCode), url, resp.Status)
		}(u)
	}
	wg.Wait()
}

// statusLabel returns SUCCESS for 2xx, WARN for other non-errors, ERROR otherwise.
func statusLabel(code int) string {
	switch {
	case code >= 200 && code < 300:
		return "SUCCESS"
	case code >= 400 && code < 500:
		return "WARN"
	default:
		return "ERROR"
	}
}

// mustParseURLs reads and validates the URL env var.
func mustParseURLs() []string {
	raw := os.Getenv("URL")
	if raw == "" {
		log.Fatal("URL environment variable must be set")
	}

	var urls []string
	for _, u := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(u); trimmed != "" {
			urls = append(urls, trimmed)
		}
	}

	if len(urls) == 0 {
		log.Fatal("No valid URLs found in URL environment variable")
	}
	return urls
}

// mustParseWait reads and validates the WAIT env var (minutes).
func mustParseWait() int {
	waitStr := getEnvOrDefault("WAIT", "8")
	waitMins, err := strconv.Atoi(waitStr)
	if err != nil || waitMins <= 0 {
		log.Fatalf("WAIT must be a positive integer (minutes), got: %q", waitStr)
	}
	return waitMins
}

// getEnvOrDefault returns the env var value or a fallback.
func getEnvOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}