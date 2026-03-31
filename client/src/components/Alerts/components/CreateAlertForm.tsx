import { Plus, Save, RefreshCw, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

const OFFSET_OPTIONS = [
    { label: '7 days before', value: 7 },
    { label: '2 days before', value: 2 },
    { label: '1 day before', value: 1 },
];

interface CreateAlertFormProps {
    isAutoPay: boolean;
    createType: 'subscription' | 'custom';
    setCreateType: (t: 'subscription' | 'custom') => void;
    selectedOffsets: number[];
    toggleOffset: (val: number) => void;
    customTitle: string;
    setCustomTitle: (val: string) => void;
    customDate: string;
    setCustomDate: (val: string) => void;
    recipients: string[];
    emailInput: string;
    setEmailInput: (val: string) => void;
    addRecipient: () => void;
    removeRecipient: (email: string) => void;
    saving: boolean;
    handleCreate: () => void;
    onCancel: () => void;
}

export default function CreateAlertForm({
    isAutoPay,
    createType, setCreateType,
    selectedOffsets, toggleOffset,
    customTitle, setCustomTitle,
    customDate, setCustomDate,
    recipients, emailInput, setEmailInput,
    addRecipient, removeRecipient,
    saving, handleCreate, onCancel
}: CreateAlertFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50"
        >
            {/* Alert Type Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setCreateType('subscription')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${createType === 'subscription' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
                >
                    {isAutoPay ? 'Renewal Alert' : 'Expiration Alert'}
                </button>
                <button
                    onClick={() => setCreateType('custom')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${createType === 'custom' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-500 border-slate-200 hover:border-violet-300'}`}
                >
                    Custom Reminder
                </button>
            </div>

            {createType === 'subscription' ? (
                <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Alert timing</p>
                    <div className="flex flex-wrap gap-2">
                        {OFFSET_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => toggleOffset(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedOffsets.includes(opt.value)
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Reminder title</label>
                        <input
                            type="text"
                            value={customTitle}
                            onChange={e => setCustomTitle(e.target.value)}
                            placeholder="e.g. Review this subscription"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                            <Calendar size={12} /> Date &amp; time
                        </label>
                        <input
                            type="datetime-local"
                            value={customDate}
                            onChange={e => setCustomDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>
                </>
            )}

            {/* Recipients */}
            <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Email recipients ({recipients.length}/5)</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {recipients.map(email => (
                        <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg">
                            {email}
                            <button onClick={() => removeRecipient(email)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                        </span>
                    ))}
                </div>
                {recipients.length < 5 && (
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }}
                            placeholder="Add email…"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <button onClick={addRecipient} className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Alert
                </button>
            </div>
        </motion.div>
    );
}
