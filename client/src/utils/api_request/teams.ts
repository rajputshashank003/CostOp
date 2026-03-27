import utils from './utils';
import { METHODS } from '../constants';

export const teamsApi = {
    get_my_teams: () => {
        return utils.request({ url: `/teams`, method: METHODS.GET });
    },
    get_all: () => {
        return utils.request({ url: `/teams/all`, method: METHODS.GET });
    },
    create: (name: string) => {
        return utils.request({ url: `/teams`, method: METHODS.POST, data: { name } });
    },
    get_by_id: (teamId: number) => {
        return utils.request({ url: `/teams/${teamId}`, method: METHODS.GET });
    },
    update_settings: (data: { teamId: number; name: string; allow_member_invites: boolean }) => {
        const { teamId, ...payload } = data;
        return utils.request({ url: `/teams/${teamId}/settings`, method: METHODS.PATCH, data: payload });
    },
};
