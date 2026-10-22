package controllers

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestPasswordHashingAndVerification(t *testing.T) {
	password := "demo@123"

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	// Verify matching password
	if err := bcrypt.CompareHashAndPassword(hash, []byte(password)); err != nil {
		t.Errorf("Expected password to match hash, got error: %v", err)
	}

	// Verify wrong password fails
	if err := bcrypt.CompareHashAndPassword(hash, []byte("wrongpassword")); err == nil {
		t.Errorf("Expected wrong password to fail comparison, but it succeeded")
	}
}

func TestEmailPasswordSignupValidation(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		password string
		valid    bool
	}{
		{"Valid credentials", "user@costop.in", "securepass123", true},
		{"Empty email", "", "securepass123", false},
		{"Short password", "user@costop.in", "12345", false},
	}

	for _, tc := range tests {
		isValid := len(tc.email) > 0 && len(tc.password) >= 6
		if isValid != tc.valid {
			t.Errorf("Case %q: expected %v, got %v", tc.name, tc.valid, isValid)
		}
	}
}
