import utils from './utils';
import { METHODS } from '../constants';

export interface AdminOrgMember {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    role: string;
    designation: string;
    is_email_verified: boolean;
    is_onboarded: boolean;
    created_at: string;
}

export interface AdminOrgItem {
    id: number;
    name: string;
    owner_id: number;
    owner_name: string;
    owner_email: string;
    owner_avatar_url: string;
    plan: string;
    is_pro: boolean;
    member_count: number;
    member_limit: number;
    slack_webhook_url: string;
    razorpay_payment_id: string;
    created_at: string;
    updated_at: string;
    members: AdminOrgMember[];
}

export interface AdminOrgsResponse {
    organizations: AdminOrgItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface ToggleOrgProResponse {
    message: string;
    org_id: number;
    org_name: string;
    plan: string;
    is_pro: boolean;
}

export interface AdminUserItem {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    is_email_verified: boolean;
    is_onboarded: boolean;
    org_id: number;
    org_name: string;
    plan: string;
    is_pro: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
    default_team_id: number;
    default_team_name: string;
}

export interface AdminUsersPagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface AdminUsersResponse {
    users: AdminUserItem[];
    pagination: AdminUsersPagination;
}

export interface ToggleProResponse {
    message: string;
    user_id: number;
    org_id: number;
    org_name: string;
    plan: string;
    is_pro: boolean;
}

export const adminOrgsApi = {
    get_organizations: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        plan?: 'all' | 'pro' | 'free' | string;
    }): Promise<AdminOrgsResponse> => {
        const queryParts: string[] = [];
        if (params?.page) queryParts.push(`page=${params.page}`);
        if (params?.limit) queryParts.push(`limit=${params.limit}`);
        if (params?.search && params.search.trim()) queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
        if (params?.plan && params.plan !== 'all') queryParts.push(`plan=${encodeURIComponent(params.plan)}`);

        const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
        return utils.request({
            url: `/admin/organizations${queryString}`,
            method: METHODS.GET,
        });
    },

    toggle_pro: (orgId: number, isPro?: boolean): Promise<ToggleOrgProResponse> => {
        return utils.request({
            url: `/admin/organizations/${orgId}/pro`,
            method: METHODS.PATCH,
            data: typeof isPro === 'boolean' ? { is_pro: isPro } : {},
        });
    },

    get_members: (orgId: number): Promise<{ org_id: number; members: AdminOrgMember[]; total: number }> => {
        return utils.request({
            url: `/admin/organizations/${orgId}/members`,
            method: METHODS.GET,
        });
    },
};

export const adminUsersApi = {
    get_users: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        plan?: 'all' | 'pro' | 'free' | string;
    }): Promise<AdminUsersResponse> => {
        const queryParts: string[] = [];
        if (params?.page) queryParts.push(`page=${params.page}`);
        if (params?.limit) queryParts.push(`limit=${params.limit}`);
        if (params?.search && params.search.trim()) queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
        if (params?.plan && params.plan !== 'all') queryParts.push(`plan=${encodeURIComponent(params.plan)}`);

        const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
        return utils.request({
            url: `/admin/users${queryString}`,
            method: METHODS.GET,
        });
    },

    toggle_pro: (userId: number, isPro?: boolean): Promise<ToggleProResponse> => {
        return utils.request({
            url: `/admin/users/${userId}/pro`,
            method: METHODS.PATCH,
            data: typeof isPro === 'boolean' ? { is_pro: isPro } : {},
        });
    },
};
