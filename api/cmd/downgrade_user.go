package main

import (
	"fmt"
	"os"
	"strings"

	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"
)

// ==============================================================================
// ENTER USER EMAIL IN THIS VARIABLE TO MOVE THEM TO FREE TIER:
// ==============================================================================
var TargetEmail = "hariomshashank@gmail.com"
// ==============================================================================

func main() {
	// If an email argument is passed via CLI, it takes precedence (e.g. go run cmd/downgrade_user.go user@example.com)
	if len(os.Args) > 1 && strings.TrimSpace(os.Args[1]) != "" {
		TargetEmail = strings.TrimSpace(os.Args[1])
	}

	TargetEmail = strings.TrimSpace(TargetEmail)
	if TargetEmail == "" {
		fmt.Println("❌ Error: TargetEmail variable is empty. Please enter an email.")
		return
	}

	config.Load()
	database.Connect()

	fmt.Printf("\n🔍 Looking up user with email: %s ...\n", TargetEmail)

	var user models.User
	if err := database.DB.Where("LOWER(email) = ?", strings.ToLower(TargetEmail)).First(&user).Error; err != nil {
		fmt.Printf("❌ User not found with email '%s': %v\n", TargetEmail, err)
		return
	}

	fmt.Printf("✓ Found User: %s (ID: %d, DefaultTeamID: %d, OrgID: %d)\n", user.Name, user.ID, user.DefaultTeamID, user.OrgID)

	// Determine organization to downgrade
	orgID := user.OrgID
	if orgID == 0 {
		var team models.Team
		if err := database.DB.First(&team, user.DefaultTeamID).Error; err == nil {
			orgID = team.OrgID
		}
	}

	if orgID == 0 {
		fmt.Printf("❌ Could not resolve organization ID for user %s\n", TargetEmail)
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		fmt.Printf("❌ Organization %d not found in database: %v\n", orgID, err)
		return
	}

	oldPlan := org.Plan
	oldPaymentID := org.RazorpayPaymentID
	oldSubID := org.RazorpaySubID

	// Downgrade to Free tier and wipe active payment IDs
	org.Plan = "free"
	org.RazorpayPaymentID = ""
	org.RazorpaySubID = ""

	if err := database.DB.Save(&org).Error; err != nil {
		fmt.Printf("❌ Failed to update organization %d to free plan: %v\n", org.ID, err)
		return
	}

	fmt.Println("\n=======================================================")
	fmt.Printf("🎉 SUCCESS: Organization '%s' (ID: %d) moved to FREE tier!\n", org.Name, org.ID)
	fmt.Printf("   User: %s (%s)\n", user.Name, user.Email)
	fmt.Printf("   Previous Plan: %s (Payment ID: %s, Sub ID: %s)\n", oldPlan, oldPaymentID, oldSubID)
	fmt.Printf("   Current Plan:  %s\n", org.Plan)
	fmt.Printf("   Member Limit:  30 seats\n")
	fmt.Println("=======================================================\n")
}
