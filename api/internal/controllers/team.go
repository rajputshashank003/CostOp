package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"costop/internal/config"

	"github.com/gin-gonic/gin"
)

// generateToken produces a secure hex token of the given byte length.
func generateToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GetMyTeams returns all teams in the workspace so members can filter/search across the org.
// The caller's role is included for teams they belong to; empty otherwise.
// GET /api/teams
func GetMyTeams(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Find the caller's user to get org_id
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Get ALL teams in this organization using org_id
	var orgTeams []models.Team
	if err := database.DB.Where("org_id = ?", user.OrgID).Find(&orgTeams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workspace teams"})
		return
	}

	// Build a lookup of the caller's memberships for role info
	var allMemberships []models.TeamMember
	database.DB.Where("user_id = ?", userID).Find(&allMemberships)
	roleMap := make(map[uint]string)
	for _, m := range allMemberships {
		roleMap[m.TeamID] = m.Role
	}

	type TeamWithRole struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
		Role string `json:"role"`
	}

	result := make([]TeamWithRole, 0, len(orgTeams))
	for _, team := range orgTeams {
		result = append(result, TeamWithRole{
			ID:   team.ID,
			Name: team.Name,
			Role: roleMap[team.ID],
		})
	}

	c.JSON(http.StatusOK, result)
}

// GetTeamByID returns a single team the caller belongs to, with full settings.
// GET /api/teams/:id
func GetTeamByID(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	teamID := c.Param("id")

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Verify caller is a member of this team
	var callerMembership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", team.ID, userID).First(&callerMembership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a member of this team"})
		return
	}

	c.JSON(http.StatusOK, team)
}

// GetMembersByTeam returns all active members and pending invites for a specific team.
// The caller must be a member of the team.
// GET /api/teams/:id/members
func GetMembersByTeam(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	teamIDParam := c.Param("id")
	search := c.Query("search")
	subscriptionFilter := c.Query("subscription")

	var targetTeam models.Team
	if err := database.DB.First(&targetTeam, teamIDParam).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Verify caller is a member of this team
	var callerMembership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", targetTeam.ID, userID).First(&callerMembership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a member of this team"})
		return
	}

	// Prepare base query for members
	memberQuery := database.DB.Model(&models.TeamMember{}).Where("team_members.team_id = ?", targetTeam.ID)

	if search != "" {
		searchTerm := "%" + search + "%"
		// Only join users if searching
		memberQuery = memberQuery.Joins("JOIN users ON users.id = team_members.user_id").
			Where("users.name ILIKE ? OR users.email ILIKE ? OR team_members.designation ILIKE ?", searchTerm, searchTerm, searchTerm)
	}

	if subscriptionFilter == "has" {
		memberQuery = memberQuery.Where("EXISTS (SELECT 1 FROM subscription_assignments sa WHERE sa.user_id = team_members.user_id)")
	} else if subscriptionFilter == "without" {
		memberQuery = memberQuery.Where("NOT EXISTS (SELECT 1 FROM subscription_assignments sa WHERE sa.user_id = team_members.user_id)")
	}

	// Fetch all active members matching filters
	var members []models.TeamMember
	memberQuery.Find(&members)

	type MemberResponse struct {
		TeamID          uint        `json:"team_id"`
		Role            string      `json:"role"`
		Designation     string      `json:"designation"`
		User            models.User `json:"user"`
		HasSubscription bool        `json:"has_subscription"`
	}
	enrichedMembers := make([]MemberResponse, 0, len(members))
	for _, m := range members {
		var u models.User
		if database.DB.First(&u, m.UserID).Error == nil {
			var assignCount int64
			database.DB.Model(&models.SubscriptionAssignment{}).Where("user_id = ?", m.UserID).Count(&assignCount)

			enrichedMembers = append(enrichedMembers, MemberResponse{
				TeamID:          m.TeamID,
				Role:            m.Role,
				Designation:     m.Designation,
				User:            u,
				HasSubscription: assignCount > 0,
			})
		}
	}

	// Fetch pending invites (filter by search if applicable)
	inviteQuery := database.DB.Model(&models.TeamInvite{}).Where("team_id = ? AND status = ?", targetTeam.ID, "pending")
	if search != "" {
		searchTerm := "%" + search + "%"
		inviteQuery = inviteQuery.Where("email ILIKE ? OR designation ILIKE ?", searchTerm, searchTerm)
	}
	// Note: invites don't have subscriptions yet, so subscriptionFilter is naturally ignored or hides them
	var invites []models.TeamInvite
	if subscriptionFilter == "without" || subscriptionFilter == "" || subscriptionFilter == "all" {
		inviteQuery.Find(&invites)
	}

	c.JSON(http.StatusOK, gin.H{
		"team":    targetTeam,
		"members": enrichedMembers,
		"invites": invites,
	})
}

