import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminOrgItem, AdminOrgMember } from '../../../utils/api_request/adminUsers';
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
    Crown,
    CreditCard,
    Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrgDetailModalProps {
    org: AdminOrgItem | null;
    isOpen: boolean;
    onClose: () => void;
    onTogglePro: (orgId: number, currentIsPro: boolean) => Promise<void>;
    isToggling: boolean;
}

export default function OrgDetailModal({
    org,
    isOpen,
    onClose,
    onTogglePro,
    isToggling,
}: OrgDetailModalProps) {
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(email);
        toast.success("Email copied to clipboard!", { id: "email-copied" });
        setTimeout(() => setCopiedEmail(null), 2000);
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
        if (!org) return;
        if (org.is_pro) {
            setShowConfirmRevoke(true);
        } else {
            onTogglePro(org.id, org.is_pro);
        }
    };

    const confirmRevoke = async () => {
        if (!org) return;
        setShowConfirmRevoke(false);
        await onTogglePro(org.id, org.is_pro);
    };

    const orgInitial = (org?.name?.trim()?.[0] || 'O').toUpperCase();

    return (
        <AnimatePresence>
            {isOpen && org && (
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
                    className="relative z-10 w-full max-w-xl bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden h-[86vh] min-h-[75vh] max-h-[92vh] sm:h-[84vh] sm:min-h-[70vh] sm:max-h-[88vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Mobile swipe pill indicator */}
                    <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center bg-gradient-to-b from-slate-50 to-white">
                        <div className="w-10 h-1 bg-slate-200 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-b from-slate-50/70 to-white">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-xs flex-shrink-0">
                                {orgInitial}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                                        {org.name}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        org.is_pro 
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                        {org.is_pro ? 'PRO WORKSPACE' : 'FREE TIER'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                                    <span>Owner: <strong>{org.owner_name || 'Administrator'}</strong></span>
                                    {org.owner_email && (
                                        <>
                                            <span>•</span>
                                            <span className="truncate max-w-[160px] sm:max-w-[220px]">{org.owner_email}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyEmail(org.owner_email)}
                                                className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                                title="Copy owner email"
                                            >
                                                {copiedEmail === org.owner_email ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                            </button>
                                        </>
                                    )}
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

                    {/* Scrollable Content */}
                    <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                        {/* Plan Status Banner */}
                        <div className={`p-4 rounded-2xl border transition-all ${
                            org.is_pro
                                ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {org.is_pro ? (
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
                                            Organization Plan Status
                                        </span>
                                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                            {org.is_pro ? 'CostOp Pro Tier Active' : 'Free Workspace'}
                                        </h4>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                    org.is_pro 
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                        : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {org.is_pro ? '100 SEATS' : '30 SEATS'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {org.is_pro 
                                    ? `This entire organization has CostOp Pro unlocked: all ${org.member_count} members enjoy expanded 100-seat limits, real-time Slack renewal alerts, and priority reports.`
                                    : `This organization is on the Free plan (30 team member limit). Granting Pro applies immediately to all current and future members in this workspace.`}
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
                                            Revoke Pro Access for Organization?
                                        </h4>
                                        <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                                            Are you sure you want to revoke CostOp Pro access from <strong>{org.name}</strong>? All <strong>{org.member_count} members</strong> will revert to the Free tier (30 member limit) and premium alerts will pause.
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={confirmRevoke}
                                                disabled={isToggling}
                                                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                                            >
                                                {isToggling ? 'Revoking...' : 'Yes, Revoke Pro from Org'}
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

                        {/* Organization Metrics Grid */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                                Organization Overview
                            </h4>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                        <Users size={13} />
                                        <span>Active Members</span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-1">
                                        {org.member_count} / {org.member_limit} seats
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {org.is_pro ? 'Pro quota: 100' : 'Free quota: 30'}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                        <Hash size={13} />
                                        <span>Organization ID</span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-1 font-mono">
                                        #{org.id}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate block">
                                        Created {formatDate(org.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Organization Members List */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Organization Users ({org.members?.length || 0})
                                </h4>
                                <span className="text-[11px] font-semibold text-slate-500">
                                    All users share the org plan
                                </span>
                            </div>

                            {(!org.members || org.members.length === 0) ? (
                                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium">
                                    No members registered in this workspace yet.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {org.members.map((member: AdminOrgMember) => {
                                        const memberInitial = (member.name?.trim()?.[0] || member.email?.[0] || '?').toUpperCase();
                                        const isOwner = member.id === org.owner_id || member.role === 'owner';
                                        return (
                                            <div
                                                key={member.id}
                                                className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {member.avatar_url ? (
                                                        <img
                                                            src={member.avatar_url}
                                                            alt={member.name}
                                                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                            {memberInitial}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-extrabold text-slate-900 truncate">
                                                                {member.name || 'Unnamed'}
                                                            </span>
                                                            {isOwner && (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-800">
                                                                    Owner
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 font-medium truncate block max-w-[180px] sm:max-w-[260px]">
                                                            {member.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0 text-right">
                                                    {member.is_email_verified ? (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            <CheckCircle2 size={11} /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                            <AlertCircle size={11} /> Pending
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyEmail(member.email)}
                                                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                                        title="Copy member email"
                                                    >
                                                        {copiedEmail === member.email ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center gap-3 flex-shrink-0">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleActionClick}
                            disabled={isToggling}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                                org.is_pro
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            }`}
                        >
                            {isToggling ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Updating Organization Tier...</span>
                                </>
                            ) : org.is_pro ? (
                                <>
                                    <ShieldAlert size={16} />
                                    <span>Revoke Pro Access from Org</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Give Pro Access to Org</span>
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
