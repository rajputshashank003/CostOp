import utils from './utils';

export const membersApi = {
    // Get all teams the current user belongs to
    get_teams: () => {
        return utils.request({ url: `/teams`, method: 'GET' });
    },
    // Get members + invites for a specific team, with optional filters
    get_by_team: (teamId: number | string, search?: string, subscription?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (subscription && subscription !== 'all') params.append('subscription', subscription);

        const qs = params.toString();
        const url = qs ? `/teams/${teamId}/members?${qs}` : `/teams/${teamId}/members`;
        return utils.request({ url, method: 'GET' });
    },
    // Move a member to a different team (admin only)
    update_member_team: (teamId: number | string, userId: number | string, newTeamId: number) => {
        return utils.request({
            url: `/teams/${teamId}/members/${userId}`,
            method: 'PATCH',
            data: { new_team_id: newTeamId }
        });
    },
    // Get members + invites for the caller's current default team (All Teams view)
    get_all: (search?: string, subscription?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (subscription && subscription !== 'all') params.append('subscription', subscription);

        const qs = params.toString();
        const url = qs ? `/members?${qs}` : `/members`;
        return utils.request({ url, method: 'GET' });
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
