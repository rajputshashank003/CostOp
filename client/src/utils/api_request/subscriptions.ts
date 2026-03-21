import utils from './utils';

export const subscriptionsApi = {
    get_all: (status: string = "active") => {
        return utils.request({
            url: `/subscriptions?status=${status}`,
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
