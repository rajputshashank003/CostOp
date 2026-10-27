package controllers

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"costop/internal/database"
	"costop/internal/models"

	"github.com/gin-gonic/gin"
)

// AdminOrgMember represents a member user belonging to an organization.
type AdminOrgMember struct {
	ID              uint      `json:"id"`
	Name            string    `json:"name"`
	Email           string    `json:"email"`
	AvatarURL       string    `json:"avatar_url"`
	Role            string    `json:"role"`
	Designation     string    `json:"designation"`
	IsEmailVerified bool      `json:"is_email_verified"`
	IsOnboarded     bool      `json:"is_onboarded"`
	CreatedAt       time.Time `json:"created_at"`
}

// AdminOrgItem represents an organization workspace in the admin dashboard.
type AdminOrgItem struct {
	ID                uint             `json:"id"`
	Name              string           `json:"name"`
	OwnerID           uint             `json:"owner_id"`
	OwnerName         string           `json:"owner_name"`
	OwnerEmail        string           `json:"owner_email"`
	OwnerAvatarURL    string           `json:"owner_avatar_url"`
	Plan              string           `json:"plan"`
	IsPro             bool             `json:"is_pro" gorm:"-"`
	MemberCount       int64            `json:"member_count" gorm:"-"`
	MemberLimit       int              `json:"member_limit" gorm:"-"`
	SlackWebhookURL   string           `json:"slack_webhook_url"`
	RazorpayPaymentID string           `json:"razorpay_payment_id"`
	CreatedAt         time.Time        `json:"created_at"`
	UpdatedAt         time.Time        `json:"updated_at"`
	Members           []AdminOrgMember `json:"members" gorm:"-"`
}

