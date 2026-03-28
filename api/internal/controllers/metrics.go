package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

	var teamFilter uint = user.DefaultTeamID
	isAllTeams := false
	if tid := c.Query("team_id"); tid != "" {
		if tid == "all" {
			isAllTeams = true
		} else if parsed, err := strconv.Atoi(tid); err == nil {
			teamFilter = uint(parsed)
		}
	}

	var subsQuery *gorm.DB
	if isAllTeams {
		// Org-wide: same workspace-network subquery as GetSubscriptions
		subsQuery = database.DB.Where(
			`(team_id IN (
				SELECT DISTINCT tm2.team_id FROM team_members tm2
				WHERE tm2.user_id IN (
					SELECT DISTINCT tm1.user_id FROM team_members tm1
					WHERE tm1.team_id IN (
						SELECT team_id FROM team_members WHERE user_id = ?
					)
				)
			) OR (scope = 'individual' AND owner_id IN (
				SELECT DISTINCT tm1.user_id FROM team_members tm1
				WHERE tm1.team_id IN (
					SELECT team_id FROM team_members WHERE user_id = ?
				)
			)) OR (team_id IS NULL AND owner_id IN (
				SELECT DISTINCT tm1.user_id FROM team_members tm1
				WHERE tm1.team_id IN (
					SELECT team_id FROM team_members WHERE user_id = ?
				)
			))) AND status = ?`,
			user.ID, user.ID, user.ID, "active",
		)
	} else {
		// Single-team view
		subsQuery = database.DB.Where(
			"(team_id = ? OR (scope = 'individual' AND user_id = ?) OR owner_id = ? OR (scope = 'organization' AND owner_id IN (SELECT user_id FROM team_members WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)))) AND status = ?",
			teamFilter, user.ID, user.ID, user.ID, "active",
		)
	}

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
	log.Printf("[METRICS DEBUG] userID=%d isAllTeams=%v teamFilter=%d team_id_param=%q found=%d", user.ID, isAllTeams, teamFilter, c.Query("team_id"), len(subscriptions))

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

		dept := sub.Category
		if dept == "" {
			dept = "Uncategorized"
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
		`(team_id IN (
			SELECT DISTINCT tm2.team_id FROM team_members tm2
			WHERE tm2.user_id IN (
				SELECT DISTINCT tm1.user_id FROM team_members tm1
				WHERE tm1.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
			)
		) OR team_id IS NULL AND owner_id IN (
			SELECT DISTINCT tm1.user_id FROM team_members tm1
			WHERE tm1.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
		)) AND status = ? AND is_auto_pay = ? AND next_billing_date BETWEEN ? AND ?`,
		user.ID, user.ID, "active", true, now.AddDate(0, 0, -1), thirtyDaysFromNow,
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
