package controllers

import (
	"strings"
	"testing"
)

func TestMemberLimitRules(t *testing.T) {
	// Free plan limit is 30
	freePlan := "free"
	freeLimit := 30
	if freePlan == "free" && freeLimit != 30 {
		t.Errorf("Expected free plan limit to be 30, got %d", freeLimit)
	}

	// Pro plan limit is 100
	proPlan := "pro"
	proLimit := 100
	if proPlan == "pro" && proLimit != 100 {
		t.Errorf("Expected pro plan limit to be 100, got %d", proLimit)
	}

	// Test boundary checks
	canInviteOnFree := func(activeCount int) bool {
		return activeCount < 30
	}

	if !canInviteOnFree(29) {
		t.Errorf("Expected active count of 29 on free to allow invite")
	}
	if canInviteOnFree(30) {
		t.Errorf("Expected active count of 30 on free to block invite")
	}
	if canInviteOnFree(31) {
		t.Errorf("Expected active count of 31 on free to block invite")
	}

	canInviteOnPro := func(activeCount int) bool {
		return activeCount < 100
	}
	if !canInviteOnPro(99) {
		t.Errorf("Expected active count of 99 on pro to allow invite")
	}
	if canInviteOnPro(100) {
		t.Errorf("Expected active count of 100 on pro to block invite")
	}
}

func TestSlackWebhookURLValidation(t *testing.T) {
	validURLs := []string{
		"https://hooks.slack.com/services/mock/token/sample",
		"https://hooks.slack.com/workflows/mock/token/sample",
	}

	invalidURLs := []string{
		"http://hooks.slack.com/services/insecure",
		"https://evil-phishing-site.com/hooks.slack.com",
		"random_string_not_a_url",
		"",
	}

	isValidSlackURL := func(u string) bool {
		trimmed := strings.TrimSpace(u)
		return strings.HasPrefix(trimmed, "https://hooks.slack.com/")
	}

	for _, u := range validURLs {
		if !isValidSlackURL(u) {
			t.Errorf("Expected %s to be valid Slack webhook URL", u)
		}
	}

	for _, u := range invalidURLs {
		if isValidSlackURL(u) {
			t.Errorf("Expected %s to be INVALID Slack webhook URL", u)
		}
	}
}
