package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// enrichSubscriptions populates virtual fields (names, seat counts) for a slice of subscriptions.
func enrichSubscriptions(subs []models.Subscription) []models.Subscription {
	for i, sub := range subs {
		// Who added it
		var creator models.User
		if database.DB.First(&creator, sub.UserID).Error == nil {
			subs[i].AddedByName = creator.Name
		}
		// Who owns/pays
		var owner models.User
		if database.DB.First(&owner, sub.OwnerID).Error == nil {
			subs[i].OwnerName = owner.Name
		}
		// Who archived
		if sub.ArchivedBy != nil {
			var archiver models.User
			if database.DB.First(&archiver, *sub.ArchivedBy).Error == nil {
				subs[i].ArchivedByName = archiver.Name
			}
		}
		// Seat utilisation
		var assignedCount int64
		database.DB.Model(&models.SubscriptionAssignment{}).Where("subscription_id = ?", sub.ID).Count(&assignedCount)
		subs[i].AssignedCount = int(assignedCount)
		subs[i].AvailableSeats = sub.SeatCount - int(assignedCount)
	}
	return subs
}

func GetSubscriptions(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	status := c.DefaultQuery("status", "active")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Default to user's team; allow override via ?team_id=
	var teamFilter uint = user.DefaultTeamID
	isAllTeams := false
	if tid := c.Query("team_id"); tid != "" {
		if tid == "all" {
			isAllTeams = true
		} else if parsed, err := strconv.Atoi(tid); err == nil {
			teamFilter = uint(parsed)
		}
	}

	// Include team-scoped subs for the selected team(s) + individual subs for the user
	var query *gorm.DB
	if isAllTeams {
		// Org-wide view: return every subscription that belongs to the same workspace.
		// "Same workspace" = any team that contains a user who shares a team with the current user.
		// This prevents leaking subscriptions from other organisations in the same DB.
		query = database.DB.Where(
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
			user.ID, user.ID, user.ID, status,
		)
	} else {
		query = database.DB.Where(
			"(team_id = ? OR (scope = 'individual' AND user_id = ?) OR owner_id = ? OR (scope = 'organization' AND owner_id IN (SELECT user_id FROM team_members WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)))) AND status = ?",
			teamFilter, user.ID, user.ID, user.ID, status,
		)
	}

	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}
	if category := c.Query("category"); category != "" && category != "All Categories" {
		query = query.Where("category = ?", category)
	}
	if cycle := c.Query("cycle"); cycle != "" && cycle != "All Cycles" {
		query = query.Where("billing_cycle = ?", cycle)
	}
	if scope := c.Query("scope"); scope != "" {
		query = query.Where("scope = ?", scope)
	}
	if startDate := c.Query("start"); startDate != "" {
		query = query.Where("next_billing_date >= ?", startDate)
	}
	if endDate := c.Query("end"); endDate != "" {
		query = query.Where("next_billing_date < date_trunc('month', ?::date) + interval '1 month'", endDate)
	}

	var subscriptions []models.Subscription
	if err := query.Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	c.JSON(http.StatusOK, enrichSubscriptions(subscriptions))
}

