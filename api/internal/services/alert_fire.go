package services

import (
	"fmt"
	"log"
	"time"

	"costop/internal/database"
	"costop/internal/models"
)

// fireSubscriptionAlert sends emails for a renewal/expiration alert and creates an in-app notification.
func fireSubscriptionAlert(alert models.Alert, sub models.Subscription, offset int, now time.Time) {
	actionWord := "renews"
	if !sub.IsAutoPay {
		actionWord = "expires"
	}

	currency := OrgCurrency(sub.OrgID)
	cost := FormatMoney(sub.Cost, currency)

	var title, message string
	if offset == 0 {
		title = fmt.Sprintf("%s %s today", sub.Name, actionWord)
		message = fmt.Sprintf("Your subscription to %s %s today (%s).", sub.Name, actionWord, cost)
	} else {
		title = fmt.Sprintf("%s %s in %d day(s)", sub.Name, actionWord, offset)
		message = fmt.Sprintf("Your subscription to %s %s in %d day(s) for %s.", sub.Name, actionWord, offset, cost)
	}

	for _, email := range alert.Recipients {
		if err := SendAlertEmail(email, title, message, sub.Name, cost, offset, sub.IsAutoPay); err != nil {
			log.Printf("[CRON ERROR] Failed to send alert email to %s (alert %d): %v\n", email, alert.ID, err)
		} else {
			log.Printf("[CRON] Alert email sent to %s for subscription %s (offset=%d)\n", email, sub.Name, offset)
		}
	}

	// Pro Tier: Fire alert to Slack if configured
	if alert.OrgID > 0 {
		var org models.Organization
		if err := database.DB.First(&org, alert.OrgID).Error; err == nil {
			if org.Plan == "pro" && org.SlackWebhookURL != "" {
				go func(webhook string, s models.Subscription, off int) {
					defer func() {
						if r := recover(); r != nil {
							log.Printf("[SLACK PANIC RECOVERED] %v\n", r)
						}
					}()
					if err := SendSlackAlert(webhook, s, off, cost); err != nil {
						log.Printf("[SLACK ALERT ERROR] Failed to send alert to Slack: %v\n", err)
					} else {
						log.Printf("[SLACK ALERT] Alert successfully sent to Slack for %s\n", s.Name)
					}
				}(org.SlackWebhookURL, sub, offset)
			}
		}
	}

	createNotification(alert.UserID, alert.OrgID, &alert.ID, alert.SubscriptionID,
		title, message, "alert_triggered")

	markOffsetTriggered(alert, offset)
}

// fireCustomAlert sends emails for a custom/standalone reminder and creates an in-app notification.
func fireCustomAlert(alert models.Alert, now time.Time) {
	title := fmt.Sprintf("Reminder: %s", alert.CustomTitle)
	message := fmt.Sprintf("Your custom reminder \"%s\" is due today.", alert.CustomTitle)

	for _, email := range alert.Recipients {
		if err := SendCustomAlertEmail(email, title, message); err != nil {
			log.Printf("[CRON ERROR] Failed to send custom alert email to %s (alert %d): %v\n", email, alert.ID, err)
		} else {
			log.Printf("[CRON] Custom alert email sent to %s (alert %d)\n", email, alert.ID)
		}
	}

	// Pro Tier: Fire custom alert to Slack if configured
	if alert.OrgID > 0 {
		var org models.Organization
		if err := database.DB.First(&org, alert.OrgID).Error; err == nil {
			if org.Plan == "pro" && org.SlackWebhookURL != "" {
				go func(webhook string, t, m string) {
					defer func() {
						if r := recover(); r != nil {
							log.Printf("[SLACK PANIC RECOVERED] %v\n", r)
						}
					}()
					payload := map[string]interface{}{
						"text": fmt.Sprintf("🔔 CostOp Reminder: %s", t),
						"blocks": []map[string]interface{}{
							{
								"type": "header",
								"text": map[string]string{"type": "plain_text", "text": "🔔 CostOp Custom Reminder"},
							},
							{
								"type": "section",
								"text": map[string]string{"type": "mrkdwn", "text": fmt.Sprintf("*%s*\n%s", t, m)},
							},
						},
					}
					_ = SendSlackWebhook(webhook, payload)
				}(org.SlackWebhookURL, title, message)
			}
		}
	}

	createNotification(alert.UserID, alert.OrgID, &alert.ID, nil,
		title, message, "custom_alert")

	markOffsetTriggered(alert, 0)

	// Custom alerts only fire once — mark as triggered
	database.DB.Model(&models.Alert{}).Where("id = ?", alert.ID).Update("status", "triggered")
}
