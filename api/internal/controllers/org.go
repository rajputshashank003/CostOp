package controllers

import (
	"costop/internal/cache"
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// resolveOrgID returns the org_id for a given user.
func resolveOrgID(userID uint) (uint, error) {
	var user models.User
	if err := database.DB.Select("org_id").First(&user, userID).Error; err != nil {
		return 0, err
	}
	return user.OrgID, nil
}

// orgSubscriptionQuery returns a base GORM query for all subscriptions
// belonging to a given organization, filtered by status.
// Falls back to unscoped query for un-migrated data (orgID=0).
func orgSubscriptionQuery(orgID uint, status string) *gorm.DB {
	if orgID == 0 {
		return database.DB.Where("status = ?", status)
	}
	return database.DB.Where("org_id = ? AND status = ?", orgID, status)
}

// ErrNoSeats is returned when no seats are available for assignment.
var ErrNoSeats = errors.New("no seats available")

// acquireSeats atomically assigns seats to the given userIDs on a subscription.
//
// It locks the subscription row with SELECT FOR UPDATE to prevent race conditions,
// counts occupied seats while the lock is held, then inserts assignment rows only
// for users where seats are still available.
//
// Returns:
//   - assigned: user IDs that were successfully assigned a seat
//   - skipped:  user IDs that could not be assigned (seats exhausted or already assigned)
//   - err:      database error (nil on success, even if some were skipped)
func acquireSeats(
	tx *gorm.DB,
	subID uint,
	userIDs []uint,
	source string,
	teamID *uint,
) (assigned []uint, skipped []uint, err error) {
	// 1. Lock the subscription row — concurrent callers block here
	var sub models.Subscription
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&sub, subID).Error; err != nil {
		return nil, nil, err
	}

	// 2. Count currently occupied seats while the row is locked
	var occupied int64
	if err := tx.Model(&models.SubscriptionAssignment{}).
		Where("subscription_id = ?", subID).
		Count(&occupied).Error; err != nil {
		return nil, nil, err
	}

	available := sub.SeatCount - int(occupied)

	// 3. Assign seats one by one, respecting the limit
	for _, uid := range userIDs {
		// Skip users who already have an assignment (idempotent)
		var exists int64
		tx.Model(&models.SubscriptionAssignment{}).
			Where("subscription_id = ? AND user_id = ?", subID, uid).
			Count(&exists)
		if exists > 0 {
			continue // already assigned, don't count as skipped
		}

		if available <= 0 {
			skipped = append(skipped, uid)
			continue
		}

		if err := tx.Create(&models.SubscriptionAssignment{
			SubscriptionID: subID,
			UserID:         uid,
			Source:         source,
			SourceTeamID:   teamID,
			AssignedAt:     time.Now(),
		}).Error; err != nil {
			return assigned, skipped, err
		}

		assigned = append(assigned, uid)
		available--
	}

	return assigned, skipped, nil
}

// GetOrganization returns metadata, plan, and member quotas for the caller's organization.
// GET /api/organization
func GetOrganization(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	// Count active accepted members belonging to this organization
	var activeMembersCount int64
	database.DB.Model(&models.User{}).Where("org_id = ? AND deleted_at IS NULL", org.ID).Count(&activeMembersCount)

	memberLimit := 30
	if org.Plan == "pro" {
		memberLimit = 100
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                   org.ID,
		"name":                 org.Name,
		"owner_id":             org.OwnerID,
		"plan":                 org.Plan,
		"slack_webhook_url":    org.SlackWebhookURL,
		"currency":             services.NormalizeCurrency(org.Currency),
		"razorpay_customer_id": org.RazorpayCustomerID,
		"razorpay_sub_id":      org.RazorpaySubID,
		"razorpay_payment_id":  org.RazorpayPaymentID,
		"active_members_count": activeMembersCount,
		"member_limit":         memberLimit,
		"can_export_report":    org.Plan == "pro",
		"can_use_slack":        org.Plan == "pro",
	})
}

