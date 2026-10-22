import utils from './utils';
import { METHODS } from '../constants';

export interface OrganizationDetails {
    id: number;
    name: string;
    owner_id: number;
    plan: 'free' | 'pro';
    slack_webhook_url: string;
    razorpay_customer_id?: string;
    razorpay_sub_id?: string;
    razorpay_payment_id?: string;
    active_members_count: number;
    member_limit: number;
    can_export_report: boolean;
    can_use_slack: boolean;
}

export const organizationApi = {
    get_details: (): Promise<OrganizationDetails> => {
        return utils.request({
            url: '/organization',
            method: METHODS.GET,
            show_error: false,
        });
    },

    update_settings: (data: { name?: string; slack_webhook_url?: string }): Promise<any> => {
        return utils.request({
            url: '/organization/settings',
            method: METHODS.PATCH,
            data,
        });
    },

    upgrade: (): Promise<any> => {
        return utils.request({
            url: '/organization/upgrade',
            method: METHODS.POST,
        });
    },

    test_slack: (webhook_url: string): Promise<any> => {
        return utils.request({
            url: '/organization/test-slack',
            method: METHODS.POST,
            data: { webhook_url },
            show_error: false,
        });
    },
};
