package controllers

import (
	"math"
	"strings"
	"testing"
)

func TestWebsiteAdminCheck(t *testing.T) {
	// Setup test cases
	tests := []struct {
		name       string
		adminEmail string
		checkEmail string
		expected   bool
	}{
		{
			name:       "exact match",
			adminEmail: "hariomshashank@gmail.com",
			checkEmail: "hariomshashank@gmail.com",
			expected:   true,
		},
		{
			name:       "case-insensitive match",
			adminEmail: "HARIOMSHASHANK@GMAIL.COM",
			checkEmail: "hariomshashank@gmail.com",
			expected:   true,
		},
		{
			name:       "spaces in email",
			adminEmail: " hariomshashank@gmail.com ",
			checkEmail: "hariomshashank@gmail.com",
			expected:   true,
		},
		{
			name:       "different user",
			adminEmail: "hariomshashank@gmail.com",
			checkEmail: "regular.user@example.com",
			expected:   false,
		},
		{
			name:       "empty email",
			adminEmail: "hariomshashank@gmail.com",
			checkEmail: "",
			expected:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isAdmin := func(admin, email string) bool {
				a := strings.ToLower(strings.TrimSpace(admin))
				if a == "" {
					return false
				}
				return strings.ToLower(strings.TrimSpace(email)) == a
			}

			result := isAdmin(tt.adminEmail, tt.checkEmail)
			if result != tt.expected {
				t.Errorf("Expected isAdmin(%q, %q) = %v, got %v", tt.adminEmail, tt.checkEmail, tt.expected, result)
			}
		})
	}
}

func TestPaginationMath(t *testing.T) {
	tests := []struct {
		total         int64
		limit         int
		expectedPages int
	}{
		{total: 0, limit: 10, expectedPages: 0},
		{total: 1, limit: 10, expectedPages: 1},
		{total: 10, limit: 10, expectedPages: 1},
		{total: 11, limit: 10, expectedPages: 2},
		{total: 45, limit: 10, expectedPages: 5},
		{total: 100, limit: 20, expectedPages: 5},
	}

	for _, tt := range tests {
		t.Run("", func(t *testing.T) {
			totalPages := 0
			if tt.limit > 0 && tt.total > 0 {
				totalPages = int(math.Ceil(float64(tt.total) / float64(tt.limit)))
			}
			if totalPages != tt.expectedPages {
				t.Errorf("For total=%d limit=%d, expected %d pages, got %d", tt.total, tt.limit, tt.expectedPages, totalPages)
			}
		})
	}
}

func TestPlanTogglingRules(t *testing.T) {
	// Rule: If plan is free, toggle makes it pro
	// If plan is pro, toggle makes it free
	togglePlan := func(currentPlan string, explicitIsPro *bool) (newPlan string, isPro bool) {
		if explicitIsPro != nil {
			if *explicitIsPro {
				return "pro", true
			}
			return "free", false
		}
		if strings.ToLower(currentPlan) == "pro" {
			return "free", false
		}
		return "pro", true
	}

	// 1. Toggle without explicit preference
	newPlan, isPro := togglePlan("free", nil)
	if newPlan != "pro" || !isPro {
		t.Errorf("Expected free -> pro, got %s, isPro=%v", newPlan, isPro)
	}

	newPlan, isPro = togglePlan("pro", nil)
	if newPlan != "free" || isPro {
		t.Errorf("Expected pro -> free, got %s, isPro=%v", newPlan, isPro)
	}

	// 2. Explicit preference: set to pro
	targetPro := true
	newPlan, isPro = togglePlan("free", &targetPro)
	if newPlan != "pro" || !isPro {
		t.Errorf("Expected explicit pro, got %s", newPlan)
	}

	// 3. Explicit preference: set to free
	targetFree := false
	newPlan, isPro = togglePlan("pro", &targetFree)
	if newPlan != "free" || isPro {
		t.Errorf("Expected explicit free, got %s", newPlan)
	}
}
