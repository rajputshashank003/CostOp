import utils from './utils';
import { METHODS } from '../constants';

export interface AlertPayload {
    subscription_id?: number | null;
    alert_type: 'renewal' | 'expiration' | 'custom';
    trigger_offsets?: number[];
    custom_date?: string | null;
    custom_title?: string;
    recipients: string[];
}

export const alertsApi = {
    get_all: (subscriptionId?: number) => {
        const url = subscriptionId
            ? `/alerts?subscription_id=${subscriptionId}`
            : '/alerts';
        return utils.request({ url, method: METHODS.GET, response_array: true });
    },
    create: (payload: AlertPayload) => {
        return utils.request({ url: '/alerts', method: METHODS.POST, data: payload });
    },
    update: (id: number, payload: Partial<AlertPayload> & { status?: string }) => {
        return utils.request({ url: `/alerts/${id}`, method: METHODS.PATCH, data: payload });
    },
    delete: (id: number) => {
        return utils.request({ url: `/alerts/${id}`, method: METHODS.DELETE, show_error: false });
    },
};