// AddSubscription creates a new manual subscription entry (admin-only).
func AddSubscription(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req struct {
		models.Subscription
		AssignedUserIDs []uint `json:"assigned_user_ids"`
		OriginRequestID *uint  `json:"origin_request_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input := req.Subscription
	if input.Name == "" || input.Cost < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription data"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Only owners can add subscriptions
	var member models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, user.ID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
		return
	}
	if member.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can add subscriptions"})
		return
	}

	// Set server-controlled fields
	input.UserID = userID
	if input.OwnerID == 0 {
		input.OwnerID = userID
	}
	if input.Scope == "" {
		input.Scope = "team"
	}
	if input.SeatCount < 1 {
		input.SeatCount = 1
	}
	if input.Scope != "organization" && input.TeamID == nil {
		teamID := user.DefaultTeamID
		input.TeamID = &teamID
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&input).Error; err != nil {
			return err
		}

		// Approve the origin request atomically, if provided
		if req.OriginRequestID != nil {
			if err := tx.Model(&models.SubscriptionRequest{}).Where("id = ?", *req.OriginRequestID).Updates(map[string]interface{}{
				"status":      "approved",
				"reviewed_by": userID,
			}).Error; err != nil {
				return err
			}
		}

		// Create seat assignments immediately
		var assignedCount int = 0
		for _, uid := range req.AssignedUserIDs {
			if assignedCount >= input.SeatCount {
				break
			}
			assign := models.SubscriptionAssignment{
				SubscriptionID: input.ID,
				UserID:         uid,
				AssignedAt:     time.Now(),
			}
			if err := tx.Create(&assign).Error; err == nil {
				assignedCount++
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription and process request"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// ArchiveSubscription marks a subscription as archived (admin or owner of the sub).
func ArchiveSubscription(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	subID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND (owner_id = ? OR team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role = 'owner'))", uint(subID), user.ID, user.ID).First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found or unauthorized"})
		return
	}

	uid := userID
	if err := database.DB.Model(&sub).UpdateColumns(map[string]interface{}{
		"status":      "archived",
		"archived_by": uid,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription archived successfully"})
}

// DeleteSubscription soft-deletes a subscription by setting status to "deleted" (owner-only).
func DeleteSubscription(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	subID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND (owner_id = ? OR team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role = 'owner'))", uint(subID), user.ID, user.ID).First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found or unauthorized"})
		return
	}

	// Soft-delete: mark as "deleted" instead of removing from DB
	if err := database.DB.Model(&sub).UpdateColumn("status", "deleted").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription deleted successfully"})
}

// RestoreSubscription restores an archived subscription back to active.
// Only allowed if the billing period hasn't expired (next_billing_date > now).
// PATCH /api/subscriptions/:id/restore
func RestoreSubscription(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	subID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND (owner_id = ? OR team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role = 'owner')) AND status = ?", uint(subID), user.ID, user.ID, "archived").First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archived subscription not found or unauthorized"})
		return
	}

	// Only allow restore if the billing period hasn't expired
	if !sub.NextBillingDate.After(time.Now()) {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot restore — the billing period has expired. Next billing date was " + sub.NextBillingDate.Format("Jan 2, 2006")})
		return
	}

	if err := database.DB.Model(&sub).Updates(map[string]interface{}{
		"status":      "active",
		"archived_by": nil,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription restored successfully"})
}

// GetSubscriptionByID returns detailed info for a single subscription.
// Includes: subscription fields, seat assignments, owner details, and originating request (if any).
// GET /api/subscriptions/:id
func GetSubscriptionByID(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)
	subID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND (team_id IN (SELECT team_id FROM team_members WHERE user_id = ?) OR scope = 'organization' OR (scope = 'individual' AND user_id = ?) OR owner_id = ?)", uint(subID), caller.ID, caller.ID, caller.ID).First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	// Enrich the subscription
	enriched := enrichSubscriptions([]models.Subscription{sub})[0]

	// Seat assignments
	var assignments []models.SubscriptionAssignment
	database.DB.Where("subscription_id = ?", sub.ID).Find(&assignments)

	type AssignedUser struct {
		AssignmentID uint      `json:"assignment_id"`
		UserID       uint      `json:"user_id"`
		Name         string    `json:"name"`
		Email        string    `json:"email"`
		AvatarURL    string    `json:"avatar_url"`
		AssignedAt   time.Time `json:"assigned_at"`
	}
	assignedUsers := make([]AssignedUser, 0, len(assignments))
	for _, a := range assignments {
		var u models.User
		if database.DB.First(&u, a.UserID).Error == nil {
			assignedUsers = append(assignedUsers, AssignedUser{
				AssignmentID: a.ID,
				UserID:       u.ID,
				Name:         u.Name,
				Email:        u.Email,
				AvatarURL:    u.AvatarURL,
				AssignedAt:   a.AssignedAt,
			})
		}
	}

	// Owner details
	var owner models.User
	ownerData := gin.H{}
	if database.DB.First(&owner, sub.OwnerID).Error == nil {
		ownerData = gin.H{"id": owner.ID, "name": owner.Name, "email": owner.Email, "avatar_url": owner.AvatarURL}
	}

	// Added by
	var addedBy models.User
	addedByData := gin.H{}
	if database.DB.First(&addedBy, sub.UserID).Error == nil {
		addedByData = gin.H{"id": addedBy.ID, "name": addedBy.Name, "email": addedBy.Email, "avatar_url": addedBy.AvatarURL}
	}

	// Team info (if team subscription)
	var teamData gin.H
	if sub.TeamID != nil {
		var team models.Team
		if database.DB.First(&team, *sub.TeamID).Error == nil {
			var memberCount int64
			database.DB.Model(&models.TeamMember{}).Where("team_id = ?", team.ID).Count(&memberCount)
			teamData = gin.H{"id": team.ID, "name": team.Name, "member_count": memberCount}
		}
	}

	// Check if this subscription originated from a request (only possible for team-scoped subs)
	var originRequest *models.SubscriptionRequest
	if sub.TeamID != nil {
		database.DB.Where("name = ? AND team_id = ? AND status = ?", sub.Name, *sub.TeamID, "approved").Order("created_at DESC").First(&originRequest)
	}
	var requestData gin.H
	if originRequest != nil && originRequest.ID != 0 {
		var requester models.User
		requesterName := ""
		if database.DB.First(&requester, originRequest.RequesterID).Error == nil {
			requesterName = requester.Name
		}
		requestData = gin.H{
			"id":             originRequest.ID,
			"requester_name": requesterName,
			"justification":  originRequest.Justification,
			"created_at":     originRequest.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"subscription":    enriched,
		"seat_count":      sub.SeatCount,
		"assigned_count":  len(assignedUsers),
		"available_seats": sub.SeatCount - len(assignedUsers),
		"assigned_users":  assignedUsers,
		"owner":           ownerData,
		"added_by":        addedByData,
		"team":            teamData,
		"origin_request":  requestData,
	})
}

// AssignSeat assigns a user to a subscription seat.
// POST /api/subscriptions/:id/assign  { user_id: uint }
func AssignSeat(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)
	subID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var input struct {
		UserID uint `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Must be owner to assign seats
	var member models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", caller.DefaultTeamID, callerID).First(&member).Error; err != nil || member.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can assign seats"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND team_id = ?", uint(subID), caller.DefaultTeamID).First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	// Check seat availability
	var assignedCount int64
	database.DB.Model(&models.SubscriptionAssignment{}).Where("subscription_id = ?", sub.ID).Count(&assignedCount)
	if int(assignedCount) >= sub.SeatCount {
		c.JSON(http.StatusConflict, gin.H{"error": "No seats available for this subscription"})
		return
	}

	// Prevent duplicate assignment
	var existing int64
	database.DB.Model(&models.SubscriptionAssignment{}).Where("subscription_id = ? AND user_id = ?", sub.ID, input.UserID).Count(&existing)
	if existing > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already assigned to this subscription"})
		return
	}

	assignment := models.SubscriptionAssignment{
		SubscriptionID: sub.ID,
		UserID:         input.UserID,
		AssignedAt:     time.Now(),
	}
	if err := database.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign seat"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":         "Seat assigned successfully",
		"available_seats": sub.SeatCount - int(assignedCount) - 1,
	})
}

