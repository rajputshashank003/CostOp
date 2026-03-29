import utils from './utils';
import { METHODS } from '../constants';

export const dashboardApi = {
    get: (params?: {
        search?: string;
        category?: string;
        cycle?: string;
        start?: string;
        end?: string;
        team_id?: string | number;
    }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.category && params.category !== "All Categories") query.set("category", params.category);
        if (params?.cycle && params.cycle !== "All Cycles") query.set("cycle", params.cycle);
        if (params?.team_id) query.set("team_id", String(params.team_id));
        if (params?.start) query.set("start", params.start);
        if (params?.end) query.set("end", params.end);
        const qs = query.toString();
        return utils.request({
            url: `/dashboard${qs ? `?${qs}` : ""}`,
            method: METHODS.GET
        });
    }
};
