export interface Alert {
    id: number;
    subscription_id: number | null;
    alert_type: 'renewal' | 'expiration' | 'custom';
    trigger_offsets: number[];
    triggered_offsets: number[];
    custom_date: string | null;
    custom_title: string;
    recipients: string[];
    status: string;
    created_at: string;
}