// UpdateMemberTeam moves a member to a different team. Caller must be an owner.
// PATCH /api/teams/:id/members/:uid  { "new_team_id": uint }
func UpdateMemberTeam(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)
	teamIDParam := c.Param("id")
	targetUID := c.Param("uid")

	var input struct {
		NewTeamID uint `json:"new_team_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "new_team_id is required"})
		return
	}

	// Caller must be an admin (owner of any team in the workspace) or the owner of the source team
	var callerMembership models.TeamMember
	isAdmin := false
	if err := database.DB.Where("user_id = ? AND role = 'owner'", callerID).First(&models.TeamMember{}).Error; err == nil {
		isAdmin = true
	}

	if !isAdmin {
		if err := database.DB.Where("team_id = ? AND user_id = ?", teamIDParam, callerID).First(&callerMembership).Error; err != nil || callerMembership.Role != "owner" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only admins or team owners can reassign members"})
			return
		}
	}

	// Verify the target team exists
	var targetTeam models.Team
	if err := database.DB.First(&targetTeam, input.NewTeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target team not found"})
		return
	}

	// Find the membership to move
	var membership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", teamIDParam, targetUID).First(&membership).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Member not found in this team"})
		return
	}

	// Update their team membership
	if err := database.DB.Model(&membership).Update("team_id", input.NewTeamID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team membership"})
		return
	}

	// Also update their DefaultTeamID so the UI context switches immediately
	database.DB.Model(&models.User{}).Where("id = ?", membership.UserID).Update("default_team_id", input.NewTeamID)

	// Hook: Sync subscription assignments on team change
	// 1. Remove team-sourced assignments from the old team
	oldTeamID := teamIDParam
	database.DB.Where(
		"user_id = ? AND source = 'team' AND source_team_id = ?",
		membership.UserID, oldTeamID,
	).Delete(&models.SubscriptionAssignment{})

	// 2. Create assignments for new team's granted subscriptions (if seats available)
	var newTeamGrants []models.SubscriptionTeam
	database.DB.Where("team_id = ?", input.NewTeamID).Find(&newTeamGrants)
	for _, grant := range newTeamGrants {
		// Skip if user already has an assignment for this subscription
		var existing int64
		database.DB.Model(&models.SubscriptionAssignment{}).
			Where("subscription_id = ? AND user_id = ?", grant.SubscriptionID, membership.UserID).
			Count(&existing)
		if existing > 0 {
			continue
		}

		// Check seat availability
		var sub models.Subscription
		if database.DB.First(&sub, grant.SubscriptionID).Error != nil {
			continue
		}
		var occupied int64
		database.DB.Model(&models.SubscriptionAssignment{}).
			Where("subscription_id = ?", sub.ID).Count(&occupied)
		if int(occupied) >= sub.SeatCount {
			continue // seats full — skip silently
		}

		newTID := input.NewTeamID
		database.DB.Create(&models.SubscriptionAssignment{
			SubscriptionID: grant.SubscriptionID,
			UserID:         membership.UserID,
			Source:         "team",
			SourceTeamID:   &newTID,
			AssignedAt:     time.Now(),
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member moved to new team successfully"})
}

// GetTeamMembers fetches members and invites across ALL teams in the workspace.
// Used by the frontend "All Teams" filter on the /members route.
// A member can see every person in their organization, not just their own team.
// GET /api/members
func GetTeamMembers(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	search := c.Query("search")
	subscriptionFilter := c.Query("subscription")

	// Find the caller's user to get org_id
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Get ALL team IDs in this organization using org_id
	var orgTeamIDs []uint
	if err := database.DB.Model(&models.Team{}).Where("org_id = ?", user.OrgID).Pluck("id", &orgTeamIDs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workspace teams"})
		return
	}

	type MemberResponse struct {
		TeamID          uint        `json:"team_id"`
		Role            string      `json:"role"`
		Designation     string      `json:"designation"`
		User            models.User `json:"user"`
		HasSubscription bool        `json:"has_subscription"`
	}

	seen := make(map[uint]bool)
	allMembers := make([]MemberResponse, 0)
	allInvites := make([]models.TeamInvite, 0)

	for _, teamID := range orgTeamIDs {
		// Base query for members of this team
		memberQuery := database.DB.Model(&models.TeamMember{}).Where("team_members.team_id = ?", teamID)

		if search != "" {
			searchTerm := "%" + search + "%"
			memberQuery = memberQuery.Joins("JOIN users ON users.id = team_members.user_id").
				Where("users.name ILIKE ? OR users.email ILIKE ? OR team_members.designation ILIKE ?", searchTerm, searchTerm, searchTerm)
		}

		if subscriptionFilter == "has" {
			memberQuery = memberQuery.Where("EXISTS (SELECT 1 FROM subscription_assignments sa WHERE sa.user_id = team_members.user_id)")
		} else if subscriptionFilter == "without" {
			memberQuery = memberQuery.Where("NOT EXISTS (SELECT 1 FROM subscription_assignments sa WHERE sa.user_id = team_members.user_id)")
		}

		var teamMembers []models.TeamMember
		memberQuery.Find(&teamMembers)

		for _, m := range teamMembers {
			if seen[m.UserID] {
				continue
			}
			seen[m.UserID] = true
			var u models.User
			if database.DB.First(&u, m.UserID).Error != nil {
				continue
			}
			var hasSub int64
			database.DB.Model(&models.SubscriptionAssignment{}).Where("user_id = ?", m.UserID).Count(&hasSub)
			allMembers = append(allMembers, MemberResponse{
				TeamID: m.TeamID, Role: m.Role, Designation: m.Designation, User: u, HasSubscription: hasSub > 0,
			})
		}

		inviteQuery := database.DB.Model(&models.TeamInvite{}).Where("team_id = ? AND status = ?", teamID, "pending")
		if search != "" {
			searchTerm := "%" + search + "%"
			inviteQuery = inviteQuery.Where("email ILIKE ? OR designation ILIKE ?", searchTerm, searchTerm)
		}

		var invites []models.TeamInvite
		if subscriptionFilter == "without" || subscriptionFilter == "" || subscriptionFilter == "all" {
			inviteQuery.Find(&invites)
			allInvites = append(allInvites, invites...)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"members": allMembers,
		"invites": allInvites,
	})
}

// InviteMember sends an email invite for a specific team (defaults to caller's DefaultTeamID).
// POST /api/members/invite  { "email": string, "team_id"?: uint }
func InviteMember(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input struct {
		Email       string `json:"email" binding:"required,email"`
		Designation string `json:"designation"`
		TeamID      *uint  `json:"team_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Resolve target team
	targetTeamID := user.DefaultTeamID
	if input.TeamID != nil {
		targetTeamID = *input.TeamID
	}

	var team models.Team
	if err := database.DB.First(&team, targetTeamID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Workspace not found"})
		return
	}

	// Verify caller is a member of the target team
	var callerMembership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", targetTeamID, userID).First(&callerMembership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a member of this workspace"})
		return
	}

	// Enforce the AllowMemberInvites organization setting
	if !team.AllowMemberInvites && callerMembership.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Workspace settings restrict invitations to owners only"})
		return
	}
	// Prevent duplicate active invites
	var existing struct{ ID uint }
	if err := database.DB.Model(&models.TeamInvite{}).Where("team_id = ? AND email = ? AND status = ?", team.ID, input.Email, "pending").First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "This email already has a pending invite for this workspace."})
		return
	}

	token, err := generateToken(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate security token"})
		return
	}

	invite := models.TeamInvite{TeamID: team.ID, Email: input.Email, Designation: input.Designation, Token: token, Status: "pending"}
	if err := database.DB.Create(&invite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to construct invite record"})
		return
	}

	go func() {
		services.SendTeamInviteEmail(input.Email, user.Name, team.Name, token)
	}()

	inviteLink := fmt.Sprintf("%s/login?token=%s", config.FrontendURL, token)
	c.JSON(http.StatusOK, gin.H{
		"message":     "Invitation created! You can copy the link below.",
		"invite_link": inviteLink,
	})
}

