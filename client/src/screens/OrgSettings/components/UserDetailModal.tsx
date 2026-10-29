import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminUserItem } from '../../../utils/api_request/adminUsers';
import { 
    X, 
    Copy, 
    Check, 
    Sparkles, 
    Shield, 
    ShieldAlert, 
    Mail, 
    Building2, 
    Users, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDetailModalProps {
    user: AdminUserItem | null;
    isOpen: boolean;
    onClose: () => void;
    onTogglePro: (userId: number, currentIsPro: boolean) => Promise<void>;
    isToggling: boolean;
}

export default function UserDetailModal({
    user,
    isOpen,
    onClose,
    onTogglePro,
    isToggling,
}: UserDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);

    const handleCopyEmail = () => {
        if (!user) return;
        navigator.clipboard.writeText(user.email);
        setCopied(true);
        toast.success("Email copied to clipboard!", { id: "email-copied" });
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };

    const handleActionClick = () => {
        if (!user) return;
        if (user.is_pro) {
            setShowConfirmRevoke(true);
        } else {
            onTogglePro(user.id, user.is_pro);
        }
    };

    const confirmRevoke = async () => {
        if (!user) return;
        setShowConfirmRevoke(false);
        await onTogglePro(user.id, user.is_pro);
    };

    const userInitial = (user?.name?.trim()?.[0] || user?.email?.[0] || '?').toUpperCase();

    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
                    {/* Backdrop click dismiss */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0"
                        onClick={onClose}
                    />

                    {/* Modal / Bottom Sheet Box */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320, bounce: 0 }}
                        className="relative z-10 w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden h-[86vh] min-h-[75vh] max-h-[90vh] sm:h-[84vh] sm:min-h-[70vh] sm:max-h-[88vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                    {/* Mobile swipe pill indicator */}
                    <div className="sm:hidden pt-3 pb-1 flex justify-center">
                        <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-b from-slate-50/70 to-white">
                        <div className="flex items-center gap-3.5 min-w-0">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-sm flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                    {userInitial}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                                        {user.name || 'Unnamed User'}
                                    </h3>
                                    {user.is_admin ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                                            <Shield size={10} /> Website Admin
                                        </span>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-[280px]">
                                        {user.email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyEmail}
                                        className="p-1 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                                        title="Copy email address"
                                    >
                                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Scrollable Modal Content */}
                    <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                        {/* Plan Status Banner */}
                        <div className={`p-4 rounded-2xl border transition-all ${
                            user.is_pro
                                ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {user.is_pro ? (
                                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                            <Crown size={15} />
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                                            <Shield size={15} />
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                            Workspace Subscription
                                        </span>
                                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                            {user.is_pro ? 'CostOp Pro Active' : 'Free Tier Workspace'}
                                        </h4>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                    user.is_pro 
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                        : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {user.is_pro ? 'PRO' : 'FREE'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {user.is_pro 
                                    ? "This user has full CostOp Pro privileges enabled: up to 100 team member seats, real-time Slack renewal alerts, and unlimited spending analytics."
                                    : "This workspace is limited to 30 team members and standard reporting. Grant Pro access to unlock all production features immediately."}
                            </p>
                        </div>

                        {/* Confirmation dialog for revoking */}
                        {showConfirmRevoke && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-rose-50 border border-rose-200 rounded-2xl"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                                        <ShieldAlert size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-rose-900">
                                            Revoke CostOp Pro Access?
                                        </h4>
                                        <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                                            Are you sure you want to revoke Pro access for <strong>{user.email}</strong>? The workspace member quota will revert to 30 seats and premium alerts will pause.
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={confirmRevoke}
                                                disabled={isToggling}
                                                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                                            >
                                                {isToggling ? 'Revoking...' : 'Yes, Revoke Pro'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmRevoke(false)}
                                                className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Generic Details Grid */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                                Account & Workspace Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                        <Building2 size={13} />
                                        <span>Organization Workspace</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-900 block mt-1 truncate">
                                        {user.org_name || 'Standard Workspace'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Org ID: #{user.org_id || '0'}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                        <Users size={13} />
                                        <span>Default Team</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-900 block mt-1 truncate">
                                        {user.default_team_name || 'General Team'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Team ID: #{user.default_team_id || '0'}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                        <Mail size={13} />
                                        <span>Email Verification</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {user.is_email_verified ? (
                                            <>
                                                <CheckCircle2 size={14} className="text-emerald-600" />
                                                <span className="text-xs font-extrabold text-emerald-700">Verified</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={14} className="text-amber-600" />
                                                <span className="text-xs font-extrabold text-amber-700">Unverified</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {user.is_onboarded ? 'Onboarding completed' : 'Onboarding pending'}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                        <Calendar size={13} />
                                        <span>User ID</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-900 block mt-1 font-mono">
                                        #{user.id}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        Database primary key
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                    <Clock size={13} /> Registered On:
                                </span>
                                <span className="font-extrabold text-slate-800">
                                    {formatDate(user.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                    <Clock size={13} /> Last Activity / Update:
                                </span>
                                <span className="font-extrabold text-slate-800">
                                    {formatDate(user.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleActionClick}
                            disabled={isToggling}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                                user.is_pro
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            }`}
                        >
                            {isToggling ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Updating Tier...</span>
                                </>
                            ) : user.is_pro ? (
                                <>
                                    <ShieldAlert size={16} />
                                    <span>Revoke Pro Access</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Give Pro Access</span>
                                </>
                            )}
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Done
                        </motion.button>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
