package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type MonthlySpend struct {
	Month string  `json:"month"`
	Spend float64 `json:"spend"`
}

// GetHistoricalSpends maps retroactive monthly expenditures mathematically
func GetHistoricalSpends(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	teamID := user.DefaultTeamID

	var subscriptions []models.Subscription
	if err := database.DB.Where("team_id = ?", teamID).Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	startQ := c.Query("start") // format: YYYY-MM
	endQ := c.Query("end")     // format: YYYY-MM
	monthsQ := c.Query("months")

	now := time.Now().UTC()
	var startMonth, endMonth time.Time

	// Attempt to parse explicit partial bounds
	var s, e time.Time
	hasStart, hasEnd := false, false

	if startQ != "" {
		if parsed, err := time.Parse("2006-01", startQ); err == nil {
			s = parsed
			hasStart = true
		}
	}
	if endQ != "" {
		if parsed, err := time.Parse("2006-01", endQ); err == nil {
			e = parsed
			hasEnd = true
		}
	}

	// Resolve the dynamic bounds logically based on combinations supplied
	if hasStart && hasEnd && !s.After(e) {
		startMonth = s
		endMonth = e
	} else if hasStart && !hasEnd {
		// Only Start Selected
		startMonth = s
		endMonth = now
	} else if !hasStart && hasEnd {
		// Only End Selected
		endMonth = e
		earliest := e.AddDate(-1, 0, 0) // default 1 year buffer fallback
		if len(subscriptions) > 0 {
			earliest = subscriptions[0].StartDate
			for _, sub := range subscriptions {
				if sub.StartDate.Before(earliest) {
					earliest = sub.StartDate
				}
			}
		}
		if earliest.After(e) {
			earliest = e
		}
		startMonth = earliest
	}

	// Fallback to "months" logic if explicit date range is invalid/unset entirely
	if startMonth.IsZero() {
		months := 6
		if m, err := strconv.Atoi(monthsQ); err == nil && m > 0 && m <= 120 {
			months = m
		}
		endMonth = now
		startMonth = now.AddDate(0, -(months - 1), 0)
	}

	// Normalize to the exact first millisecond of the month securely natively mapping logic
	startMonth = time.Date(startMonth.Year(), startMonth.Month(), 1, 0, 0, 0, 0, startMonth.Location())
	endMonth = time.Date(endMonth.Year(), endMonth.Month(), 1, 0, 0, 0, 0, endMonth.Location())

	var result []MonthlySpend

	// Synthesize loop forward strictly chronologically from startMonth -> endMonth
	current := startMonth
	for !current.After(endMonth) {
		monthStart := current
		monthEnd := monthStart.AddDate(0, 1, -1).Add(24*time.Hour - time.Nanosecond)

		var totalSpend float64

		for _, sub := range subscriptions {
			if sub.StartDate.After(monthEnd) {
				continue
			}

			if sub.Status == "archived" && sub.UpdatedAt.Before(monthStart) {
				continue
			}

			if sub.BillingCycle == "Yearly" {
				if sub.StartDate.Month() == current.Month() {
					totalSpend += sub.Cost
				}
			} else {
				totalSpend += sub.Cost
			}
		}

		result = append(result, MonthlySpend{
			Month: current.Format("Jan 2006"), // e.g. "Oct 2025"
			Spend: totalSpend,
		})

		current = current.AddDate(0, 1, 0) // Shift safely to the explicit boundary next month natively
	}

	c.JSON(http.StatusOK, result)
}

// GetDepartmentSpendHistory aggregates all-time spend grouped by department (team_name) for history screen
func GetDepartmentSpendHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	teamID := user.DefaultTeamID

	var subscriptions []models.Subscription
	if err := database.DB.Where("team_id = ?", teamID).Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	type DepartmentSpend struct {
		Department string  `json:"department"`
		Spend      float64 `json:"spend"`
	}

	deptMap := make(map[string]float64)

	// Since this is for historical data, we will just sum all costs assuming each was paid exactly once per cycle since its start date natively.
	// But actually, for simplicity mirroring the dashboard, let's just aggregate the nominal *current* cost of all items ever created as their relative weight in the portfolio.
	// Wait, the history metric might want absolute accumulated spend. But the user asked for "spend by team like Marketing... in current ongoing plan which we show on /home... and implement same for /history".
	// For history, let's calculate the same amortized monthly cost of all historical (and active) subscriptions, to show historical ongoing run-rate by department, OR the accumulated cost.
	// Let's do accumulated total cost for history to make it different, or amortized. Let's do amortized monthly run-rate for all active+archived logic to see where the money *was* going.
	// Actually, just sum the active+archived amortized cost.

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

		dept := sub.TeamName
		if dept == "" {
			dept = "Unassigned"
		}
		deptMap[dept] += monthlyEquiv
	}

	var deptSpends []DepartmentSpend
	for dept, spend := range deptMap {
		deptSpends = append(deptSpends, DepartmentSpend{Department: dept, Spend: spend})
	}

	// Sort by spend descending
	// todo: optimise this
	for i := 0; i < len(deptSpends); i++ {
		for j := i + 1; j < len(deptSpends); j++ {
			if deptSpends[i].Spend < deptSpends[j].Spend {
				deptSpends[i], deptSpends[j] = deptSpends[j], deptSpends[i]
			}
		}
	}

	c.JSON(http.StatusOK, deptSpends)
}
