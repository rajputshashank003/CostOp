import { useState, useEffect, useCallback } from 'react';
import { X, Bell, Plus, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { alertsApi } from '@/utils/api_request/alerts';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';

import { Alert } from './types';
import AlertItem from './components/AlertItem';
import CreateAlertForm from './components/CreateAlertForm';

interface AlertModalProps {
    subscriptionId: number;
    subscriptionName: string;
    isAutoPay: boolean;
    onClose: () => void;
    onAlertsChange?: () => void;
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AlertModal({ subscriptionId, subscriptionName, isAutoPay, onClose, onAlertsChange }: AlertModalProps) {
    const { user } = useUser();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    // "create new" form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createType, setCreateType] = useState<'subscription' | 'custom'>('subscription');
    const [selectedOffsets, setSelectedOffsets] = useState<number[]>([7]);
    const [recipients, setRecipients] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');
    const [customTitle, setCustomTitle] = useState('');
    const [customDate, setCustomDate] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await alertsApi.get_all(subscriptionId);
            setAlerts(Array.isArray(data) ? data : []);
        } catch {
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }, [subscriptionId]);

    useEffect(() => {
        fetchAlerts();
        // Set default recipient to user's email
        if (user?.email) setRecipients([user.email]);
    }, [fetchAlerts, user]);

    const toggleOffset = (val: number) => {
        setSelectedOffsets(prev =>
            prev.includes(val) ? prev.filter(o => o !== val) : [...prev, val]
        );
    };

    const addRecipient = () => {
        const email = emailInput.trim();
        if (!email) return;
        if (!validateEmail(email)) { toast.error('Invalid email address'); return; }
        if (recipients.includes(email)) { toast.error('Already added'); return; }
        if (recipients.length >= 5) { toast.error('Maximum 5 recipients allowed'); return; }
        setRecipients(prev => [...prev, email]);
        setEmailInput('');
    };

    const removeRecipient = (email: string) => {
        setRecipients(prev => prev.filter(r => r !== email));
    };

    const handleCreate = async () => {
        if (recipients.length === 0) { toast.error('Add at least one recipient'); return; }

        if (createType === 'subscription') {
            if (selectedOffsets.length === 0) { toast.error('Select at least one timing'); return; }
        } else {
            if (!customTitle.trim()) { toast.error('Enter a title for this reminder'); return; }
            if (!customDate) { toast.error('Select a date for this reminder'); return; }
        }

        setSaving(true);
        try {
            const payload: any = {
                subscription_id: subscriptionId,
                alert_type: createType === 'subscription'
                    ? (isAutoPay ? 'renewal' : 'expiration')
                    : 'custom',
                recipients,
            };
            if (createType === 'subscription') {
                payload.trigger_offsets = selectedOffsets;
            } else {
                payload.custom_title = customTitle.trim();
                payload.custom_date = new Date(customDate).toISOString();
            }

            await alertsApi.create(payload);
            toast.success('Alert set successfully');
            setShowCreateForm(false);
            setSelectedOffsets([7]);
            setCustomTitle('');
            setCustomDate('');
            if (user?.email) setRecipients([user.email]);
            fetchAlerts();
            onAlertsChange?.();
        } catch {
            // error handled by api layer
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (alertId: number) => {
        try {
            await alertsApi.delete(alertId);
            toast.success('Alert removed');
            fetchAlerts();
            onAlertsChange?.();
        } catch { }
    };

    const handleToggleStatus = async (alert: Alert) => {
        const newStatus = alert.status === 'active' ? 'dismissed' : 'active';
        try {
            await alertsApi.update(alert.id, { status: newStatus });
            toast.success(newStatus === 'active' ? 'Alert re-activated' : 'Alert paused');
            fetchAlerts();
        } catch { }
    };

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const inactiveAlerts = alerts.filter(a => a.status !== 'active');

    return (
        <AnimatePresence>
            <motion.div
                key="alert-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    key="alert-modal"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-emerald-50">
                                <BellRing size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-800 text-base">Alerts</h2>
                                <p className="text-xs text-slate-400">{subscriptionName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Existing Alerts */}
                        <div className="p-5">
                            {loading ? (
                                <div className="text-center text-slate-400 text-sm py-8">Loading alerts…</div>
                            ) : alerts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bell size={32} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">No alerts set for this subscription</p>
                                </div>
                            ) : (
                                <div className="space-y-2 mb-4">
                                    {activeAlerts.map(alert => (
                                        <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} onToggle={handleToggleStatus} />
                                    ))}
                                    {inactiveAlerts.length > 0 && (
                                        <>
                                            <p className="text-xs text-slate-400 pt-1 font-medium">Paused / Triggered</p>
                                            {inactiveAlerts.map(alert => (
                                                <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} onToggle={handleToggleStatus} dimmed />
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Create New Alert Form Toggle */}
                            {!showCreateForm ? (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all text-sm font-medium"
                                >
                                    <Plus size={15} /> Add Alert
                                </button>
                            ) : (
                                <CreateAlertForm
                                    isAutoPay={isAutoPay}
                                    createType={createType}
                                    setCreateType={setCreateType}
                                    selectedOffsets={selectedOffsets}
                                    toggleOffset={toggleOffset}
                                    customTitle={customTitle}
                                    setCustomTitle={setCustomTitle}
                                    customDate={customDate}
                                    setCustomDate={setCustomDate}
                                    recipients={recipients}
                                    emailInput={emailInput}
                                    setEmailInput={setEmailInput}
                                    addRecipient={addRecipient}
                                    removeRecipient={removeRecipient}
                                    saving={saving}
                                    handleCreate={handleCreate}
                                    onCancel={() => setShowCreateForm(false)}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
