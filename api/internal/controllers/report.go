package controllers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"costop/internal/database"
	"costop/internal/models"

	"github.com/gin-gonic/gin"
)

// MonthlyReportResponse represents the structured JSON executive summary.
type MonthlyReportResponse struct {
	OrganizationName     string                 `json:"organization_name"`
	GeneratedAt          time.Time              `json:"generated_at"`
	ReportPeriod         string                 `json:"report_period"`
	TotalMonthlySpend    float64                `json:"total_monthly_spend"`
	AnnualRunRate        float64                `json:"annual_run_rate"`
	ActiveSubscriptions  int                    `json:"active_subscriptions"`
	TotalActiveMembers   int64                  `json:"total_active_members"`
	CategoryBreakdown    []CategorySpendReport  `json:"category_breakdown"`
	Subscriptions        []SubscriptionReport   `json:"subscriptions"`
	UpcomingRenewals     []RenewalWatchlist     `json:"upcoming_renewals"`
}

type CategorySpendReport struct {
	Category   string  `json:"category"`
	Spend      float64 `json:"spend"`
	Percentage float64 `json:"percentage"`
}

type SubscriptionReport struct {
	ID              uint      `json:"id"`
	Name            string    `json:"name"`
	Category        string    `json:"category"`
	BillingCycle    string    `json:"billing_cycle"`
	Cost            float64   `json:"cost"`
	MonthlyCost     float64   `json:"monthly_cost"`
	SeatCount       int       `json:"seat_count"`
	IsAutoPay       bool      `json:"is_auto_pay"`
	NextBillingDate time.Time `json:"next_billing_date"`
}

type RenewalWatchlist struct {
	Name            string    `json:"name"`
	NextBillingDate time.Time `json:"next_billing_date"`
	DaysUntil       int       `json:"days_until"`
	Cost            float64   `json:"cost"`
	IsAutoPay       bool      `json:"is_auto_pay"`
}

