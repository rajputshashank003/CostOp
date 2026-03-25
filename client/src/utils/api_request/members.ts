import utils from './utils';

export const membersApi = {
    // Get all teams the current user belongs to
    get_teams: () => {
        return utils.request({ url: `/teams`, method: 'GET' });
    },
    // Get members + invites for a specific team
    get_by_team: (teamId: number | string) => {
        return utils.request({ url: `/teams/${teamId}/members`, method: 'GET' });
    },
    // Move a member to a different team (admin only)
    update_member_team: (teamId: number | string, userId: number | string, newTeamId: number) => {
        return utils.request({
            url: `/teams/${teamId}/members/${userId}`,
            method: 'PATCH',
            data: { new_team_id: newTeamId }
        });
    },
    // Get members + invites for the caller's current default team
    get_all: () => {
        return utils.request({ url: `/members`, method: 'GET' });
    },
    // Invite a user to a specific team (team_id optional, defaults to caller's team)
    invite: (email: string, designation: string, teamId?: number) => {
        return utils.request({
            url: `/members/invite`,
            method: 'POST',
            data: { email, designation, ...(teamId ? { team_id: teamId } : {}) }
        });
    },
    revoke: (id: string | number) => {
        return utils.request({ url: `/members/invite/${id}`, method: 'DELETE' });
    }
};
