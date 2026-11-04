package controllers

import (
	"errors"
	"net/mail"
	"strconv"
	"strings"

	"costop/internal/database"
	"costop/internal/models"

	"gorm.io/gorm"
)

// Tenant-isolation helpers. Every lookup by an ID that came from the client must
// be scoped to the caller's organization before it is read or changed.

var errNotInOrg = errors.New("not found in your organization")

// isWorkspaceAdmin reports whether the user is an owner of their default team.
func isWorkspaceAdmin(user models.User) bool {
	if user.DefaultTeamID == 0 {
		return false
	}
	var m models.TeamMember
	err := database.DB.Where("team_id = ? AND user_id = ?", user.DefaultTeamID, user.ID).First(&m).Error
	return err == nil && m.Role == "owner"
}

// subscriptionInOrg loads a subscription only if it belongs to the organization.
func subscriptionInOrg(subID, orgID uint) (models.Subscription, error) {
	var sub models.Subscription
	if orgID == 0 {
		return sub, errNotInOrg
	}
	err := database.DB.Where("id = ? AND org_id = ?", subID, orgID).First(&sub).Error
	return sub, err
}

// teamInOrg loads a team only if it belongs to the organization.
func teamInOrg(teamID, orgID uint) (models.Team, error) {
	var team models.Team
	if orgID == 0 {
		return team, errNotInOrg
	}
	err := database.DB.Where("id = ? AND org_id = ?", teamID, orgID).First(&team).Error
	return team, err
}

// allTeamsInOrg reports whether every team ID belongs to the organization.
func allTeamsInOrg(teamIDs []uint, orgID uint) bool {
	return countInOrg(&models.Team{}, teamIDs, orgID)
}

// allUsersInOrg reports whether every user ID belongs to the organization.
func allUsersInOrg(userIDs []uint, orgID uint) bool {
	return countInOrg(&models.User{}, userIDs, orgID)
}

func countInOrg(model interface{}, ids []uint, orgID uint) bool {
	if len(ids) == 0 {
		return true
	}
	if orgID == 0 {
		return false
	}
	unique := map[uint]bool{}
	for _, id := range ids {
		unique[id] = true
	}
	var n int64
	database.DB.Model(model).Where("id IN ? AND org_id = ?", ids, orgID).Count(&n)
	return int(n) == len(unique)
}

// teamFilterFromQuery reads ?team_id= ("all", a team ID, or empty for the default team).
// A team outside the caller's organization is rejected.
func teamFilterFromQuery(raw string, user models.User) (teamID uint, allTeams bool, err error) {
	switch raw {
	case "":
		return user.DefaultTeamID, false, nil
	case "all":
		return 0, true, nil
	}
	parsed, convErr := strconv.ParseUint(raw, 10, 32)
	if convErr != nil {
		return user.DefaultTeamID, false, nil
	}
	if _, err := teamInOrg(uint(parsed), user.OrgID); err != nil {
		return 0, false, errNotInOrg
	}
	return uint(parsed), false, nil
}

// teamSubscriptionQuery returns the subscriptions visible to one team: those granted
// to it plus organization-wide ones, always bounded to the caller's organization.
func teamSubscriptionQuery(teamID, orgID uint) *gorm.DB {
	return database.DB.Where(
		`org_id = ? AND (id IN (SELECT subscription_id FROM subscription_teams WHERE team_id = ?) OR scope = 'organization')`,
		orgID, teamID,
	)
}

// orgMemberEmails returns the lower-cased emails of everyone in the organization.
func orgMemberEmails(orgID uint) map[string]bool {
	out := map[string]bool{}
	if orgID == 0 {
		return out
	}
	var emails []string
	database.DB.Model(&models.User{}).Where("org_id = ? AND deleted_at IS NULL", orgID).Pluck("email", &emails)
	for _, e := range emails {
		out[strings.ToLower(strings.TrimSpace(e))] = true
	}
	return out
}

// validRecipients keeps alert recipients to well-formed addresses of the caller's colleagues,
// so alerts can't be used to send CostOp-branded email to arbitrary people.
func validRecipients(recipients []string, orgID uint) ([]string, bool) {
	members := orgMemberEmails(orgID)
	out := make([]string, 0, len(recipients))
	for _, r := range recipients {
		addr, err := mail.ParseAddress(strings.TrimSpace(r))
		if err != nil {
			return nil, false
		}
		email := strings.ToLower(addr.Address)
		if !members[email] {
			return nil, false
		}
		out = append(out, email)
	}
	return out, true
}

// parseUint converts a path parameter to an ID (0 when malformed).
func parseUint(s string) uint {
	n, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0
	}
	return uint(n)
}
