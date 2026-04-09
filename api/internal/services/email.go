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
		From:    "CostOp Team <help@costop.in>",
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
		From:    "CostOp Tracker <help@costop.in>",
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

// SendAlertEmail sends a user-defined subscription alert email.
func SendAlertEmail(toEmail, subject, message, subName string, cost float64, daysLeft int, isAutoPay bool) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)
	frontendURL := config.FrontendURL

	actionWord := "auto-renews"
	if !isAutoPay {
		actionWord = "expires"
	}

	var timingLine string
	if daysLeft == 0 {
		timingLine = fmt.Sprintf("Your subscription to <strong>%s</strong> %s <strong>today</strong> for <strong>$%.2f</strong>.", subName, actionWord, cost)
	} else {
		timingLine = fmt.Sprintf("Your subscription to <strong>%s</strong> %s in <strong>%d day(s)</strong> for <strong>$%.2f</strong>.", subName, actionWord, daysLeft, cost)
	}

	htmlBody := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
			<h2 style="color: #059669;">⚡ Subscription Alert</h2>
			<p>%s</p>
			<p>Log into CostOp to review or take action:</p>
			<a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Open Dashboard</a>
			<p style="margin-top: 30px; font-size: 12px; color: #888;">This alert was configured by you in CostOp. You can update or delete it anytime from the subscription detail page.</p>
		</div>
	`, timingLine, frontendURL)

	params := &resend.SendEmailRequest{
		From:    "CostOp Alerts <help@costop.in>",
		To:      []string{toEmail},
		Subject: subject,
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("Resend Alert Email Error: %v\n", err)
		return err
	}
	return nil
}

// SendCustomAlertEmail sends a custom/standalone reminder alert email.
func SendCustomAlertEmail(toEmail, subject, message string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)
	frontendURL := config.FrontendURL

	htmlBody := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
			<h2 style="color: #059669;">🔔 Custom Reminder</h2>
			<p>%s</p>
			<a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Open Dashboard</a>
			<p style="margin-top: 30px; font-size: 12px; color: #888;">This reminder was set by you in CostOp.</p>
		</div>
	`, message, frontendURL)

	params := &resend.SendEmailRequest{
		From:    "CostOp Alerts <help@costop.in>",
		To:      []string{toEmail},
		Subject: subject,
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("Resend Custom Alert Email Error: %v\n", err)
		return err
	}
	return nil
}
