package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateRequest allows any team member to submit a subscription request for admin approval.
// POST /api/requests  { name, category, plan_type, billing_cycle, cost, seat_count, scope, justification }
func CreateRequest(c *gin.Context) {
	requesterID := c.MustGet("userID").(uint)

	var input struct {
		Name          string  `json:"name" binding:"required"`
		Category      string  `json:"category"`
		PlanType      string  `json:"plan_type"`
		BillingCycle  string  `json:"billing_cycle"`
		Scope         string  `json:"scope"`
		Cost          float64 `json:"cost"`
		SeatCount     int     `json:"seat_count"`
		Justification string  `json:"justification"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, requesterID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Verify user is actually a member of their own default team
	var membership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, requesterID).First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You must be a team member to submit requests"})
		return
	}

	scope := input.Scope
	if scope == "" {
		scope = "team"
	}
	seatCount := input.SeatCount
	if seatCount < 1 {
		seatCount = 1
	}

	req := models.SubscriptionRequest{
		RequesterID:   requesterID,
		TeamID:        user.DefaultTeamID,
		Name:          input.Name,
		Category:      input.Category,
		PlanType:      input.PlanType,
		BillingCycle:  input.BillingCycle,
		Scope:         scope,
		Cost:          input.Cost,
		SeatCount:     seatCount,
		Justification: input.Justification,
		Status:        "pending",
	}
	if err := database.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription request"})
		return
	}

	c.JSON(http.StatusCreated, req)
}

// GetRequests returns all subscription requests for the caller's current team.
// Supports ?status=pending|approved|rejected (defaults to all if omitted).
// Owners see all; members only see their own requests.
// GET /api/requests
func GetRequests(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var membership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, userID).First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a team member"})
		return
	}

	query := database.DB.Where("team_id = ?", user.DefaultTeamID)

	// Non-owners only see their own requests
	if membership.Role != "owner" {
		query = query.Where("requester_id = ?", userID)
	}

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var requests []models.SubscriptionRequest
	if err := query.Order("created_at DESC").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	// Enrich with user names
	for i, req := range requests {
		var requester models.User
		if database.DB.First(&requester, req.RequesterID).Error == nil {
			requests[i].RequesterName = requester.Name
		}
		if req.ReviewedBy != nil {
			var reviewer models.User
			if database.DB.First(&reviewer, *req.ReviewedBy).Error == nil {
				requests[i].ReviewerName = reviewer.Name
			}
		}
	}

	c.JSON(http.StatusOK, requests)
}

// ApproveRequest approves a pending request and atomically creates the subscription.
// Only team owners can approve.
// PATCH /api/requests/:id/approve
func ApproveRequest(c *gin.Context) {
	reviewerID := c.MustGet("userID").(uint)
	requestID := c.Param("id")

	var reviewer models.User
	if err := database.DB.First(&reviewer, reviewerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Must be an owner
	var membership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", reviewer.DefaultTeamID, reviewerID).First(&membership).Error; err != nil || membership.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only team owners can approve requests"})
		return
	}

	var req models.SubscriptionRequest
	if err := database.DB.Where("id = ? AND team_id = ?", requestID, reviewer.DefaultTeamID).First(&req).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}
	if req.Status != "pending" {
		c.JSON(http.StatusConflict, gin.H{"error": "Request has already been reviewed"})
		return
	}

	// Atomically: update request + create subscription
	now := time.Now()
	// Next billing date defaults to 1 month from now for monthly, 1 year for yearly
	nextBilling := now.AddDate(0, 1, 0)
	if req.BillingCycle == "Yearly" {
		nextBilling = now.AddDate(1, 0, 0)
	}

	teamID := req.TeamID
	sub := models.Subscription{
		UserID:          reviewerID, // admin who approved it, administrative entry
		OwnerID:         req.RequesterID,
		TeamID:          &teamID,
		Scope:           req.Scope,
		Name:            req.Name,
		Category:        req.Category,
		PlanType:        req.PlanType,
		BillingCycle:    req.BillingCycle,
		Cost:            req.Cost,
		SeatCount:       req.SeatCount,
		IsAutoPay:       false,
		StartDate:       now,
		NextBillingDate: nextBilling,
		Status:          "active",
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&sub).Error; err != nil {
			return err
		}
		return tx.Model(&req).Updates(map[string]interface{}{
			"status":      "approved",
			"reviewed_by": reviewerID,
		}).Error
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Request approved and subscription created",
		"subscription": sub,
	})
}

// RejectRequest marks a request as rejected. Only team owners can reject.
// PATCH /api/requests/:id/reject
func RejectRequest(c *gin.Context) {
	reviewerID := c.MustGet("userID").(uint)
	requestID := c.Param("id")

	var reviewer models.User
	if err := database.DB.First(&reviewer, reviewerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var membership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", reviewer.DefaultTeamID, reviewerID).First(&membership).Error; err != nil || membership.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only team owners can reject requests"})
		return
	}

	var req models.SubscriptionRequest
	if err := database.DB.Where("id = ? AND team_id = ?", requestID, reviewer.DefaultTeamID).First(&req).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}
	if req.Status != "pending" {
		c.JSON(http.StatusConflict, gin.H{"error": "Request has already been reviewed"})
		return
	}

	if err := database.DB.Model(&req).Updates(map[string]interface{}{
		"status":      "rejected",
		"reviewed_by": reviewerID,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request rejected"})
}
