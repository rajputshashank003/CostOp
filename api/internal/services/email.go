package services

import (
	"fmt"
	"time"

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

// ─────────────────────────────────────────────────────────────────────────────
// Signup Emails
// ─────────────────────────────────────────────────────────────────────────────

// SendWelcomeEmail sends a rich welcome email to a newly registered user.
func SendWelcomeEmail(toEmail, userName, avatarURL string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)
	frontendURL := config.FrontendURL

	// Fallback initials avatar when no Google picture is available
	initial := "U"
	if len([]rune(userName)) > 0 {
		initial = string([]rune(userName)[0])
	}
	avatarSection := ""
	if avatarURL != "" {
		avatarSection = fmt.Sprintf(`<img src="%s" alt="%s" style="width:72px;height:72px;border-radius:50%%;border:3px solid #10b981;display:block;margin:0 auto;" />`, avatarURL, userName)
	} else {
		avatarSection = fmt.Sprintf(`<div style="width:72px;height:72px;border-radius:50%%;background:linear-gradient(135deg,#10b981,#059669);line-height:72px;text-align:center;font-size:32px;font-weight:700;color:#fff;margin:0 auto;">%s</div>`, initial)
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to CostOp</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;border-radius:20px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);">

<!-- Hero -->
<tr><td style="background:linear-gradient(135deg,#0f2942 0%%,#0a1628 50%%,#0f2942 100%%);padding:48px 40px 40px;text-align:center;border-bottom:1px solid rgba(16,185,129,0.2);">
  <div style="margin-bottom:24px;">
    <span style="font-size:28px;font-weight:800;letter-spacing:-0.5px;">
      <span style="color:#10b981;">Cost</span><span style="color:#ffffff;">Op</span>
    </span>
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6b7280;margin-top:4px;">Spend Optimization Platform</div>
  </div>
  <div style="margin-bottom:20px;">%s</div>
  <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Welcome aboard, %s! 🎉</h1>
  <p style="margin:0;font-size:15px;color:#94a3b8;">Your SaaS spend is about to get smarter.</p>
</td></tr>

<!-- Body -->
<tr><td style="background:#1e293b;padding:40px;">
  <p style="margin:0 0 28px;font-size:15px;color:#cbd5e1;line-height:1.8;">
    Hi <strong style="color:#e2e8f0;">%s</strong>, you've just joined <strong style="color:#10b981;">CostOp</strong> — the platform that gives you complete visibility and control over every software subscription your team pays for. No more bill-shock renewals. No more zombie licenses.
  </p>

  <div style="border-top:1px solid rgba(255,255,255,0.07);margin-bottom:28px;"></div>

  <p style="margin:0 0 20px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6b7280;">What you can do with CostOp</p>

  <!-- Feature 1 -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
  <tr>
    <td width="48" valign="top"><div style="width:40px;height:40px;border-radius:10px;background:rgba(16,185,129,0.12);text-align:center;line-height:40px;font-size:20px;">📊</div></td>
    <td style="padding-left:16px;" valign="middle">
      <strong style="color:#e2e8f0;font-size:14px;">Track every subscription</strong>
      <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">One dashboard for all your SaaS tools — billing dates, costs, and owners.</p>
    </td>
  </tr>
  </table>

  <!-- Feature 2 -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
  <tr>
    <td width="48" valign="top"><div style="width:40px;height:40px;border-radius:10px;background:rgba(16,185,129,0.12);text-align:center;line-height:40px;font-size:20px;">🔍</div></td>
    <td style="padding-left:16px;" valign="middle">
      <strong style="color:#e2e8f0;font-size:14px;">Surface unused licenses</strong>
      <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Our engine flags tools your team stopped using so you can cancel before renewal.</p>
    </td>
  </tr>
  </table>

  <!-- Feature 3 -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
  <tr>
    <td width="48" valign="top"><div style="width:40px;height:40px;border-radius:10px;background:rgba(16,185,129,0.12);text-align:center;line-height:40px;font-size:20px;">🔔</div></td>
    <td style="padding-left:16px;" valign="middle">
      <strong style="color:#e2e8f0;font-size:14px;">Smart renewal alerts</strong>
      <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Receive reminders 7 days before any subscription renews — never be surprised again.</p>
    </td>
  </tr>
  </table>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:32px;">
    <a href="%s" style="display:inline-block;padding:15px 40px;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(16,185,129,0.35);">Open My Dashboard →</a>
  </div>

  <div style="border-top:1px solid rgba(255,255,255,0.07);margin-bottom:24px;"></div>

  <p style="margin:0;font-size:13px;color:#64748b;text-align:center;line-height:1.7;">
    Questions? Reply to this email — we read every one.<br/>
    <a href="mailto:costop.in@gmail.com" style="color:#10b981;text-decoration:none;">costop.in@gmail.com</a>
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
  <p style="margin:0 0 6px;font-size:12px;color:#475569;">© 2025 CostOp · All rights reserved</p>
  <p style="margin:0;font-size:11px;color:#334155;">You're receiving this because you signed up at <a href="%s" style="color:#10b981;text-decoration:none;">costop.io</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`, avatarSection, userName, userName, frontendURL, frontendURL)

	params := &resend.SendEmailRequest{
		From:    "CostOp <help@costop.in>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Welcome to CostOp, %s! 🚀 Your SaaS spend dashboard is ready", userName),
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("SendWelcomeEmail error: %v\n", err)
		return err
	}
	return nil
}

