import utils from './utils';
import { METHODS } from '../constants';
import axios from 'axios';
import { LOCAL_STORAGE } from '../constants';

export interface MonthlyReportData {
    organization_name: string;
    generated_at: string;
    report_period: string;
    total_monthly_spend: number;
    annual_run_rate: number;
    active_subscriptions: number;
    total_active_members: number;
    category_breakdown: Array<{
        category: string;
        spend: number;
        percentage: number;
    }>;
    subscriptions: Array<{
        id: number;
        name: string;
        category: string;
        billing_cycle: string;
        cost: number;
        monthly_cost: number;
        seat_count: number;
        is_auto_pay: boolean;
        next_billing_date: string;
    }>;
    upcoming_renewals: Array<{
        name: string;
        next_billing_date: string;
        days_until: number;
        cost: number;
        is_auto_pay: boolean;
    }>;
}

export const reportsApi = {
    get_monthly_data: (): Promise<MonthlyReportData> => {
        return utils.request({
            url: '/reports/monthly?format=json',
            method: METHODS.GET,
            show_error: false,
        });
    },

    download_monthly_csv: async (): Promise<void> => {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
        const token = localStorage.getItem(LOCAL_STORAGE.TOKEN);

        const response = await axios.get(`${baseURL}/reports/monthly?format=csv`, {
            responseType: 'blob',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const now = new Date();
        const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
        link.setAttribute('download', `CostOp_Executive_Report_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};
