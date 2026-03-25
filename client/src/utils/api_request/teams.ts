import utils from './utils';

export const teamsApi = {
    // All teams the current user belongs to (with role)
    get_my_teams: () => {
        return utils.request({ url: `/teams`, method: 'GET' });
    },
    // All teams in the workspace (for dropdowns)
    get_all: () => {
        return utils.request({ url: `/teams/all`, method: 'GET' });
    },
    // Create a new team
    create: (name: string) => {
        return utils.request({ url: `/teams`, method: 'POST', data: { name } });
    }
};
