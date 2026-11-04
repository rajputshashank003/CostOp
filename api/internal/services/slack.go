package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"costop/internal/models"
)

var slackHTTPClient = &http.Client{
	Timeout: 5 * time.Second,
	// Never follow redirects: the request must only ever reach Slack itself
	CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
}

// IsSlackWebhookURL accepts only https URLs on Slack's webhook host.
func IsSlackWebhookURL(raw string) bool {
	u, err := url.Parse(strings.TrimSpace(raw))
	return err == nil && u.Scheme == "https" && u.Host == "hooks.slack.com" && u.User == nil && strings.HasPrefix(u.Path, "/")
}

// SendSlackWebhook sends an arbitrary JSON payload to a Slack incoming webhook.
func SendSlackWebhook(webhookURL string, payload interface{}) error {
	if !IsSlackWebhookURL(webhookURL) {
		return fmt.Errorf("not a Slack webhook url")
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := slackHTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("slack returned non-200 status: %d", resp.StatusCode)
	}

	return nil
}

// SendSlackTestMessage posts a simple test verification message to the Slack webhook.
func SendSlackTestMessage(webhookURL string) error {
	payload := map[string]interface{}{
		"text": "🎉 CostOp Slack Webhook connected successfully! You will now receive subscription renewal alerts in this channel.",
		"blocks": []map[string]interface{}{
			{
				"type": "header",
				"text": map[string]string{
					"type":  "plain_text",
					"text":  "🎉 CostOp Webhook Connected",
					"emoji": "true",
				},
			},
			{
				"type": "section",
				"text": map[string]string{
					"type": "mrkdwn",
					"text": "Success! Your CostOp workspace is now connected to this Slack channel.\nYou will receive proactive renewal and expiration warnings before your software subscriptions charge.",
				},
			},
		},
	}
	return SendSlackWebhook(webhookURL, payload)
}

// SendSlackAlert posts a formatted subscription renewal/expiration alert to Slack.
func SendSlackAlert(webhookURL string, sub models.Subscription, offset int, cost string) error {
	actionWord := "renews"
	if !sub.IsAutoPay {
		actionWord = "expires"
	}

	var dueText string
	if offset == 0 {
		dueText = "*Today*"
	} else {
		dueText = fmt.Sprintf("in *%d day(s)*", offset)
	}

	autoPayText := "Enabled"
	if !sub.IsAutoPay {
		autoPayText = "Disabled (Manual payment required)"
	}

	payload := map[string]interface{}{
		"text": fmt.Sprintf("🔔 Renewal Alert: %s %s %s (%s)", sub.Name, actionWord, dueText, cost),
		"blocks": []map[string]interface{}{
			{
				"type": "header",
				"text": map[string]string{
					"type":  "plain_text",
					"text":  "🔔 CostOp Subscription Alert",
					"emoji": "true",
				},
			},
			{
				"type": "section",
				"text": map[string]string{
					"type": "mrkdwn",
					"text": fmt.Sprintf("*%s* %s %s.\n*Amount:* %s | *Cycle:* %s | *Auto-Pay:* %s",
						sub.Name, actionWord, dueText, cost, sub.BillingCycle, autoPayText),
				},
			},
		},
	}

	return SendSlackWebhook(webhookURL, payload)
}
