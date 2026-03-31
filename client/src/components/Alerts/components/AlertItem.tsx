import { Bell, BellOff, Trash2 } from 'lucide-react';
import { Alert } from '../types';

interface AlertItemProps {
    alert: Alert;
    onDelete: (id: number) => void;
    onToggle: (alert: Alert) => void;
    dimmed?: boolean;
}

export default function AlertItem({ alert, onDelete, onToggle, dimmed }: AlertItemProps) {
    const isCustom = alert.alert_type === 'custom';
    const isActive = alert.status === 'active';

    // Null-safe: DB may return null instead of []
    const offsets = alert.trigger_offsets ?? [];
    const recipients = alert.recipients ?? [];

    const label = isCustom
        ? `📝 ${alert.custom_title || 'Custom reminder'}`
        : alert.alert_type === 'renewal'
            ? `🔁 Renewal alert — ${offsets.map(o => `${o}d`).join(', ')} before`
            : `⏰ Expiration alert — ${offsets.map(o => `${o}d`).join(', ')} before`;

    const containerClass = dimmed
        ? 'border-slate-100 bg-slate-50 opacity-60'
        : isCustom
            ? 'border-violet-100 bg-violet-50'
            : 'border-emerald-100 bg-emerald-50';

    const textClass = isCustom ? 'text-violet-800' : 'text-emerald-800';

    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${containerClass}`}>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textClass} truncate`}>{label}</p>
                {alert.custom_date && (
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(alert.custom_date).toLocaleString()}</p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{recipients.slice(0, 2).join(', ')}{recipients.length > 2 ? ` +${recipients.length - 2}` : ''}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={() => onToggle(alert)}
                    className={`p-1.5 rounded-lg transition-colors ${isActive ? 'hover:bg-amber-100 text-slate-400 hover:text-amber-600' : 'hover:bg-emerald-100 text-slate-300 hover:text-emerald-600'}`}
                    title={isActive ? 'Pause alert' : 'Re-activate alert'}
                >
                    {isActive ? <BellOff size={13} /> : <Bell size={13} />}
                </button>
                <button
                    onClick={() => onDelete(alert.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                    title="Delete alert"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}
