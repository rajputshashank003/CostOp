import utils from './utils';

export const subscriptionsApi = {
    get_all: (params?: { status?: string, search?: string, category?: string, cycle?: string }) => {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        else query.append('status', 'active');

        if (params?.search) query.append('search', params.search);
        if (params?.category && params.category !== 'All Categories') query.append('category', params.category);
        if (params?.cycle && params.cycle !== 'All Cycles') query.append('cycle', params.cycle);

        return utils.request({
            url: `/subscriptions?${query.toString()}`,
            method: 'GET',
            response_array: true
        });
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
            show_error: false // Handled manually by Delete component
        });
    }
};