// UnassignSeat removes a user from a subscription seat.
// DELETE /api/subscriptions/:id/assign/:uid
func UnassignSeat(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)
	subID, _ := strconv.Atoi(c.Param("id"))
	targetUID, _ := strconv.Atoi(c.Param("uid"))

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var member models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", caller.DefaultTeamID, callerID).First(&member).Error; err != nil || member.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can remove seat assignments"})
		return
	}

	var assignment models.SubscriptionAssignment
	if err := database.DB.Where("subscription_id = ? AND user_id = ?", uint(subID), uint(targetUID)).First(&assignment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	database.DB.Delete(&assignment)
	c.JSON(http.StatusOK, gin.H{"message": "Seat unassigned successfully"})
}

// GetSeats returns all assigned users for a subscription.
// GET /api/subscriptions/:id/seats
func GetSeats(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)
	subID, _ := strconv.Atoi(c.Param("id"))

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var sub models.Subscription
	if err := database.DB.Where("id = ? AND team_id = ?", uint(subID), caller.DefaultTeamID).First(&sub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	var assignments []models.SubscriptionAssignment
	database.DB.Where("subscription_id = ?", sub.ID).Find(&assignments)

	type AssignedUser struct {
		AssignmentID uint      `json:"assignment_id"`
		UserID       uint      `json:"user_id"`
		Name         string    `json:"name"`
		Email        string    `json:"email"`
		AvatarURL    string    `json:"avatar_url"`
		AssignedAt   time.Time `json:"assigned_at"`
	}
	var result []AssignedUser
	for _, a := range assignments {
		var u models.User
		if database.DB.First(&u, a.UserID).Error == nil {
			result = append(result, AssignedUser{
				AssignmentID: a.ID,
				UserID:       u.ID,
				Name:         u.Name,
				Email:        u.Email,
				AvatarURL:    u.AvatarURL,
				AssignedAt:   a.AssignedAt,
			})
		}
	}

	var assignedCount int64
	database.DB.Model(&models.SubscriptionAssignment{}).Where("subscription_id = ?", sub.ID).Count(&assignedCount)

	c.JSON(http.StatusOK, gin.H{
		"seat_count":      sub.SeatCount,
		"assigned_count":  int(assignedCount),
		"available_seats": sub.SeatCount - int(assignedCount),
		"assigned_users":  result,
	})
}

// autoArchiveExpired bulk-archives active subscriptions whose next_billing_date has passed.
func autoArchiveExpired(teamID uint) {
	database.DB.Model(&models.Subscription{}).
		Where("team_id = ? AND status = ? AND next_billing_date < NOW()", teamID, "active").
		UpdateColumn("status", "archived")
}
