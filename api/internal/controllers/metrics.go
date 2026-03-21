package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type MetricsResponse struct {
	TotalMonthlySpend float64               `json:"total_monthly_spend"`
	UpcomingRenewals  []models.Subscription `json:"upcoming_renewals"`
}

func GetMetrics(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// 1. Calculate Total Monthly Spend
	// For simplicity in MVP, we sum up Monthly costs.
	// If a plan is Yearly, we could divide by 12, but for now we'll just sum all active auto-pay/monthly subs dynamically.
	var subscriptions []models.Subscription
	if err := database.DB.Where("team_id = ? AND status = ?", user.DefaultTeamID, "active").Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions for metrics"})
		return
	}

	var totalMonthlySpend float64 = 0
	for _, sub := range subscriptions {
		if sub.BillingCycle == "Monthly" {
			totalMonthlySpend += sub.Cost
		} else if sub.BillingCycle == "Yearly" {
			totalMonthlySpend += sub.Cost / 12.0 // amortize yearly cost to monthly
		} else {
			totalMonthlySpend += sub.Cost // assuming One-Time is counted once in that month, or skip it
		}
	}

	// 2. Calculate Upcoming Renewals (next 30 days)
	// Using a generous 31 day bound padding to catch anything offset by local timezones
	now := time.Now()
	thirtyDaysFromNow := now.AddDate(0, 0, 31)

	var upcomingRenewals []models.Subscription
	if err := database.DB.Where("team_id = ? AND status = ? AND is_auto_pay = ? AND next_billing_date BETWEEN ? AND ?", user.DefaultTeamID, "active", true, now.AddDate(0, 0, -1), thirtyDaysFromNow).Order("next_billing_date ASC").Find(&upcomingRenewals).Error; err != nil {
		// Log error but don't fail the whole request
		upcomingRenewals = []models.Subscription{}
	}

	c.JSON(http.StatusOK, MetricsResponse{
		TotalMonthlySpend: totalMonthlySpend,
		UpcomingRenewals:  upcomingRenewals,
	})
}
