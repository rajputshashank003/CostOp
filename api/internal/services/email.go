package services

import (
	"fmt"
	"strings"
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
	frontendURL := config.FrontendURL
	if frontendURL == "" {
		frontendURL = "https://costop1.vercel.app"
	}
	inviteLink := fmt.Sprintf("%s/login?token=%s", frontendURL, inviteToken)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Invitation to join %s on CostOp</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

  <!-- Header Banner -->
  <tr>
    <td style="background-color:#ffffff;padding:36px 36px 28px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td valign="middle">
            <div style="width:36px;height:36px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#059669;display:inline-block;">$</div>
          </td>
          <td valign="middle" style="padding-left:10px;">
            <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:20px;">Spend Optimization Platform</div>

      <!-- Badge -->
      <div style="display:inline-block;padding:6px 16px;border-radius:9999px;background-color:#eef2ff;border:1px solid #c7d2fe;color:#4338ca;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
        👥 TEAM INVITATION
      </div>

      <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.3;">You've been invited to %s</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:480px;display:inline-block;">
        <strong style="color:#0f172a;">%s</strong> has invited you to join the team workspace to track and manage software spending together.
      </p>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="background-color:#ffffff;padding:32px 36px 36px;">
      <!-- Feature Card -->
      <div style="background-color:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;padding:22px;margin-bottom:28px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:14px;">
          What you'll get access to:
        </div>
        <table width="100%%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;line-height:1.8;">
          <tr>
            <td style="padding:4px 0;"><span style="color:#059669;font-weight:bold;margin-right:8px;">✓</span> Unified company subscription dashboard</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><span style="color:#059669;font-weight:bold;margin-right:8px;">✓</span> Renewal alerts and payment schedules</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><span style="color:#059669;font-weight:bold;margin-right:8px;">✓</span> Request new software approvals with team owners</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="%s" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Accept Invitation & Join →</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
        If you did not expect this invitation, you can safely ignore this email.<br/>
        Questions? Contact us at <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp · All rights reserved</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">SaaS Spend Optimization Engine</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`, teamName, teamName, inviterName, inviteLink)

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
	if frontendURL == "" {
		frontendURL = "https://costop1.vercel.app"
	}

	billingType := "auto-renews and charges"
	if !autoPay {
		billingType = "expires"
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Upcoming SaaS Renewal Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

  <!-- Header Banner -->
  <tr>
    <td style="background-color:#ffffff;padding:36px 36px 28px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td valign="middle">
            <div style="width:36px;height:36px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#059669;display:inline-block;">$</div>
          </td>
          <td valign="middle" style="padding-left:10px;">
            <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:20px;">Spend Optimization Platform</div>

      <!-- Badge -->
      <div style="display:inline-block;padding:6px 16px;border-radius:9999px;background-color:#fffbeb;border:1px solid #fde68a;color:#92400e;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
        🔔 UPCOMING RENEWAL • 7 DAYS
      </div>

      <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.3;">%s is renewing soon</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:480px;display:inline-block;">
        Hi %s, your tracking automation flagged that an active subscription is scheduled to renew in 7 days.
      </p>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="background-color:#ffffff;padding:32px 36px 36px;">
      <!-- Detail Card -->
      <div style="background-color:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;padding:22px;margin-bottom:28px;">
        <table width="100%%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
          <tr>
            <td style="padding:8px 0;color:#64748b;">Subscription</td>
            <td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;">%s</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Action Expected</td>
            <td style="padding:8px 0;text-align:right;color:#334155;font-weight:600;">%s</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Renewal Cost</td>
            <td style="padding:8px 0;text-align:right;font-size:18px;font-weight:900;color:#059669;">$%.2f</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Timeline</td>
            <td style="padding:8px 0;text-align:right;color:#0f172a;font-weight:700;">In ~7 Days</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="%s" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Review Subscription on Dashboard →</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
        Powered natively by your CostOp Automation Engine.<br/>
        Need assistance? Reply to <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp · Spend Optimization Platform</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">Automated renewal alert dispatched from your CostOp workspace.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`, subName, userName, subName, billingType, subCost, frontendURL)

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
	if frontendURL == "" {
		frontendURL = "https://costop1.vercel.app"
	}

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

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>%s</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

  <!-- Header Banner -->
  <tr>
    <td style="background-color:#ffffff;padding:36px 36px 28px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td valign="middle">
            <div style="width:36px;height:36px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#059669;display:inline-block;">$</div>
          </td>
          <td valign="middle" style="padding-left:10px;">
            <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:20px;">Spend Optimization Platform</div>

      <!-- Badge -->
      <div style="display:inline-block;padding:6px 16px;border-radius:9999px;background-color:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
        ⚡ SUBSCRIPTION ALERT
      </div>

      <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.3;">%s</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:480px;display:inline-block;">
        Your custom alert conditions have been triggered for this subscription.
      </p>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="background-color:#ffffff;padding:32px 36px 36px;">
      <!-- Alert Box -->
      <div style="background-color:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;padding:22px;margin-bottom:28px;">
        <p style="margin:0;font-size:15px;color:#0f172a;line-height:1.6;font-weight:500;">
          %s
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="%s" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Open Dashboard →</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
        This alert was configured in CostOp. You can update or delete it anytime from the subscription detail page.<br/>
        Contact: <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp · All rights reserved</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">Automated notification from CostOp.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`, subject, subName, timingLine, frontendURL)

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
	if frontendURL == "" {
		frontendURL = "https://costop1.vercel.app"
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>%s</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

  <!-- Header Banner -->
  <tr>
    <td style="background-color:#ffffff;padding:36px 36px 28px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td valign="middle">
            <div style="width:36px;height:36px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#059669;display:inline-block;">$</div>
          </td>
          <td valign="middle" style="padding-left:10px;">
            <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:20px;">Spend Optimization Platform</div>

      <!-- Badge -->
      <div style="display:inline-block;padding:6px 16px;border-radius:9999px;background-color:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
        🔔 REMINDER NOTIFICATION
      </div>

      <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.3;">%s</h1>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="background-color:#ffffff;padding:32px 36px 36px;">
      <!-- Content Box -->
      <div style="background-color:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;padding:22px;margin-bottom:28px;">
        <p style="margin:0;font-size:15px;color:#0f172a;line-height:1.6;font-weight:500;">
          %s
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="%s" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Open Dashboard →</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
        This reminder was scheduled in CostOp.<br/>
        Contact: <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp · All rights reserved</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`, subject, subject, message, frontendURL)

	params := &resend.SendEmailRequest{
		From:    "CostOp Alerts <support@costop.in>",
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
		avatarSection = fmt.Sprintf(`<div style="width:72px;height:72px;border-radius:50%%;background:linear-gradient(135deg,#059669,#047857);line-height:72px;text-align:center;font-size:28px;font-weight:900;color:#ffffff;margin:0 auto;">%s</div>`, initial)
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to CostOp</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

<!-- Hero -->
<tr><td style="background-color:#ffffff;padding:40px 36px 30px;text-align:center;border-bottom:1px solid #f1f5f9;">
  <!-- Logo -->
  <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
    <tr>
      <td valign="middle">
        <div style="width:36px;height:36px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#059669;display:inline-block;">$</div>
      </td>
      <td valign="middle" style="padding-left:10px;">
        <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
      </td>
    </tr>
  </table>
  <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:24px;">Spend Optimization Platform</div>

  <div style="margin-bottom:20px;">%s</div>
  <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Welcome aboard, %s! 🎉</h1>
  <p style="margin:0;font-size:14px;color:#64748b;">Your SaaS spend optimization dashboard is ready to go.</p>
</td></tr>

<!-- Body -->
<tr><td style="background-color:#ffffff;padding:36px;">
  <p style="margin:0 0 24px;font-size:14px;color:#334155;line-height:1.7;">
    Hi <strong style="color:#0f172a;">%s</strong>, you've just joined <strong style="color:#059669;">CostOp</strong> — the platform that gives you complete visibility and control over every software subscription your team pays for. No more bill-shock renewals or zombie licenses.
  </p>

  <div style="border-top:1px solid #e2e8f0;margin-bottom:24px;"></div>

  <p style="margin:0 0 16px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">What you can do with CostOp</p>

  <!-- Feature 1 -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
  <tr>
    <td width="52" style="padding:14px 0 14px 16px;" valign="middle">
      <div style="width:34px;height:34px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:34px;font-size:16px;">📊</div>
    </td>
    <td style="padding:14px 16px 14px 10px;" valign="middle">
      <strong style="color:#0f172a;font-size:13px;display:block;">Track every subscription</strong>
      <span style="font-size:12px;color:#64748b;line-height:1.4;">One central dashboard for all your SaaS tools — billing dates, costs, and owners.</span>
    </td>
  </tr>
  </table>

  <!-- Feature 2 -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
  <tr>
    <td width="52" style="padding:14px 0 14px 16px;" valign="middle">
      <div style="width:34px;height:34px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:34px;font-size:16px;">🔍</div>
    </td>
    <td style="padding:14px 16px 14px 10px;" valign="middle">
      <strong style="color:#0f172a;font-size:13px;display:block;">Surface unused licenses</strong>
      <span style="font-size:12px;color:#64748b;line-height:1.4;">Our FinOps engine flags tools your team stopped using so you can cancel before renewal.</span>
    </td>
  </tr>
  </table>

  <!-- Feature 3 -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
  <tr>
    <td width="52" style="padding:14px 0 14px 16px;" valign="middle">
      <div style="width:34px;height:34px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:34px;font-size:16px;">🔔</div>
    </td>
    <td style="padding:14px 16px 14px 10px;" valign="middle">
      <strong style="color:#0f172a;font-size:13px;display:block;">Smart renewal alerts</strong>
      <span style="font-size:12px;color:#64748b;line-height:1.4;">Receive reminders 7 days before any subscription renews — never be surprised again.</span>
    </td>
  </tr>
  </table>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:28px;">
    <a href="%s" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Open My Dashboard →</a>
  </div>

  <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

  <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
    Questions? Reply to this email — we read every one.<br/>
    <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp · All rights reserved</p>
  <p style="margin:0;font-size:11px;color:#94a3b8;">You're receiving this because you signed up at <a href="%s" style="color:#059669;text-decoration:none;">costop.io</a></p>
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

	badgeColor := "#059669"
	badgeBg := "#ecfdf5"
	badgeBorder := "#a7f3d0"
	badgeLabel := "🧑‍💼 New Owner"
	if accountType == "invited_member" {
		badgeColor = "#4f46e5"
		badgeBg = "#eef2ff"
		badgeBorder = "#c7d2fe"
		badgeLabel = "👥 Invited Member"
	}

	initial := "U"
	if len([]rune(userName)) > 0 {
		initial = string([]rune(userName)[0])
	}
	avatarSection := ""
	if avatarURL != "" {
		avatarSection = fmt.Sprintf(`<img src="%s" alt="%s" style="width:52px;height:52px;border-radius:50%%;border:2px solid %s;display:block;" />`, avatarURL, userName, badgeColor)
	} else {
		avatarSection = fmt.Sprintf(`<div style="width:52px;height:52px;border-radius:50%%;background:linear-gradient(135deg,%s,#059669);line-height:52px;text-align:center;font-size:22px;font-weight:700;color:#fff;">%s</div>`, badgeColor, initial)
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>New Signup — CostOp Admin</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

<!-- Header -->
<tr><td style="background-color:#ffffff;padding:32px 36px 24px;border-bottom:1px solid #f1f5f9;">
  <table width="100%%" cellpadding="0" cellspacing="0"><tr>
    <td>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td valign="middle">
            <div style="width:32px;height:32px;border-radius:8px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:32px;font-size:16px;font-weight:900;color:#059669;">$</div>
          </td>
          <td valign="middle" style="padding-left:8px;">
            <span style="font-size:22px;font-weight:900;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-top:2px;">Admin Notification</div>
    </td>
    <td align="right">
      <span style="display:inline-block;padding:6px 14px;border-radius:20px;background:%s;color:%s;border:1px solid %s;font-size:12px;font-weight:700;">%s</span>
    </td>
  </tr></table>
</td></tr>

<!-- Alert banner -->
<tr><td style="background-color:#ecfdf5;border-left:4px solid #059669;padding:14px 36px;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#065f46;">🎉 New user just signed up on CostOp!</p>
</td></tr>

<!-- Body -->
<tr><td style="background-color:#ffffff;padding:32px 36px;">

  <!-- User card -->
  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;margin-bottom:24px;">
  <tr><td style="padding:20px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td width="64" valign="middle">%s</td>
      <td style="padding-left:16px;" valign="middle">
        <strong style="font-size:16px;color:#0f172a;">%s</strong><br/>
        <a href="mailto:%s" style="font-size:13px;color:#059669;text-decoration:none;font-weight:600;">%s</a>
      </td>
    </tr></table>
  </td></tr>
  </table>

  <!-- Detail rows -->
  <p style="margin:0 0 12px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">Account Details</p>
  <table width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;width:38%%;">Full Name</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:600;">%s</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;">Email</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:600;">%s</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;">Account Type</td>
      <td style="padding:10px 0;">
        <span style="display:inline-block;padding:2px 10px;border-radius:12px;background:%s;color:%s;font-size:11px;font-weight:700;border:1px solid %s;">%s</span>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#64748b;">Signed up at</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:600;">%s</td>
    </tr>
  </table>

  <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>

  <div style="text-align:center;">
    <a href="%s" style="display:inline-block;padding:12px 30px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:800;box-shadow:0 4px 12px rgba(5,150,105,0.3);">View on Dashboard →</a>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#f8fafc;padding:20px 36px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">This is an automated admin notification from <strong style="color:#059669;">CostOp</strong>.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
		badgeBg, badgeColor, badgeBorder, badgeLabel,
		avatarSection,
		userName, userEmail, userEmail,
		userName,
		userEmail,
		badgeBg, badgeColor, badgeBorder, accountType,
		now,
		frontendURL,
	)

	adminRecipient := strings.TrimSpace(config.AdminEmail)
	if adminRecipient == "" {
		adminRecipient = "help@costop.in"
	}

	params := &resend.SendEmailRequest{
		From:    "CostOp Admin <help@costop.in>",
		To:      []string{adminRecipient},
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

// ─────────────────────────────────────────────────────────────────────────────
// Payment & Subscription Emails
// ─────────────────────────────────────────────────────────────────────────────

// SendPaymentSuccessEmail dispatches a high-conversion, beautifully formatted receipt
// and feature activation email when a user upgrades to CostOp Pro.
func SendPaymentSuccessEmail(toEmail, userName, planName, billingInterval string, amountPaid float64, paymentID string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)
	frontendURL := config.FrontendURL
	if frontendURL == "" {
		frontendURL = "https://costop1.vercel.app"
	}

	billingCycleLabel := "Monthly Subscription"
	if billingInterval == "yearly" || billingInterval == "annual" {
		billingCycleLabel = "Annual Subscription (Billed Yearly)"
	}

	dateStr := nowIST()

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Payment Successful - Welcome to CostOp Pro</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<!-- Main Card Container -->
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

  <!-- Header Banner -->
  <tr>
    <td style="background-color:#ffffff;padding:36px 36px 28px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <!-- Logo matching website -->
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td valign="middle">
            <div style="width:36px;height:36px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#059669;display:inline-block;">$</div>
          </td>
          <td valign="middle" style="padding-left:10px;">
            <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#059669;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:20px;">Spend Optimization Platform</div>

      <!-- Status Badge -->
      <div style="display:inline-block;padding:6px 16px;border-radius:9999px;background-color:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
        ✓ PAYMENT CONFIRMED • PRO ACTIVATED
      </div>

      <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.3;">Welcome to CostOp Pro, %s! 🚀</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:480px;display:inline-block;">Your workspace has been upgraded with expanded team limits, executive reporting, and automated Slack alerts.</p>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="background-color:#ffffff;padding:32px 36px 36px;">

      <!-- Transaction Receipt Card -->
      <div style="background-color:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;padding:22px;margin-bottom:30px;">
        <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">
          <tr>
            <td>
              <span style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">
                Transaction Receipt
              </span>
            </td>
            <td align="right">
              <span style="font-size:11px;font-weight:700;color:#059669;background-color:#ecfdf5;padding:3px 8px;border-radius:6px;border:1px solid #a7f3d0;">
                Razorpay Verified
              </span>
            </td>
          </tr>
        </table>

        <table width="100%%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
          <tr>
            <td style="padding:7px 0;color:#64748b;">Plan</td>
            <td style="padding:7px 0;text-align:right;font-weight:700;color:#0f172a;">CostOp Pro Workspace</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Billing Cycle</td>
            <td style="padding:7px 0;text-align:right;font-weight:600;color:#334155;">%s</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Amount Paid</td>
            <td style="padding:7px 0;text-align:right;font-size:18px;font-weight:900;color:#059669;">₹%.2f</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Payment ID</td>
            <td style="padding:7px 0;text-align:right;">
              <code style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#0f172a;background-color:#e2e8f0;padding:3px 6px;border-radius:6px;">%s</code>
            </td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Date & Time</td>
            <td style="padding:7px 0;text-align:right;color:#334155;font-weight:500;">%s</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Status</td>
            <td style="padding:7px 0;text-align:right;color:#059669;font-weight:800;">Completed (256-Bit SSL)</td>
          </tr>
        </table>
      </div>

      <!-- Pro Capabilities Title -->
      <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:16px;">
        Unlocked Pro Capabilities
      </div>

      <!-- Feature 1 -->
      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
        <tr>
          <td width="52" style="padding:14px 0 14px 16px;" valign="middle">
            <div style="width:34px;height:34px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:34px;font-size:16px;">👥</div>
          </td>
          <td style="padding:14px 16px 14px 10px;" valign="middle">
            <strong style="color:#0f172a;font-size:13px;display:block;">100 Active Team Seats</strong>
            <span style="font-size:12px;color:#64748b;line-height:1.4;">Collaborate across teams with expanded seat quota without invite limits.</span>
          </td>
        </tr>
      </table>

      <!-- Feature 2 -->
      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
        <tr>
          <td width="52" style="padding:14px 0 14px 16px;" valign="middle">
            <div style="width:34px;height:34px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:34px;font-size:16px;">📊</div>
          </td>
          <td style="padding:14px 16px 14px 10px;" valign="middle">
            <strong style="color:#0f172a;font-size:13px;display:block;">Monthly Executive Spend Reports (CSV & PDF)</strong>
            <span style="font-size:12px;color:#64748b;line-height:1.4;">One-click executive spend digests ready for finance audits and board reviews.</span>
          </td>
        </tr>
      </table>

      <!-- Feature 3 -->
      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
        <tr>
          <td width="52" style="padding:14px 0 14px 16px;" valign="middle">
            <div style="width:34px;height:34px;border-radius:10px;background-color:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:34px;font-size:16px;">💬</div>
          </td>
          <td style="padding:14px 16px 14px 10px;" valign="middle">
            <strong style="color:#0f172a;font-size:13px;display:block;">Slack Webhook Renewal Alerts</strong>
            <span style="font-size:12px;color:#64748b;line-height:1.4;">Configure real-time renewal alerts in Settings to notify team channels before charges.</span>
          </td>
        </tr>
      </table>

      <!-- CTA Button matching website -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="%s/home" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Open Pro Workspace Dashboard →</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
        Need an official GST Invoice or have questions regarding this charge?<br/>
        Reply directly to this email or contact us at <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp Technologies Inc. • Secured by Razorpay 256-bit SSL</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">All prices in INR (₹). Manage your subscription and quota anytime in Workspace Settings.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,
		userName,
		billingCycleLabel,
		amountPaid,
		paymentID,
		dateStr,
		frontendURL,
	)

	params := &resend.SendEmailRequest{
		From:    "CostOp Billing <help@costop.in>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("🎉 Payment Confirmed: Welcome to CostOp Pro, %s!", userName),
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("[EMAIL ERROR] SendPaymentSuccessEmail error: %v\n", err)
		return err
	}
	return nil
}

// SendPaymentFailedEmail dispatches an empathetic, action-oriented alert email
// when a user's transaction cannot be completed, providing clear retry instructions.
func SendPaymentFailedEmail(toEmail, userName, planName string, amountAttempted float64, failureReason string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)
	frontendURL := config.FrontendURL
	if frontendURL == "" {
		frontendURL = "https://costop1.vercel.app"
	}

	dateStr := nowIST()
	if failureReason == "" {
		failureReason = "Transaction was declined by bank or timed out"
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Payment Unsuccessful - CostOp Pro Upgrade</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:40px 16px;">
<tr><td align="center">
<!-- Main Card Container -->
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">

  <!-- Header Banner -->
  <tr>
    <td style="background-color:#ffffff;padding:36px 36px 28px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <!-- Logo matching website -->
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td valign="middle">
            <div style="width:36px;height:36px;border-radius:10px;background-color:#fef2f2;border:1px solid #fecaca;text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#ef4444;display:inline-block;">$</div>
          </td>
          <td valign="middle" style="padding-left:10px;">
            <span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;">Cost<span style="color:#ef4444;">Op</span></span>
          </td>
        </tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:20px;">Spend Optimization Platform</div>

      <!-- Warning Badge -->
      <div style="display:inline-block;padding:6px 16px;border-radius:9999px;background-color:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
        ⚠️ PAYMENT ATTEMPT UNSUCCESSFUL
      </div>

      <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.3;">Your payment could not be processed</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:480px;display:inline-block;">Hi %s, we noticed an issue completing your upgrade to CostOp Pro.</p>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="background-color:#ffffff;padding:32px 36px 36px;">

      <!-- Failure Details Card -->
      <div style="background-color:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;padding:22px;margin-bottom:26px;">
        <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">
          <tr>
            <td>
              <span style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">
                Attempt Details
              </span>
            </td>
            <td align="right">
              <span style="font-size:11px;font-weight:700;color:#dc2626;background-color:#fef2f2;padding:3px 8px;border-radius:6px;border:1px solid #fecaca;">
                Payment Failed
              </span>
            </td>
          </tr>
        </table>

        <table width="100%%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
          <tr>
            <td style="padding:7px 0;color:#64748b;">Plan Attempted</td>
            <td style="padding:7px 0;text-align:right;font-weight:700;color:#0f172a;">CostOp Pro Workspace</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Amount</td>
            <td style="padding:7px 0;text-align:right;font-size:16px;font-weight:800;color:#0f172a;">₹%.2f</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Reason</td>
            <td style="padding:7px 0;text-align:right;color:#dc2626;font-weight:700;font-size:13px;">%s</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;">Time</td>
            <td style="padding:7px 0;text-align:right;color:#334155;font-weight:500;">%s</td>
          </tr>
        </table>
      </div>

      <!-- Reassurance Box -->
      <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;padding:18px;margin-bottom:26px;">
        <div style="font-size:13px;font-weight:800;color:#065f46;margin-bottom:4px;">No funds were charged</div>
        <p style="margin:0;font-size:12px;color:#047857;line-height:1.6;">
          Don't worry — your bank account or card was not debited. Your CostOp workspace remains completely secure on the Free plan, and all your existing subscriptions and team data are safe.
        </p>
      </div>

      <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:12px;">
        Alternative Payment Methods Available
      </div>

      <div style="background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:16px;margin-bottom:28px;font-size:13px;color:#334155;line-height:1.8;">
        • <strong>UPI QR or App:</strong> Google Pay, PhonePe, Paytm, BHIM<br/>
        • <strong>Cards:</strong> Any Visa, Mastercard, RuPay, or Corporate Card<br/>
        • <strong>Net Banking:</strong> All major Indian banks supported
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="%s/billing" style="display:inline-block;padding:15px 38px;background-color:#059669;background-image:linear-gradient(135deg,#059669 0%%,#047857 100%%);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;box-shadow:0 4px 14px rgba(5,150,105,0.35);letter-spacing:0.2px;">Retry Upgrade on Billing Page →</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;margin-bottom:20px;"></div>

      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
        Need help with checkout? Reply directly to this email or write to<br/>
        <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;font-weight:700;">help@costop.in</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© 2026 CostOp Technologies Inc. • Secured by Razorpay</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">This is an automated transaction notification regarding your CostOp workspace.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,
		userName,
		amountAttempted,
		failureReason,
		dateStr,
		frontendURL,
	)

	params := &resend.SendEmailRequest{
		From:    "CostOp Billing <help@costop.in>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Action Required: Payment could not be processed for CostOp Pro"),
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("[EMAIL ERROR] SendPaymentFailedEmail error: %v\n", err)
		return err
	}
	return nil
}

// SendVerificationEmail sends a modern branded email with an activation link for newly registered accounts.
func SendVerificationEmail(toEmail, userName, verifyURL string) error {
	apiKey := config.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not set in environment")
	}

	client := resend.NewClient(apiKey)

	displayName := userName
	if displayName == "" {
		displayName = "there"
	}

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Verify your CostOp account</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="100%%" border="0" cellpadding="0" cellspacing="0" style="max-width:540px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">

  <!-- Emerald Brand Header -->
  <tr>
    <td style="background:linear-gradient(135deg, #059669 0%%, #10b981 100%%);padding:36px 36px 30px;text-align:center;">
      <div style="display:inline-block;background-color:#ffffff;border-radius:16px;padding:12px;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">CostOp</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#d1fae5;font-weight:500;">SaaS Spend Optimization & Tracking</p>
    </td>
  </tr>

  <!-- Main Content Card -->
  <tr>
    <td style="padding:36px 36px 28px;">
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">Verify your email address</h2>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Hi <strong>%s</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
        Thanks for signing up for CostOp! Please confirm your email address by clicking the button below to activate your account and start tracking your software costs.
      </p>

      <!-- Primary Action CTA Button -->
      <table width="100%%" border="0" cellpadding="0" cellspacing="0" style="margin:30px 0;">
        <tr>
          <td align="center">
            <a href="%s" target="_blank" style="display:inline-block;background-color:#059669;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 36px;border-radius:14px;box-shadow:0 4px 16px rgba(5,150,105,0.3);letter-spacing:-0.01em;">
              Verify My Email &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.5;text-align:center;">
        This link will expire in <strong>24 hours</strong>. If you did not create a CostOp account, no further action is required.
      </p>

      <!-- Fallback Raw Link Box -->
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-top:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:0.05em;">Button not working? Copy and paste this URL into your browser:</p>
        <p style="margin:0;font-size:12px;color:#059669;word-break:break-all;font-family:monospace;">
          <a href="%s" style="color:#059669;text-decoration:none;">%s</a>
        </p>
      </div>
    </td>
  </tr>

  <!-- Professional Light Footer -->
  <tr>
    <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">© %d CostOp · All rights reserved</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">Need assistance? Reply directly or email <a href="mailto:help@costop.in" style="color:#059669;text-decoration:none;">help@costop.in</a></p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`, displayName, verifyURL, verifyURL, verifyURL, time.Now().Year())

	params := &resend.SendEmailRequest{
		From:    "CostOp <help@costop.in>",
		To:      []string{toEmail},
		Subject: "Verify your email address for CostOp",
		Html:    htmlBody,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("[EMAIL ERROR] SendVerificationEmail error: %v\n", err)
		return err
	}
	return nil
}



