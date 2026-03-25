import utils from './utils';

export const requestsApi = {
    // Get all subscription requests (admins see all; members see their own)
    get_all: (status?: 'pending' | 'approved' | 'rejected') => {
        const params = status ? `?status=${status}` : '';
        return utils.request({ url: `/requests${params}`, method: 'GET' });
    },
    // Submit a new subscription request (any team member)
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
        return utils.request({ url: `/requests`, method: 'POST', data });
    },
    // Approve a pending request — auto-creates a Subscription (admin only)
    approve: (id: number | string) => {
        return utils.request({ url: `/requests/${id}/approve`, method: 'PATCH' });
    },
    // Reject a pending request (admin only)
    reject: (id: number | string) => {
        return utils.request({ url: `/requests/${id}/reject`, method: 'PATCH' });
    }
};