// UpdateOrganizationSettings updates the organization name or Slack Webhook URL.
// PATCH /api/organization/settings
func UpdateOrganizationSettings(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	// Verify caller is an admin or owner
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	isOwner := org.OwnerID == userID
	isAdmin := isOwner
	if !isAdmin && user.DefaultTeamID > 0 {
		var membership models.TeamMember
		if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, userID).First(&membership).Error; err == nil {
			isAdmin = membership.Role == "owner"
		}
	}

	if !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only workspace owners can update organization settings"})
		return
	}

	// Pointers distinguish "field omitted" from "field set to empty"
	var input struct {
		Name            string  `json:"name"`
		SlackWebhookURL *string `json:"slack_webhook_url"`
		Currency        *string `json:"currency"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Only write the fields this request changes, so parallel saves can't clobber each other
	updates := map[string]interface{}{}

	if input.Name != "" {
		updates["name"] = input.Name
	}

	if input.Currency != nil {
		code := strings.ToUpper(strings.TrimSpace(*input.Currency))
		if !services.SupportedCurrencies[code] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported currency. Use INR or USD."})
			return
		}
		if code != services.NormalizeCurrency(org.Currency) {
			// AI insight text quotes amounts, so regenerate it in the new currency
			cache.AppCache.Invalidate(fmt.Sprintf("ai_insights:org:%d", org.ID))
		}
		updates["currency"] = code
	}

	// Only touch the webhook when the field is sent; an empty string clears it
	if input.SlackWebhookURL != nil {
		trimmedURL := strings.TrimSpace(*input.SlackWebhookURL)
		if trimmedURL == "" {
			updates["slack_webhook_url"] = ""
		} else {
			// Updating the webhook requires a valid Slack URL and the Pro tier
			if !strings.HasPrefix(trimmedURL, "https://hooks.slack.com/") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Slack webhook URL. Must start with https://hooks.slack.com/"})
				return
			}
			if org.Plan != "pro" {
				c.JSON(http.StatusForbidden, gin.H{
					"error": "Slack Webhook Notifications are only available on the Pro plan. Please upgrade to Pro to enable Slack alerts.",
					"code":  "PRO_REQUIRED",
				})
				return
			}
			updates["slack_webhook_url"] = trimmedURL
		}
	}

	if len(updates) > 0 {
		if err := database.DB.Model(&org).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization settings"})
			return
		}
	}
	if err := database.DB.First(&org, org.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Organization settings updated successfully",
		"organization": org,
	})
}

// UpgradeOrganization transitions the organization to the Pro plan (Website Admin only manual override).
// POST /api/organization/upgrade
func UpgradeOrganization(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	if !IsWebsiteAdmin(caller.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized: Manual upgrade bypass is restricted to website admin"})
		return
	}

	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	org.Plan = "pro"
	org.RazorpayPaymentID = "pay_test_direct_upgrade"
	if err := database.DB.Save(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade organization"})
		return
	}

	// Send rich confirmation receipt email to user
	var user models.User
	if err := database.DB.First(&user, userID).Error; err == nil && user.Email != "" {
		go func(u models.User) {
			_ = services.SendPaymentSuccessEmail(u.Email, u.Name, "Pro", "monthly", 999.00, "pay_test_direct_upgrade")
		}(user)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Workspace upgraded to CostOp Pro successfully!",
		"plan":    "pro",
	})
}

// TestSlackWebhook sends a verification message to a provided Slack Webhook URL.
// POST /api/organization/test-slack
func TestSlackWebhook(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	if org.Plan != "pro" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Slack Webhook Notifications are a Pro feature.",
			"code":  "PRO_REQUIRED",
		})
		return
	}

	var input struct {
		WebhookURL string `json:"webhook_url"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	targetURL := strings.TrimSpace(input.WebhookURL)
	if targetURL == "" {
		targetURL = org.SlackWebhookURL
	}

	if targetURL == "" || !strings.HasPrefix(targetURL, "https://hooks.slack.com/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Slack webhook URL. Must start with https://hooks.slack.com/"})
		return
	}

	if err := services.SendSlackTestMessage(targetURL); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to send test message to Slack. Please verify the URL."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Test message sent to Slack successfully!"})
}

