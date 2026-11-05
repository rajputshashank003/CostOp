import { useContext } from "react";
import BillingContext from "../context";
import { Users, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function UsageMeter() {
    const { isPro, activeMembers, memberLimit, usagePercent, handleUpgrade, isUpgrading } = useContext(BillingContext);

    const isNearLimit = !isPro && activeMembers >= 25;
    const isAtLimit = !isPro && activeMembers >= memberLimit;

    return (
        <section aria-label="Current Plan & Usage" className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Users size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                                Current Workspace Plan
                            </h2>
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                    isPro
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                            >
                                {isPro ? (
                                    <>
                                        <Sparkles size={11} /> PRO WORKSPACE
                                    </>
                                ) : (
                                    "FREE PLAN"
                                )}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            {isPro
                                ? "Your workspace is enjoying all Pro capabilities with 100 seats and automated reporting."
                                : "Free tier is active. Upgrade anytime to unlock up to 100 team members and export tools."}
                        </p>
                    </div>
                </div>

                {!isPro && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 self-start sm:self-auto"
                    >
                        <Sparkles size={14} />
                        {isUpgrading ? "Starting Checkout..." : "Upgrade to Pro"}
                    </motion.button>
                )}
            </div>

            {/* Quota Progress Meter */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        Active Team Seats Quota
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                        {activeMembers} of {memberLimit} seats used ({usagePercent}%)
                    </span>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            isAtLimit
                                ? "bg-red-500"
                                : isNearLimit
                                ? "bg-amber-500"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500"
                        }`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 text-[11px] text-slate-500">
                    <span>
                        {isPro
                            ? "✅ 100 active member seats available. Pending invitations do not count against this quota."
                            : "💡 Free tier supports up to 30 active members. Pending invitations do not consume seats."}
                    </span>
                    {isNearLimit && !isPro && (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> Approaching 30-member seat limit
                        </span>
                    )}
                    {isPro && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Pro Quota Active
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}