// SendAdminSignupNotification fires a detailed new-user alert to the CostOp admin inbox.
func SendAdminSignupNotification(userName, userEmail, avatarURL, accountType string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)
	frontendURL := config.FrontendURL

	now := nowIST()

	badgeColor := "#10b981"
	badgeLabel := "🧑‍💼 New Owner"
	if accountType == "invited_member" {
		badgeColor = "#6366f1"
		badgeLabel = "👥 Invited Member"
	}

	initial := "U"
	if len([]rune(userName)) > 0 {
		initial = string([]rune(userName)[0])
	}
	avatarSection := ""
	if avatarURL != "" {
		avatarSection = fmt.Sprintf(`<img src="%s" alt="%s" style="width:56px;height:56px;border-radius:50%%;border:2px solid %s;display:block;" />`, avatarURL, userName, badgeColor)
	} else {
		avatarSection = fmt.Sprintf(`<div style="width:56px;height:56px;border-radius:50%%;background:linear-gradient(135deg,%s,#059669);line-height:56px;text-align:center;font-size:24px;font-weight:700;color:#fff;">%s</div>`, badgeColor, initial)
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>New Signup — CostOp Admin</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;border-radius:20px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#0f2942 0%%,#0a1628 50%%,#0f2942 100%%);padding:32px 40px;border-bottom:1px solid rgba(16,185,129,0.2);">
  <table width="100%%" cellpadding="0" cellspacing="0"><tr>
    <td>
      <span style="font-size:22px;font-weight:800;">
        <span style="color:#10b981;">Cost</span><span style="color:#fff;">Op</span>
      </span>
      <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6b7280;margin-top:2px;">Admin Notification</div>
    </td>
    <td align="right">
      <span style="display:inline-block;padding:6px 14px;border-radius:20px;background:%s;color:#fff;font-size:12px;font-weight:600;">%s</span>
    </td>
  </tr></table>
</td></tr>

<!-- Alert banner -->
<tr><td style="background:rgba(16,185,129,0.08);border-left:4px solid #10b981;padding:16px 40px;">
  <p style="margin:0;font-size:15px;font-weight:600;color:#10b981;">🎉 New user just signed up on CostOp!</p>
</td></tr>

<!-- Body -->
<tr><td style="background:#1e293b;padding:36px 40px;">

  <!-- User card -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.07);margin-bottom:28px;">
  <tr><td style="padding:24px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td width="72" valign="middle">%s</td>
      <td style="padding-left:18px;" valign="middle">
        <strong style="font-size:18px;color:#e2e8f0;">%s</strong><br/>
        <a href="mailto:%s" style="font-size:14px;color:#10b981;text-decoration:none;">%s</a>
      </td>
    </tr></table>
  </td></tr>
  </table>

  <!-- Detail rows -->
  <p style="margin:0 0 14px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6b7280;">Account Details</p>
  <table width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 0;font-size:13px;color:#64748b;width:38%%;">Full Name</td>
      <td style="padding:12px 0;font-size:13px;color:#e2e8f0;font-weight:500;">%s</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 0;font-size:13px;color:#64748b;">Email</td>
      <td style="padding:12px 0;font-size:13px;color:#e2e8f0;font-weight:500;">%s</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 0;font-size:13px;color:#64748b;">Account Type</td>
      <td style="padding:12px 0;">
        <span style="display:inline-block;padding:3px 12px;border-radius:12px;background:%s30;color:%s;font-size:12px;font-weight:600;border:1px solid %s60;">%s</span>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 0;font-size:13px;color:#64748b;">Signed up at</td>
      <td style="padding:12px 0;font-size:13px;color:#e2e8f0;font-weight:500;">%s</td>
    </tr>
  </table>

  <div style="border-top:1px solid rgba(255,255,255,0.07);margin:28px 0;"></div>

  <div style="text-align:center;">
    <a href="%s" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;box-shadow:0 4px 16px rgba(16,185,129,0.3);">View on Dashboard →</a>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
  <p style="margin:0;font-size:11px;color:#334155;">This is an automated admin alert from <strong style="color:#10b981;">CostOp</strong>. Do not reply.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
		badgeColor, badgeLabel,
		avatarSection,
		userName, userEmail, userEmail,
		userName,
		userEmail,
		badgeColor, badgeColor, badgeColor, accountType,
		now,
		frontendURL,
	)

	params := &resend.SendEmailRequest{
		From:    "CostOp Admin <help@costop.in>",
		To:      []string{"costop.in@gmail.com"},
		Subject: fmt.Sprintf("🚀 New Signup: %s (%s)", userName, userEmail),
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("SendAdminSignupNotification error: %v\n", err)
		return err
	}
	return nil
}

// nowIST returns current time in IST for email display.
func nowIST() string {
	loc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		return time.Now().UTC().Format("02 Jan 2006, 03:04 PM UTC")
	}
	return time.Now().In(loc).Format("02 Jan 2006, 03:04 PM IST")
}

