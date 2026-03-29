package controllers

import (
	"costop/internal/cache"
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

// DashboardResponse is the single combined response for the dashboard.
type DashboardResponse struct {
	// Subscriptions list (enriched)
	Subscriptions []models.Subscription `json:"subscriptions"`
	// Metrics
	TotalMonthlySpend float64               `json:"total_monthly_spend"`
	UpcomingRenewals  []models.Subscription `json:"upcoming_renewals"`
	DepartmentSpends  []DepartmentSpend     `json:"department_spends"`
	ActiveCount       int                   `json:"active_subscriptions"`
	// Supporting data
	Categories []models.Category `json:"categories"`
	Teams      []TeamBasic       `json:"teams"`
}

// TeamBasic is a minimal team struct for dropdowns.
type TeamBasic struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// GetDashboard returns all data needed by the Home screen in a single API call.
// This consolidates /api/subscriptions, /api/metrics, /api/categories, and /api/teams/all.
// GET /api/dashboard
func GetDashboard(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	// ── Parse filters (shared by subscriptions + metrics) ─────────────────
	search := c.Query("search")
	category := c.Query("category")
	cycle := c.Query("cycle")
	startDate := c.Query("start")
	endDate := c.Query("end")

	var teamFilter uint = user.DefaultTeamID
	isAllTeams := false
	if tid := c.Query("team_id"); tid != "" {
		if tid == "all" {
			isAllTeams = true
		} else if parsed, err := strconv.Atoi(tid); err == nil {
			teamFilter = uint(parsed)
		}
	}

	// ── Build base subscription query ─────────────────────────────────────
	var baseQuery *gorm.DB
	if isAllTeams {
		baseQuery = orgSubscriptionQuery(user.OrgID, "active")
	} else {
		baseQuery = database.DB.Where(
			`(id IN (SELECT subscription_id FROM subscription_teams WHERE team_id = ?)
			OR (scope = 'organization' AND org_id = ?)) AND status = ?`,
			teamFilter, user.OrgID, "active",
		)
	}

	if search != "" {
		baseQuery = baseQuery.Where("name ILIKE ?", "%"+search+"%")
	}
	if category != "" && category != "All Categories" {
		baseQuery = baseQuery.Where("category = ?", category)
	}
	if cycle != "" && cycle != "All Cycles" {
		baseQuery = baseQuery.Where("billing_cycle = ?", cycle)
	}
	if startDate != "" {
		baseQuery = baseQuery.Where("next_billing_date >= ?", startDate)
	}
	if endDate != "" {
		baseQuery = baseQuery.Where("next_billing_date < date_trunc('month', ?::date) + interval '1 month'", endDate)
	}

	// ── Fetch subscriptions (ONE query, reused for metrics) ───────────────
	var subscriptions []models.Subscription
	if err := baseQuery.Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}
	log.Printf("[DASHBOARD] userID=%d isAllTeams=%v found=%d subs", user.ID, isAllTeams, len(subscriptions))

	// ── Compute metrics + renewals from the same data (ZERO extra queries) ─
	var totalMonthlySpend float64
	deptMap := make(map[string]float64)
	now := time.Now()
	thirtyDaysFromNow := now.AddDate(0, 0, 31)
	yesterday := now.AddDate(0, 0, -1)
	var upcomingRenewals []models.Subscription

	// We also need renewals from ALL active org subscriptions, not just filtered ones.
	// If filters are applied (search/category/cycle/date), fetch renewals from unfiltered org data.
	needSeparateRenewals := search != "" || (category != "" && category != "All Categories") ||
		(cycle != "" && cycle != "All Cycles") || startDate != "" || endDate != ""

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

		// Collect renewals from this dataset if no extra filters are applied
		if !needSeparateRenewals && sub.IsAutoPay && !sub.NextBillingDate.IsZero() &&
			sub.NextBillingDate.After(yesterday) && sub.NextBillingDate.Before(thirtyDaysFromNow) {
			upcomingRenewals = append(upcomingRenewals, sub)
		}
	}

	// If filters narrowed the subscription list, fetch renewals separately from the full org data
	if needSeparateRenewals {
		renewalQuery := database.DB.Where(
			"org_id = ? AND status = ? AND is_auto_pay = ? AND next_billing_date BETWEEN ? AND ?",
			user.OrgID, "active", true, yesterday, thirtyDaysFromNow,
		).Order("next_billing_date ASC")
		renewalQuery.Find(&upcomingRenewals)
	} else {
		// Sort renewals by next_billing_date
		sort.Slice(upcomingRenewals, func(i, j int) bool {
			return upcomingRenewals[i].NextBillingDate.Before(upcomingRenewals[j].NextBillingDate)
		})
	}

	deptSpends := make([]DepartmentSpend, 0, len(deptMap))
	for dept, spend := range deptMap {
		deptSpends = append(deptSpends, DepartmentSpend{Department: dept, Spend: spend})
	}
	sort.Slice(deptSpends, func(i, j int) bool {
		return deptSpends[i].Spend > deptSpends[j].Spend
	})

	// ── Categories (cached, 0 queries on cache hit) ──────────────────────
	categories := getCachedCategories()

	// ── Teams (cached, 0 queries on cache hit) ───────────────────────────
	teams := getCachedTeams()

	// ── Enrich subscriptions (2 bulk queries) ────────────────────────────
	enriched := enrichSubscriptions(subscriptions)

	c.JSON(http.StatusOK, DashboardResponse{
		Subscriptions:     enriched,
		TotalMonthlySpend: totalMonthlySpend,
		UpcomingRenewals:  upcomingRenewals,
		DepartmentSpends:  deptSpends,
		ActiveCount:       len(subscriptions),
		Categories:        categories,
		Teams:             teams,
	})
}

// getCachedCategories returns categories from cache or DB (cached for 60s).
func getCachedCategories() []models.Category {
	const cacheKey = "categories_all"
	if cached, ok := cache.AppCache.Get(cacheKey); ok {
		return cached.([]models.Category)
	}
	var categories []models.Category
	database.DB.Order("name asc").Find(&categories)
	cache.AppCache.Set(cacheKey, categories, 60*time.Second)
	return categories
}

// getCachedTeams returns teams from cache or DB (cached for 60s).
func getCachedTeams() []TeamBasic {
	const cacheKey = "teams_all"
	if cached, ok := cache.AppCache.Get(cacheKey); ok {
		return cached.([]TeamBasic)
	}
	var teams []models.Team
	database.DB.Find(&teams)
	result := make([]TeamBasic, 0, len(teams))
	for _, t := range teams {
		result = append(result, TeamBasic{ID: t.ID, Name: t.Name})
	}
	cache.AppCache.Set(cacheKey, result, 60*time.Second)
	return result
}

// InvalidateCategoryCache clears the categories cache (call after adding a category).
func InvalidateCategoryCache() {
	cache.AppCache.Invalidate("categories_all")
}

// InvalidateTeamCache clears the teams cache (call after creating a team).
func InvalidateTeamCache() {
	cache.AppCache.Invalidate("teams_all")
}
