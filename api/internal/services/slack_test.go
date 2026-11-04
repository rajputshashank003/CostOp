package services

import "testing"

func TestIsSlackWebhookURL(t *testing.T) {
	ok := []string{"https://hooks.slack.com/services/T000/B000/xyz"}
	bad := []string{
		"http://hooks.slack.com/services/x",
		"https://hooks.slack.com.evil.test/services/x",
		"https://evil.test/https://hooks.slack.com/",
		"https://user@hooks.slack.com/services/x",
		"https://hooks.slack.com:8443/services/x",
		"",
	}
	for _, u := range ok {
		if !IsSlackWebhookURL(u) {
			t.Errorf("expected %q to be accepted", u)
		}
	}
	for _, u := range bad {
		if IsSlackWebhookURL(u) {
			t.Errorf("expected %q to be rejected", u)
		}
	}
}
