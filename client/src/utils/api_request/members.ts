import utils from './utils';
import { METHODS } from '../constants';

export const membersApi = {
    get_teams: () => {
        return utils.request({ url: `/teams`, method: METHODS.GET });
    },
    get_by_team: (teamId: number | string, search?: string, subscription?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (subscription && subscription !== 'all') params.append('subscription', subscription);

        const qs = params.toString();
        const url = qs ? `/teams/${teamId}/members?${qs}` : `/teams/${teamId}/members`;
        return utils.request({ url, method: METHODS.GET });
    },
    update_member_team: (teamId: number | string, userId: number | string, newTeamId: number) => {
        return utils.request({
            url: `/teams/${teamId}/members/${userId}`,
            method: METHODS.PATCH,
            data: { new_team_id: newTeamId }
        });
    },
    get_all: (search?: string, subscription?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (subscription && subscription !== 'all') params.append('subscription', subscription);

        const qs = params.toString();
        const url = qs ? `/members?${qs}` : `/members`;
        return utils.request({ url, method: METHODS.GET });
    },
    invite: (email: string, designation: string, teamId?: number) => {
        return utils.request({
            url: `/members/invite`,
            method: METHODS.POST,
            data: { email, designation, ...(teamId ? { team_id: teamId } : {}) }
        });
    },
    revoke: (id: string | number) => {
        return utils.request({ url: `/members/invite/${id}`, method: METHODS.DELETE });
    }
};
