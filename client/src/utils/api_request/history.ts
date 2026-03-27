import utils from "./utils";
import { METHODS } from '../constants';

export const historyApi = {
    get_spends: async (months: number | "custom" = 6, start?: string, end?: string, team_id?: string, status?: string) => {
        const query = new URLSearchParams();
        query.append('months', months.toString());
        if (start) query.append('start', start);
        if (end) query.append('end', end);
        if (team_id) query.append('team_id', team_id);
        if (status) query.append('status', status);

        return utils.request({
            url: `/history/spends?${query.toString()}`,
            method: METHODS.GET,
        });
    },
    get_department_spends: async (team_id?: string, status?: string) => {
        const query = new URLSearchParams();
        if (team_id) query.append('team_id', team_id);
        if (status) query.append('status', status);
        return utils.request({
            url: `/history/department-spends?${query.toString()}`,
            method: METHODS.GET,
        });
    }
};
