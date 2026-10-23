import utils from './utils';
import { METHODS } from '../constants';

export interface RazorpayOrderInfo {
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    org_name: string;
}

export interface VerifyPaymentPayload {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface OrderItem {
    id: number;
    org_id: number;
    user_id: number;
    razorpay_order_id: string;
    razorpay_payment_id?: string;
    plan: string;
    interval: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed';
    receipt?: string;
    failure_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface PricingInfo {
    plan_code: string;
    plan_name: string;
    monthly_price: number;
    yearly_discount_percent: number;
    yearly_monthly_equivalent: number;
    yearly_total_price: number;
    yearly_total_savings: number;
    currency: string;
    max_members: number;
}

export interface UpdatePlanSettingsPayload {
    monthly_price: number;
    yearly_discount_percent: number;
    plan_name?: string;
    max_members?: number;
}

export const paymentApi = {
    get_pricing: (): Promise<PricingInfo> => {
        return utils.request({
            url: '/payment/pricing',
            method: METHODS.GET,
            show_error: false,
        });
    },

    update_plan_settings: (data: UpdatePlanSettingsPayload): Promise<any> => {
        return utils.request({
            url: '/admin/plan-settings',
            method: METHODS.PATCH,
            data,
        });
    },

    create_order: (data?: { interval?: string }): Promise<RazorpayOrderInfo> => {
        return utils.request({
            url: '/payment/create-order',
            method: METHODS.POST,
            data,
        });
    },

    verify: (data: VerifyPaymentPayload): Promise<any> => {
        return utils.request({
            url: '/payment/verify',
            method: METHODS.POST,
            data,
        });
    },

    get_orders: (): Promise<{ orders: OrderItem[]; total: number }> => {
        return utils.request({
            url: '/payment/orders',
            method: METHODS.GET,
        });
    },
};
