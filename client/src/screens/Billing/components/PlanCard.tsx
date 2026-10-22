import { useContext } from "react";
import BillingContext from "../context";
import { Check, X, Sparkles, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function PlanCards() {
    const { isPro, billingInterval, handleUpgrade, handleDirectTestUpgrade, isUpgrading } = useContext(BillingContext);

    const proPrice = billingInterval === "annual" ? "₹799" : "₹999";
    const proBillingPeriod = billingInterval === "annual" ? "per month, billed ₹9,588 annually (Save 20%)" : "per month, cancel anytime";

    return (
        <section aria-label="Subscription Plans Comparison" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 sm:mb-16">
            {/* Free Tier Card */}
            <div className={`bg-white rounded-[2rem] border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-xs ${
                !isPro ? "border-slate-300 ring-2 ring-slate-200/50" : "border-slate-200"
            }`}>
                <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                            Starter
                        </span>
                        {!isPro && (
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                                <Check size={14} className="text-slate-600" /> Current Plan
                            </span>
                        )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Free Plan</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">
                        Essential SaaS tracking and renewal reminders for early startups and small teams.
                    </p>

                    <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">₹0</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-500">free forever</span>
                    </div>

                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                        Included Features
                    </h4>

                    <ul className="space-y-3.5 mb-8">
                        <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span><strong>Up to 30 active members</strong> in workspace</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>SaaS inventory tracking & historical audit</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>Email renewal reminders (7, 2, 1 days)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>Subscription request & approval workflows</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-400 font-medium">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X size={13} strokeWidth={2.5} />
                            </span>
                            <span className="line-through">Monthly Executive Reports (CSV & PDF)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-400 font-medium">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X size={13} strokeWidth={2.5} />
                            </span>
                            <span className="line-through">Slack Webhook renewal alert channel</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-400 font-medium">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X size={13} strokeWidth={2.5} />
                            </span>
                            <span className="line-through">Extended 100-member headcount quota</span>
                        </li>
                    </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        disabled
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-extrabold text-sm flex items-center justify-center gap-2 cursor-default"
                    >
                        {!isPro ? "Current Active Plan" : "Included in Base Tier"}
                    </button>
                </div>
            </div>

            {/* Pro Tier Card - Highlighted */}
            <div className={`relative bg-white rounded-[2rem] border-2 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-xl ${
                isPro ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-emerald-500/10" : "border-emerald-600 ring-4 ring-emerald-500/15"
            }`}>
                {/* Most Popular Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30">
                        <Sparkles size={13} />
                        {isPro ? "YOUR ACTIVE TIER" : "RECOMMENDED BY FINOPS"}
                    </span>
                </div>

                <div>
                    <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Enterprise Ready
                        </span>
                        {isPro && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check size={14} className="text-emerald-600" /> Active
                            </span>
                        )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
                        Pro Workspace
                        <Zap size={20} className="text-emerald-600 fill-emerald-500" />
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">
                        For growing teams needing up to 100 seats, automated executive reports, and Slack alerts.
                    </p>

                    <div className="flex flex-col mb-6 pb-6 border-b border-slate-100">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{proPrice}</span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-500">
                                {billingInterval === "annual" ? "/ month" : "/ month"}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium mt-1">
                            {proBillingPeriod}
                        </span>
                    </div>

                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-4">
                        Everything in Free, plus:
                    </h4>

                    <ul className="space-y-3.5 mb-8">
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span><strong>Up to 100 active members</strong> (3.3x more seats)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span><strong>Monthly Executive Spend Reports</strong> (instant CSV & PDF)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span><strong>Slack Webhook Integration</strong> for company renewal channel</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>Multi-channel delivery (Slack + Email simultaneous alerts)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>Custom alert frequencies & department burn analysis</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>GST Invoices & automated Razorpay receipt generation</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Check size={13} strokeWidth={3} />
                            </span>
                            <span>Priority email & workspace FinOps support</span>
                        </li>
                    </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                    {isPro ? (
                        <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-sm flex items-center justify-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-600" />
                            Current Active Plan (Subscribed)
                        </div>
                    ) : (
                        <>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: 1.01 }}
                                onClick={handleUpgrade}
                                disabled={isUpgrading}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isUpgrading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Opening Razorpay Gateway...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Upgrade to Pro Now</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>

                            <button
                                type="button"
                                onClick={handleDirectTestUpgrade}
                                disabled={isUpgrading}
                                className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:underline transition-colors cursor-pointer text-center"
                            >
                                Or activate directly with 1-click test mode
                            </button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
