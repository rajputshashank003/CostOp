import { useState } from 'react';
import { CreditCard, Sparkles, Check, Users, FileText, Bell } from 'lucide-react';
import { OrganizationDetails } from '../../../utils/api_request/organization';
import UpgradeModal from '../../../components/UpgradeModal/UpgradeModal';

interface Props {
    orgDetails: OrganizationDetails | null;
    onUpgradeSuccess?: () => void;
}

export default function BillingCard({ orgDetails, onUpgradeSuccess }: Props) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isPro = orgDetails?.plan === 'pro';
    const activeMembers = orgDetails?.active_members_count ?? 1;
    const memberLimit = orgDetails?.member_limit ?? 30;
    const usagePercent = Math.min(100, Math.round((activeMembers / memberLimit) * 100));

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CreditCard size={20} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h2 className="text-lg font-bold text-slate-900">Plan & Billing</h2>
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black whitespace-nowrap uppercase tracking-wider ${
                                    isPro
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                            >
                                {isPro ? <><Sparkles size={11} /> PRO PLAN</> : 'FREE PLAN'}
                            </span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Manage workspace subscription, quotas, and payment details
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <a
                        href="/billing"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                        View Plans
                    </a>
                    {!isPro && (
                        <button
                            type="button"
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                            <Sparkles size={14} /> Upgrade to Pro
                        </button>
                    )}
                </div>
            </div>

            {/* Active Members Usage Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users size={14} className="text-slate-500" /> Active Team Members Quota
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                        {activeMembers} / {memberLimit} members ({usagePercent}%)
                    </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            usagePercent >= 90
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                    {isPro
                        ? 'Pro plan includes up to 100 active company members.'
                        : 'Free plan is limited to 30 active members. Upgrade to Pro for up to 100 members.'}
                </p>
            </div>

            {/* Plan Perks Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={15} className="text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Team Headcount</span>
                    </div>
                    <p className="text-xs text-slate-500">
                        {isPro ? '100 Active Seats' : '30 Active Seats'}
                    </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText size={15} className="text-teal-600" />
                        <span className="text-xs font-bold text-slate-800">Monthly Reports</span>
                    </div>
                    <p className="text-xs text-slate-500">
                        {isPro ? 'CSV & PDF Enabled' : 'Pro Feature (Locked)'}
                    </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                        <Bell size={15} className="text-purple-600" />
                        <span className="text-xs font-bold text-slate-800">Slack Alerts</span>
                    </div>
                    <p className="text-xs text-slate-500">
                        {isPro ? 'Webhook Connected' : 'Pro Feature (Locked)'}
                    </p>
                </div>
            </div>

            {/* Pro Payment Information */}
            {isPro && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <Check size={16} className="text-emerald-600" />
                        <span>Subscription active • Pro Plan (Billed via Razorpay)</span>
                    </div>
                    {orgDetails?.razorpay_payment_id && (
                        <span className="text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            ID: {orgDetails.razorpay_payment_id}
                        </span>
                    )}
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onUpgradeSuccess={onUpgradeSuccess}
            />
        </div>
    );
}