// GetMonthlyReport generates and returns executive report data (in JSON or CSV).
// GET /api/reports/monthly?format=csv|json
func GetMonthlyReport(c *gin.Context) {
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

	// Gated to Pro Tier
	if org.Plan != "pro" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Monthly Executive Report is a Pro feature. Please upgrade to Pro to download CSV and PDF reports.",
			"code":  "PRO_REQUIRED",
		})
		return
	}

	// Fetch active subscriptions
	var subs []models.Subscription
	database.DB.Where("org_id = ? AND status = ?", org.ID, "active").Order("name ASC").Find(&subs)

	// Fetch active member count
	var activeMembersCount int64
	database.DB.Model(&models.User{}).Where("org_id = ? AND deleted_at IS NULL", org.ID).Count(&activeMembersCount)

	now := time.Now()
	next30Days := now.AddDate(0, 0, 30)

	var totalMonthlySpend float64
	categoryMap := make(map[string]float64)
	subReports := make([]SubscriptionReport, 0, len(subs))
	upcoming := make([]RenewalWatchlist, 0)

	for _, s := range subs {
		monthlyEquivalent := s.Cost
		if strings.EqualFold(s.BillingCycle, "Yearly") {
			monthlyEquivalent = s.Cost / 12.0
		} else if strings.EqualFold(s.BillingCycle, "One Time") {
			monthlyEquivalent = 0
		}

		totalMonthlySpend += monthlyEquivalent
		catName := s.Category
		if catName == "" {
			catName = "General"
		}
		categoryMap[catName] += monthlyEquivalent

		subReports = append(subReports, SubscriptionReport{
			ID:              s.ID,
			Name:            s.Name,
			Category:        catName,
			BillingCycle:    s.BillingCycle,
			Cost:            s.Cost,
			MonthlyCost:     monthlyEquivalent,
			SeatCount:       s.SeatCount,
			IsAutoPay:       s.IsAutoPay,
			NextBillingDate: s.NextBillingDate,
		})

		// Upcoming renewal check
		if s.NextBillingDate.After(now.AddDate(0, 0, -1)) && s.NextBillingDate.Before(next30Days) {
			daysUntil := int(s.NextBillingDate.Sub(now).Hours() / 24)
			if daysUntil < 0 {
				daysUntil = 0
			}
			upcoming = append(upcoming, RenewalWatchlist{
				Name:            s.Name,
				NextBillingDate: s.NextBillingDate,
				DaysUntil:       daysUntil,
				Cost:            s.Cost,
				IsAutoPay:       s.IsAutoPay,
			})
		}
	}

	annualRunRate := totalMonthlySpend * 12.0

	// Category breakdown calculation
	catBreakdown := make([]CategorySpendReport, 0, len(categoryMap))
	for cat, spend := range categoryMap {
		pct := 0.0
		if totalMonthlySpend > 0 {
			pct = (spend / totalMonthlySpend) * 100.0
		}
		catBreakdown = append(catBreakdown, CategorySpendReport{
			Category:   cat,
			Spend:      spend,
			Percentage: pct,
		})
	}
	sort.Slice(catBreakdown, func(i, j int) bool {
		return catBreakdown[i].Spend > catBreakdown[j].Spend
	})

	sort.Slice(upcoming, func(i, j int) bool {
		return upcoming[i].NextBillingDate.Before(upcoming[j].NextBillingDate)
	})

	reportPeriod := now.Format("January 2006")

	// Check if user requested CSV
	if c.Query("format") == "csv" {
		c.Header("Content-Type", "text/csv; charset=utf-8")
		filename := fmt.Sprintf("CostOp_Executive_Report_%s.csv", now.Format("2006_01"))
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		// Report Header
		writer.Write([]string{"COSTOP EXECUTIVE MONTHLY SPEND REPORT"})
		writer.Write([]string{"Organization", org.Name})
		writer.Write([]string{"Report Period", reportPeriod})
		writer.Write([]string{"Generated On", now.Format("2006-01-02 15:04:05")})
		writer.Write([]string{""})

		// Executive KPIs
		writer.Write([]string{"EXECUTIVE SUMMARY METRICS"})
		writer.Write([]string{"Metric", "Value"})
		writer.Write([]string{"Total Monthly Spend ($)", fmt.Sprintf("%.2f", totalMonthlySpend)})
		writer.Write([]string{"Projected Annual Run-Rate ($)", fmt.Sprintf("%.2f", annualRunRate)})
		writer.Write([]string{"Active Subscriptions Count", fmt.Sprintf("%d", len(subs))})
		writer.Write([]string{"Active Team Members Count", fmt.Sprintf("%d", activeMembersCount)})
		writer.Write([]string{""})

		// Category Breakdown
		writer.Write([]string{"DEPARTMENT / CATEGORY SPEND BREAKDOWN"})
		writer.Write([]string{"Category", "Monthly Spend ($)", "% of Spend"})
		for _, cb := range catBreakdown {
			writer.Write([]string{cb.Category, fmt.Sprintf("%.2f", cb.Spend), fmt.Sprintf("%.1f%%", cb.Percentage)})
		}
		writer.Write([]string{""})

		// Subscriptions Table
		writer.Write([]string{"ACTIVE SUBSCRIPTIONS INVENTORY"})
		writer.Write([]string{"Subscription Name", "Category", "Billing Cycle", "Plan Cost ($)", "Monthly Equivalent ($)", "Seat Count", "Next Billing Date", "Auto-Pay"})
		for _, s := range subReports {
			autoPayStr := "Manual"
			if s.IsAutoPay {
				autoPayStr = "Auto-Pay"
			}
			dateStr := s.NextBillingDate.Format("2006-01-02")
			writer.Write([]string{
				s.Name,
				s.Category,
				s.BillingCycle,
				fmt.Sprintf("%.2f", s.Cost),
				fmt.Sprintf("%.2f", s.MonthlyCost),
				fmt.Sprintf("%d", s.SeatCount),
				dateStr,
				autoPayStr,
			})
		}
		writer.Write([]string{""})

		// Upcoming Renewals
		writer.Write([]string{"UPCOMING RENEWALS WATCHLIST (NEXT 30 DAYS)"})
		writer.Write([]string{"Subscription Name", "Renewal Date", "Days Until Renewal", "Amount Due ($)", "Payment Mode"})
		for _, u := range upcoming {
			mode := "Manual"
			if u.IsAutoPay {
				mode = "Auto-Pay"
			}
			writer.Write([]string{
				u.Name,
				u.NextBillingDate.Format("2006-01-02"),
				fmt.Sprintf("%d", u.DaysUntil),
				fmt.Sprintf("%.2f", u.Cost),
				mode,
			})
		}

		return
	}

	// Default JSON response
	c.JSON(http.StatusOK, MonthlyReportResponse{
		OrganizationName:    org.Name,
		GeneratedAt:         now,
		ReportPeriod:        reportPeriod,
		TotalMonthlySpend:   totalMonthlySpend,
		AnnualRunRate:       annualRunRate,
		ActiveSubscriptions: len(subs),
		TotalActiveMembers:  activeMembersCount,
		CategoryBreakdown:   catBreakdown,
		Subscriptions:       subReports,
		UpcomingRenewals:    upcoming,
	})
}
