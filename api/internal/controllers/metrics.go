package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
)

type DepartmentSpend struct {
	Department string  `json:"department"`
	Spend      float64 `json:"spend"`
}

type MetricsResponse struct {
	TotalMonthlySpend float64               `json:"total_monthly_spend"`
	UpcomingRenewals  []models.Subscription `json:"upcoming_renewals"`
	DepartmentSpends  []DepartmentSpend     `json:"department_spends"`
	ActiveCount       int                   `json:"active_subscriptions"`
}

func GetMetrics(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Apply the same filters that the subscriptions list uses so widgets stay in sync
	search := c.Query("search")
	category := c.Query("category")
	cycle := c.Query("cycle")

	subsQuery := database.DB.Where("team_id = ? AND status = ?", user.DefaultTeamID, "active")
	if search != "" {
		subsQuery = subsQuery.Where("name ILIKE ?", "%"+search+"%")
	}
	if category != "" && category != "All Categories" {
		subsQuery = subsQuery.Where("category = ?", category)
	}
	if cycle != "" && cycle != "All Cycles" {
		subsQuery = subsQuery.Where("billing_cycle = ?", cycle)
	}

	// Sync date filtering with the subscription list
	startDate := c.Query("start")
	endDate := c.Query("end")
	if startDate != "" {
		subsQuery = subsQuery.Where("next_billing_date >= ?", startDate)
	}
	if endDate != "" {
		subsQuery = subsQuery.Where("next_billing_date < date_trunc('month', ?::date) + interval '1 month'", endDate)
	}

	var subscriptions []models.Subscription
	if err := subsQuery.Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions for metrics"})
		return
	}

	var totalMonthlySpend float64 = 0
	deptMap := make(map[string]float64)

	for _, sub := range subscriptions {
		var monthlyEquiv float64
		switch sub.BillingCycle {
		case "Monthly":
			monthlyEquiv = sub.Cost
		case "Yearly":
			monthlyEquiv = sub.Cost / 12.0
		default:
			monthlyEquiv = sub.Cost
		}

		totalMonthlySpend += monthlyEquiv

		dept := sub.TeamName
		if dept == "" {
			dept = "Unassigned"
		}
		deptMap[dept] += monthlyEquiv
	}

	// Sort department spends descending by spend
	deptSpends := make([]DepartmentSpend, 0, len(deptMap))
	for dept, spend := range deptMap {
		deptSpends = append(deptSpends, DepartmentSpend{Department: dept, Spend: spend})
	}
	sort.Slice(deptSpends, func(i, j int) bool {
		return deptSpends[i].Spend > deptSpends[j].Spend
	})

	// Upcoming renewals: filtered to subscriptions that survive the active filters
	now := time.Now()
	thirtyDaysFromNow := now.AddDate(0, 0, 31)

	renewalQuery := database.DB.Where(
		"team_id = ? AND status = ? AND is_auto_pay = ? AND next_billing_date BETWEEN ? AND ?",
		user.DefaultTeamID, "active", true, now.AddDate(0, 0, -1), thirtyDaysFromNow,
	).Order("next_billing_date ASC")

	// Apply the same filters to renewals
	if search != "" {
		renewalQuery = renewalQuery.Where("name ILIKE ?", "%"+search+"%")
	}
	if category != "" && category != "All Categories" {
		renewalQuery = renewalQuery.Where("category = ?", category)
	}
	if cycle != "" && cycle != "All Cycles" {
		renewalQuery = renewalQuery.Where("billing_cycle = ?", cycle)
	}

	var upcomingRenewals []models.Subscription
	if err := renewalQuery.Find(&upcomingRenewals).Error; err != nil {
		upcomingRenewals = []models.Subscription{}
	}

	c.JSON(http.StatusOK, MetricsResponse{
		TotalMonthlySpend: totalMonthlySpend,
		UpcomingRenewals:  upcomingRenewals,
		DepartmentSpends:  deptSpends,
		ActiveCount:       len(subscriptions),
	})
}
