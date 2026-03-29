package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ── Duplicate Tools ──────────────────────────────────────────────────────────

// DuplicateToolGroup represents a subscription name that exists across multiple teams.
type DuplicateToolGroup struct {
	Name             string   `json:"name"`
	Category         string   `json:"category"`
	TeamCount        int      `json:"team_count"`
	TeamNames        []string `json:"team_names"`
	TotalMonthlyCost float64  `json:"total_monthly_cost"`
	SubscriptionIDs  []uint   `json:"subscription_ids"`
}

// GetDuplicateTools finds subscriptions with the same name across multiple teams.
// GET /api/insights/duplicates
func GetDuplicateTools(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	// Step 1: get all active subscriptions for this org
	var subs []models.Subscription
	database.DB.Where("org_id = ? AND status = 'active'", user.OrgID).Find(&subs)

	// Step 2: get all subscription_team mappings for these subs
	subIDs := make([]uint, len(subs))
	subMap := make(map[uint]models.Subscription)
	for i, s := range subs {
		subIDs[i] = s.ID
		subMap[s.ID] = s
	}

	if len(subIDs) == 0 {
		c.JSON(http.StatusOK, []DuplicateToolGroup{})
		return
	}

	type stRow struct {
		SubscriptionID uint
		TeamID         uint
	}
	var stRows []stRow
	database.DB.Model(&models.SubscriptionTeam{}).
		Select("subscription_id, team_id").
		Where("subscription_id IN ?", subIDs).
		Find(&stRows)

	// Step 3: fetch team names
	teamIDSet := make(map[uint]bool)
	for _, r := range stRows {
		teamIDSet[r.TeamID] = true
	}
	teamIDs := make([]uint, 0, len(teamIDSet))
	for id := range teamIDSet {
		teamIDs = append(teamIDs, id)
	}
	teamNameMap := make(map[uint]string)
	if len(teamIDs) > 0 {
		var teams []models.Team
		database.DB.Where("id IN ?", teamIDs).Find(&teams)
		for _, t := range teams {
			teamNameMap[t.ID] = t.Name
		}
	}

	// Step 4: group by subscription name → collect teams
	type nameGroup struct {
		teamIDs map[uint]bool
		subIDs  map[uint]bool
	}
	groups := make(map[string]*nameGroup)
	for _, r := range stRows {
		sub, ok := subMap[r.SubscriptionID]
		if !ok {
			continue
		}
		key := sub.Name
		if groups[key] == nil {
			groups[key] = &nameGroup{teamIDs: make(map[uint]bool), subIDs: make(map[uint]bool)}
		}
		groups[key].teamIDs[r.TeamID] = true
		groups[key].subIDs[r.SubscriptionID] = true
	}

	// Step 5: build result — only groups with 2+ teams
	results := make([]DuplicateToolGroup, 0)
	for name, g := range groups {
		if len(g.teamIDs) < 2 {
			continue
		}
		teamNames := make([]string, 0, len(g.teamIDs))
		for tid := range g.teamIDs {
			teamNames = append(teamNames, teamNameMap[tid])
		}
		subIDList := make([]uint, 0, len(g.subIDs))
		var totalMonthly float64
		var category string
		for sid := range g.subIDs {
			subIDList = append(subIDList, sid)
			s := subMap[sid]
			category = s.Category
			switch s.BillingCycle {
			case "Yearly":
				totalMonthly += s.Cost / 12.0
			default:
				totalMonthly += s.Cost
			}
		}
		results = append(results, DuplicateToolGroup{
			Name:             name,
			Category:         category,
			TeamCount:        len(g.teamIDs),
			TeamNames:        teamNames,
			TotalMonthlyCost: totalMonthly,
			SubscriptionIDs:  subIDList,
		})
	}

	c.JSON(http.StatusOK, results)
}

// ── Unused Seats ─────────────────────────────────────────────────────────────

// UnusedSeatEntry represents a subscription with seats paid but not assigned.
type UnusedSeatEntry struct {
	SubscriptionID uint    `json:"subscription_id"`
	Name           string  `json:"name"`
	Category       string  `json:"category"`
	BillingCycle   string  `json:"billing_cycle"`
	Cost           float64 `json:"cost"`
	SeatCount      int     `json:"seat_count"`
	AssignedCount  int     `json:"assigned_count"`
	UnusedCount    int     `json:"unused_count"`
	WastedCost     float64 `json:"wasted_cost"`
}

// GetUnusedSeats finds subscriptions where assigned seats < total seats.
// GET /api/insights/unused-seats
func GetUnusedSeats(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	// Get active subscriptions with seat_count > 1 and exclude organization scope
	var subs []models.Subscription
	database.DB.Where("org_id = ? AND status = 'active' AND seat_count > 1 AND scope != 'organization'", user.OrgID).Find(&subs)

	if len(subs) == 0 {
		c.JSON(http.StatusOK, []UnusedSeatEntry{})
		return
	}

	// Bulk fetch assignment counts
	subIDs := make([]uint, len(subs))
	for i, s := range subs {
		subIDs[i] = s.ID
	}

	type countResult struct {
		SubscriptionID uint
		Count          int
	}
	var counts []countResult
	database.DB.Model(&models.SubscriptionAssignment{}).
		Select("subscription_id, count(*) as count").
		Where("subscription_id IN ?", subIDs).
		Group("subscription_id").
		Find(&counts)

	countMap := make(map[uint]int)
	for _, c := range counts {
		countMap[c.SubscriptionID] = c.Count
	}

	// Build results — only include subs with unused seats
	results := make([]UnusedSeatEntry, 0)
	for _, s := range subs {
		assigned := countMap[s.ID]
		unused := s.SeatCount - assigned
		if unused <= 0 {
			continue
		}

		var monthlyCost float64
		switch s.BillingCycle {
		case "Yearly":
			monthlyCost = s.Cost / 12.0
		default:
			monthlyCost = s.Cost
		}
		costPerSeat := monthlyCost / float64(s.SeatCount)
		wastedCost := costPerSeat * float64(unused)

		results = append(results, UnusedSeatEntry{
			SubscriptionID: s.ID,
			Name:           s.Name,
			Category:       s.Category,
			BillingCycle:   s.BillingCycle,
			Cost:           s.Cost,
			SeatCount:      s.SeatCount,
			AssignedCount:  assigned,
			UnusedCount:    unused,
			WastedCost:     wastedCost,
		})
	}

	c.JSON(http.StatusOK, results)
}
