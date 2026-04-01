package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env if it exists (for local testing; in Docker, env vars are often passed directly)
	_ = godotenv.Load()

	urlStr := os.Getenv("URL")
	if urlStr == "" {
		log.Fatal("URL environment variable must be set")
	}

	// Split by comma and trim spaces
	var urls []string
	for _, u := range strings.Split(urlStr, ",") {
		trimmed := strings.TrimSpace(u)
		if trimmed != "" {
			urls = append(urls, trimmed)
		}
	}

	if len(urls) == 0 {
		log.Fatal("No valid URLs found in URL environment variable")
	}

	waitStr := os.Getenv("WAIT")
	if waitStr == "" {
		waitStr = "8" // Default to 8 minutes if not provided
	}

	waitMins, err := strconv.Atoi(waitStr)
	if err != nil {
		log.Fatalf("Invalid WAIT value: %v", err)
	}

	log.Printf("Starting cron job. Checking %d URLs every %d minutes.", len(urls), waitMins)
	for i, u := range urls {
		log.Printf("URL %d: %s", i+1, u)
	}

	ticker := time.NewTicker(time.Duration(waitMins) * time.Minute)
	defer ticker.Stop()

	// Initial hit right away
	checkURLs(urls)

	// Block and loop at the ticker interval
	for range ticker.C {
		checkURLs(urls)
	}
}

func checkURLs(urls []string) {
	log.Println("--- Checking URLs ---")
	client := &http.Client{Timeout: 15 * time.Second}

	for _, u := range urls {
		go func(url string) {
			resp, err := client.Get(url)
			if err != nil {
				log.Printf("[ERROR] Failed to reach %s: %v", url, err)
				return
			}
			defer resp.Body.Close()
			log.Printf("[SUCCESS] %s responded with status: %s", url, resp.Status)
		}(u)
	}
}