// AdminUserItem represents a user in the admin management dashboard.
type AdminUserItem struct {
	ID              uint      `json:"id"`
	Name            string    `json:"name"`
	Email           string    `json:"email"`
	AvatarURL       string    `json:"avatar_url"`
	IsEmailVerified bool      `json:"is_email_verified"`
	IsOnboarded     bool      `json:"is_onboarded"`
	OrgID           uint      `json:"org_id"`
	OrgName         string    `json:"org_name"`
	Plan            string    `json:"plan"`
	IsPro           bool      `json:"is_pro"`
	IsAdmin         bool      `json:"is_admin"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	DefaultTeamID   uint      `json:"default_team_id"`
	DefaultTeamName string    `json:"default_team_name"`
}

// GetAdminOrganizations returns a paginated list of organizations with owner info and active members.
// GET /api/admin/organizations?page=1&limit=10&search=&plan=all
func GetAdminOrganizations(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Caller user not found"})
		return
	}

	if !IsWebsiteAdmin(caller.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Website admin privileges required"})
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := strings.TrimSpace(c.Query("search"))
	planFilter := strings.ToLower(strings.TrimSpace(c.Query("plan")))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit

	query := database.DB.Table("organizations").
		Select(`
			organizations.id,
			organizations.name,
			organizations.owner_id,
			COALESCE(users.name, 'Workspace Owner') AS owner_name,
			COALESCE(users.email, '') AS owner_email,
			COALESCE(users.avatar_url, '') AS owner_avatar_url,
			COALESCE(organizations.plan, 'free') AS plan,
			COALESCE(organizations.slack_webhook_url, '') AS slack_webhook_url,
			COALESCE(organizations.razorpay_payment_id, '') AS razorpay_payment_id,
			organizations.created_at,
			organizations.updated_at
		`).
		Joins("LEFT JOIN users ON users.id = organizations.owner_id AND users.deleted_at IS NULL").
		Where("organizations.deleted_at IS NULL")

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("(LOWER(organizations.name) LIKE ? OR LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ?)",
			searchPattern, searchPattern, searchPattern)
	}

	if planFilter == "pro" {
		query = query.Where("LOWER(COALESCE(organizations.plan, 'free')) = ?", "pro")
	} else if planFilter == "free" {
		query = query.Where("LOWER(COALESCE(organizations.plan, 'free')) != ?", "pro")
	}

	var total int64
	countQuery := database.DB.Table("organizations").
		Joins("LEFT JOIN users ON users.id = organizations.owner_id AND users.deleted_at IS NULL").
		Where("organizations.deleted_at IS NULL")

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		countQuery = countQuery.Where("(LOWER(organizations.name) LIKE ? OR LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ?)",
			searchPattern, searchPattern, searchPattern)
	}
	if planFilter == "pro" {
		countQuery = countQuery.Where("LOWER(COALESCE(organizations.plan, 'free')) = ?", "pro")
	} else if planFilter == "free" {
		countQuery = countQuery.Where("LOWER(COALESCE(organizations.plan, 'free')) != ?", "pro")
	}

	if err := countQuery.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count organizations"})
		return
	}

	type orgQueryRow struct {
		ID                uint      `gorm:"column:id"`
		Name              string    `gorm:"column:name"`
		OwnerID           uint      `gorm:"column:owner_id"`
		OwnerName         string    `gorm:"column:owner_name"`
		OwnerEmail        string    `gorm:"column:owner_email"`
		OwnerAvatarURL    string    `gorm:"column:owner_avatar_url"`
		Plan              string    `gorm:"column:plan"`
		SlackWebhookURL   string    `gorm:"column:slack_webhook_url"`
		RazorpayPaymentID string    `gorm:"column:razorpay_payment_id"`
		CreatedAt         time.Time `gorm:"column:created_at"`
		UpdatedAt         time.Time `gorm:"column:updated_at"`
	}

	var rawOrgs []orgQueryRow
	if err := query.Order("organizations.created_at DESC").Limit(limit).Offset(offset).Scan(&rawOrgs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organizations"})
		return
	}

	// Fetch member users for these organizations
	orgIDs := make([]uint, len(rawOrgs))
	for i, o := range rawOrgs {
		orgIDs[i] = o.ID
	}

	membersMap := make(map[uint][]AdminOrgMember)
	if len(orgIDs) > 0 {
		type userRow struct {
			ID              uint      `json:"id"`
			OrgID           uint      `json:"org_id"`
			Name            string    `json:"name"`
			Email           string    `json:"email"`
			AvatarURL       string    `json:"avatar_url"`
			Role            string    `json:"role"`
			Designation     string    `json:"designation"`
			IsEmailVerified bool      `json:"is_email_verified"`
			IsOnboarded     bool      `json:"is_onboarded"`
			CreatedAt       time.Time `json:"created_at"`
		}
		var userRows []userRow
		database.DB.Table("users").
			Select(`
				users.id,
				users.org_id,
				users.name,
				users.email,
				users.avatar_url,
				COALESCE(team_members.role, 'member') AS role,
				COALESCE(team_members.designation, '') AS designation,
				users.is_email_verified,
				users.is_onboarded,
				users.created_at
			`).
			Joins("LEFT JOIN team_members ON team_members.user_id = users.id AND team_members.team_id = users.default_team_id").
			Where("users.org_id IN ? AND users.deleted_at IS NULL", orgIDs).
			Order("users.created_at ASC").
			Scan(&userRows)

		for _, ur := range userRows {
			membersMap[ur.OrgID] = append(membersMap[ur.OrgID], AdminOrgMember{
				ID:              ur.ID,
				Name:            ur.Name,
				Email:           ur.Email,
				AvatarURL:       ur.AvatarURL,
				Role:            ur.Role,
				Designation:     ur.Designation,
				IsEmailVerified: ur.IsEmailVerified,
				IsOnboarded:     ur.IsOnboarded,
				CreatedAt:       ur.CreatedAt,
			})
		}
	}

	// Assemble enriched organization items
	results := make([]AdminOrgItem, len(rawOrgs))
	for i, o := range rawOrgs {
		members := membersMap[o.ID]
		if members == nil {
			members = []AdminOrgMember{}
		}
		isPro := strings.ToLower(o.Plan) == "pro"
		memberLimit := 30
		if isPro {
			memberLimit = 100
		}
		results[i] = AdminOrgItem{
			ID:                o.ID,
			Name:              o.Name,
			OwnerID:           o.OwnerID,
			OwnerName:         o.OwnerName,
			OwnerEmail:        o.OwnerEmail,
			OwnerAvatarURL:    o.OwnerAvatarURL,
			Plan:              o.Plan,
			IsPro:             isPro,
			MemberCount:       int64(len(members)),
			MemberLimit:       memberLimit,
			SlackWebhookURL:   o.SlackWebhookURL,
			RazorpayPaymentID: o.RazorpayPaymentID,
			CreatedAt:         o.CreatedAt,
			UpdatedAt:         o.UpdatedAt,
			Members:           members,
		}
	}

	totalPages := 0
	if limit > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	c.JSON(http.StatusOK, gin.H{
		"organizations": results,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// ToggleOrgProAccess grants or revokes CostOp Pro access for an organization.
// PATCH /api/admin/organizations/:id/pro
func ToggleOrgProAccess(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Caller user not found"})
		return
	}

	if !IsWebsiteAdmin(caller.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Website admin privileges required"})
		return
	}

	targetOrgID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, uint(targetOrgID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var input struct {
		IsPro *bool `json:"is_pro"`
	}
	_ = c.ShouldBindJSON(&input)

	var newIsPro bool
	if input.IsPro != nil {
		newIsPro = *input.IsPro
	} else {
		newIsPro = strings.ToLower(org.Plan) != "pro"
	}

	if newIsPro {
		org.Plan = "pro"
		org.RazorpayPaymentID = "pay_admin_granted"
	} else {
		org.Plan = "free"
		org.RazorpayPaymentID = ""
		org.RazorpaySubID = ""
	}

	if err := database.DB.Save(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization plan"})
		return
	}

	message := fmt.Sprintf("CostOp Pro access granted to organization '%s' successfully!", org.Name)
	if !newIsPro {
		message = fmt.Sprintf("CostOp Pro access revoked from organization '%s'.", org.Name)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  message,
		"org_id":   org.ID,
		"org_name": org.Name,
		"plan":     org.Plan,
		"is_pro":   newIsPro,
	})
}

// GetAdminOrgMembers returns all members belonging to a specific organization.
// GET /api/admin/organizations/:id/members
func GetAdminOrgMembers(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Caller user not found"})
		return
	}

	if !IsWebsiteAdmin(caller.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Website admin privileges required"})
		return
	}

	targetOrgID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var members []AdminOrgMember
	database.DB.Table("users").
		Select(`
			users.id,
			users.name,
			users.email,
			users.avatar_url,
			COALESCE(team_members.role, 'member') AS role,
			COALESCE(team_members.designation, '') AS designation,
			users.is_email_verified,
			users.is_onboarded,
			users.created_at
		`).
		Joins("LEFT JOIN team_members ON team_members.user_id = users.id AND team_members.team_id = users.default_team_id").
		Where("users.org_id = ? AND users.deleted_at IS NULL", uint(targetOrgID)).
		Order("users.created_at ASC").
		Scan(&members)

	c.JSON(http.StatusOK, gin.H{
		"org_id":  uint(targetOrgID),
		"members": members,
		"total":   len(members),
	})
}

// GetAdminUsers returns a paginated, searchable list of users for website admins.
// GET /api/admin/users?page=1&limit=10&search=&plan=all
func GetAdminUsers(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Caller user not found"})
		return
	}

	if !IsWebsiteAdmin(caller.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Website admin privileges required"})
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := strings.TrimSpace(c.Query("search"))
	planFilter := strings.ToLower(strings.TrimSpace(c.Query("plan")))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit

	query := database.DB.Table("users").
		Select(`
			users.id,
			users.name,
			users.email,
			users.avatar_url,
			users.is_email_verified,
			users.is_onboarded,
			users.org_id,
			COALESCE(organizations.name, 'Default Workspace') AS org_name,
			COALESCE(organizations.plan, 'free') AS plan,
			users.created_at,
			users.updated_at,
			users.default_team_id,
			COALESCE(teams.name, 'General Team') AS default_team_name
		`).
		Joins("LEFT JOIN organizations ON organizations.id = users.org_id AND organizations.deleted_at IS NULL").
		Joins("LEFT JOIN teams ON teams.id = users.default_team_id AND teams.deleted_at IS NULL").
		Where("users.deleted_at IS NULL")

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("(LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ?)", searchPattern, searchPattern)
	}

	if planFilter == "pro" {
		query = query.Where("LOWER(COALESCE(organizations.plan, 'free')) = ?", "pro")
	} else if planFilter == "free" {
		query = query.Where("LOWER(COALESCE(organizations.plan, 'free')) != ?", "pro")
	}

	var total int64
	countQuery := database.DB.Table("users").
		Joins("LEFT JOIN organizations ON organizations.id = users.org_id AND organizations.deleted_at IS NULL").
		Where("users.deleted_at IS NULL")

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		countQuery = countQuery.Where("(LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ?)", searchPattern, searchPattern)
	}
	if planFilter == "pro" {
		countQuery = countQuery.Where("LOWER(COALESCE(organizations.plan, 'free')) = ?", "pro")
	} else if planFilter == "free" {
		countQuery = countQuery.Where("LOWER(COALESCE(organizations.plan, 'free')) != ?", "pro")
	}

	if err := countQuery.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count users"})
		return
	}

	var rawItems []AdminUserItem
	if err := query.Order("users.created_at DESC").Limit(limit).Offset(offset).Scan(&rawItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	results := make([]AdminUserItem, len(rawItems))
	for i, item := range rawItems {
		item.IsPro = strings.ToLower(item.Plan) == "pro"
		item.IsAdmin = IsWebsiteAdmin(item.Email)
		results[i] = item
	}

	totalPages := 0
	if limit > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	c.JSON(http.StatusOK, gin.H{
		"users": results,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// ToggleUserProAccess allows a website admin to give or revoke Pro access for a specific user's organization.
// PATCH /api/admin/users/:id/pro
func ToggleUserProAccess(c *gin.Context) {
	callerID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, callerID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Caller user not found"})
		return
	}

	if !IsWebsiteAdmin(caller.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Website admin privileges required"})
		return
	}

	targetUserID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target user ID"})
		return
	}

	var targetUser models.User
	if err := database.DB.First(&targetUser, uint(targetUserID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target user not found"})
		return
	}

	orgID := targetUser.OrgID
	if orgID == 0 && targetUser.DefaultTeamID > 0 {
		var defaultTeam models.Team
		if err := database.DB.First(&defaultTeam, targetUser.DefaultTeamID).Error; err == nil {
			orgID = defaultTeam.OrgID
		}
	}

	if orgID == 0 {
		workspaceName := targetUser.Name + "'s Workspace"
		if strings.TrimSpace(targetUser.Name) == "" {
			workspaceName = "Workspace #" + strconv.FormatUint(uint64(targetUser.ID), 10)
		}
		newOrg := models.Organization{
			Name:    workspaceName,
			OwnerID: targetUser.ID,
			Plan:    "free",
		}
		if err := database.DB.Create(&newOrg).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization for user"})
			return
		}
		orgID = newOrg.ID
		targetUser.OrgID = orgID
		database.DB.Save(&targetUser)
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found for user"})
		return
	}

	var input struct {
		IsPro *bool `json:"is_pro"`
	}
	_ = c.ShouldBindJSON(&input)

	var newIsPro bool
	if input.IsPro != nil {
		newIsPro = *input.IsPro
	} else {
		newIsPro = strings.ToLower(org.Plan) != "pro"
	}

	if newIsPro {
		org.Plan = "pro"
		org.RazorpayPaymentID = "pay_admin_granted"
	} else {
		org.Plan = "free"
		org.RazorpayPaymentID = ""
		org.RazorpaySubID = ""
	}

	if err := database.DB.Save(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user plan"})
		return
	}

	message := "CostOp Pro access granted successfully"
	if !newIsPro {
		message = "CostOp Pro access revoked successfully"
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  message,
		"user_id":  targetUser.ID,
		"org_id":   org.ID,
		"org_name": org.Name,
		"plan":     org.Plan,
		"is_pro":   newIsPro,
	})
}
