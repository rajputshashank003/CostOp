import utils from './utils';
import { METHODS } from '../constants';

export const requestsApi = {
    get_all: (status?: 'pending' | 'approved' | 'rejected') => {
        const params = status ? `?status=${status}` : '';
        return utils.request({ url: `/requests${params}`, method: METHODS.GET });
    },
    create: (data: {
        name: string;
        category?: string;
        plan_type?: string;
        billing_cycle?: string;
        scope?: string;
        cost?: number;
        seat_count?: number;
        justification?: string;
    }) => {
        return utils.request({ url: `/requests`, method: METHODS.POST, data });
    },
    approve: (id: number | string) => {
        return utils.request({ url: `/requests/${id}/approve`, method: METHODS.PATCH });
    },
    reject: (id: number | string) => {
        return utils.request({ url: `/requests/${id}/reject`, method: METHODS.PATCH });
    }
};
