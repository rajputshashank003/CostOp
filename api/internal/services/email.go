package services

import (
	"fmt"

	"costop/internal/config"

	"github.com/resend/resend-go/v2"
)

// SendTeamInviteEmail securely constructs and fires an invitation link via Resend.
func SendTeamInviteEmail(toEmail, inviterName, teamName, inviteToken string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)

	// In production, this should be your actual verified domain or localhost for testing.
	// For Resend testing without a verified domain, you can only send to the email address registered with Resend.
	// We'll use a standard onboarding template.
	frontendURL := config.FrontendURL
	inviteLink := fmt.Sprintf("%s/login?token=%s", frontendURL, inviteToken)

	htmlBody := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
			<h2>You've been invited to CostOp!</h2>
			<p><strong>%s</strong> has invited you to join the <strong>%s</strong> workspace to track SaaS expenses together.</p>
			<p>Click the button below to accept the invitation and securely login with your Google account:</p>
			<a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Accept Invitation</a>
			<p style="margin-top: 30px; font-size: 12px; color: #888;">If you did not expect this invitation, you can safely ignore this email.</p>
		</div>
	`, inviterName, teamName, inviteLink)

	params := &resend.SendEmailRequest{
		From:    "CostOp Team <onboarding@resend.dev>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Invitation to join %s on CostOp", teamName),
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("Resend API Error: %v\n", err)
		return err
	}

	return nil
}

// SendRenewalAlertEmail triggers a verification warning out to the Team 7 Days prior to Subscription cycles.
func SendRenewalAlertEmail(toEmail, userName, subName string, subCost float64, autoPay bool) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)

	frontendURL := config.FrontendURL

	billingType := "auto-renews and charges"
	if !autoPay {
		billingType = "expires"
	}

	htmlBody := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
			<h2>Upcoming SaaS Renewal Alert!</h2>
			<p>Hey <strong>%s</strong>!</p>
			<p>Your tracking software has flagged that your active subscription to <strong>%s</strong> %s your account <strong>$%.2f</strong> in roughly <strong>7 Days</strong>.</p>
			<p>If you wish to archive this module and halt recording, please sign into CostOp below:</p>
			<a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Review on Dashboard</a>
			<p style="margin-top: 30px; font-size: 12px; color: #888;">Powered natively by your CostOp Automation Engine.</p>
		</div>
	`, userName, subName, billingType, subCost, frontendURL)

	params := &resend.SendEmailRequest{
		From:    "CostOp Tracker <onboarding@resend.dev>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Action Required: %s is renewing in 7 Days", subName),
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("Resend Automation API Error: %v\n", err)
		return err
	}

	return nil
}
