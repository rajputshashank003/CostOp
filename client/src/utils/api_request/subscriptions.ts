import utils from './utils';

export const subscriptionsApi = {
    get_all: (params?: { status?: string, search?: string, category?: string, cycle?: string, start?: string, end?: string, team_id?: string | number }) => {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        else query.append('status', 'active');

        if (params?.search) query.append('search', params.search);
        if (params?.category && params.category !== 'All Categories') query.append('category', params.category);
        if (params?.cycle && params.cycle !== 'All Cycles') query.append('cycle', params.cycle);
        if (params?.start) query.append('start', params.start);
        if (params?.end) query.append('end', params.end);
        if (params?.team_id) query.append('team_id', String(params.team_id));

        return utils.request({
            url: `/subscriptions?${query.toString()}`,
            method: 'GET',
            response_array: true
        });
    },
    get_by_id: (id: number | string) => {
        return utils.request({ url: `/subscriptions/${id}`, method: 'GET' });
    },
    create: (payload: any) => {
        return utils.request({
            url: `/subscriptions`,
            method: 'POST',
            data: payload
        });
    },
    delete: (id: number) => {
        return utils.request({
            url: `/subscriptions/${id}`,
            method: 'DELETE',
            show_error: false
        });
    },
    archive: (id: number) => {
        return utils.request({
            url: `/subscriptions/${id}/archive`,
            method: 'PATCH',
        });
    },
    restore: (id: number) => {
        return utils.request({
            url: `/subscriptions/${id}/restore`,
            method: 'PATCH',
        });
    }
};