// RevokeInvite safely removes a pending invitation.
// DELETE /api/members/invite/:id
func RevokeInvite(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	inviteID := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var invite models.TeamInvite
	if err := database.DB.Where("id = ? AND team_id = ?", inviteID, user.DefaultTeamID).First(&invite).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invite not found or unauthorized"})
		return
	}

	database.DB.Delete(&invite)
	c.JSON(http.StatusOK, gin.H{"message": "Invite successfully revoked"})
}

// CreateTeam creates a new team in the workspace. The caller becomes the owner.
// POST /api/teams  { "name": string }
func CreateTeam(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Team name is required"})
		return
	}

	// Set org_id from the caller's org
	var user models.User
	database.DB.First(&user, userID)

	team := models.Team{
		Name:    input.Name,
		OwnerID: userID,
		OrgID:   user.OrgID,
	}
	if err := database.DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team"})
		return
	}

	// Auto-add the creator as owner member of the new team
	membership := models.TeamMember{
		TeamID: team.ID,
		UserID: userID,
		Role:   "owner",
	}
	database.DB.Create(&membership)

	InvalidateTeamCache()
	c.JSON(http.StatusCreated, gin.H{"id": team.ID, "name": team.Name})
}

// GetAllTeams returns ALL teams in the workspace (for dropdowns).
// Distinct from GetMyTeams which returns only teams the user belongs to.
// GET /api/teams/all
func GetAllTeams(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.Select("org_id").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var teams []models.Team
	if err := database.DB.Where("org_id = ?", user.OrgID).Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}

	type TeamResponse struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}
	result := make([]TeamResponse, 0, len(teams))
	for _, t := range teams {
		result = append(result, TeamResponse{ID: t.ID, Name: t.Name})
	}
	c.JSON(http.StatusOK, result)
}

// UpdateTeamSettings modifies a team's name and settings (Admin only).
// PATCH /api/teams/:id/settings
func UpdateTeamSettings(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	teamID := c.Param("id")

	var input struct {
		Name               string `json:"name"`
		AllowMemberInvites *bool  `json:"allow_member_invites"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace not found"})
		return
	}

	// Verify caller is an owner of the target team
	var callerMembership models.TeamMember
	if err := database.DB.Where("team_id = ? AND user_id = ?", team.ID, userID).First(&callerMembership).Error; err != nil || callerMembership.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only workspace owners can update settings"})
		return
	}

	if input.Name != "" {
		team.Name = input.Name
	}
	if input.AllowMemberInvites != nil {
		team.AllowMemberInvites = *input.AllowMemberInvites
	}

	if err := database.DB.Save(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update workspace settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully", "team": team})
}
