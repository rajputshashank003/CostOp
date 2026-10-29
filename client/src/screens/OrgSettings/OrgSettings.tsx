import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import MobileNav from "../../components/MobileNav/MobileNav";
import NotificationBell from "../../components/Notifications/NotificationBell";
import { paymentApi, PricingInfo } from "../../utils/api_request/payment";
import { Sliders, ShieldCheck, Check, Sparkles, AlertCircle, RefreshCw, IndianRupee, Percent, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ManageUsersModal from "./components/ManageUsersModal";

export default function OrgSettings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showManageUsers, setShowManageUsers] = useState<boolean>(() => {
        return searchParams.get("tab") === "users" || searchParams.get("manageUsers") === "true";
    });
    const [pricing, setPricing] = useState<PricingInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form inputs
    const [monthlyPrice, setMonthlyPrice] = useState<string>("999");
    const [yearlyDiscount, setYearlyDiscount] = useState<string>("20");
    const [planName, setPlanName] = useState<string>("CostOp Pro");
    const [maxMembers, setMaxMembers] = useState<string>("100");

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        setIsLoading(true);
        try {
            const data = await paymentApi.get_pricing();
            setPricing(data);
            setMonthlyPrice(data.monthly_price.toString());
            setYearlyDiscount(data.yearly_discount_percent.toString());
            setPlanName(data.plan_name || "CostOp Pro");
            setMaxMembers(data.max_members ? data.max_members.toString() : "100");
        } catch (err: any) {
            console.error("Failed to load pricing settings:", err);
            toast.error(err?.response?.data?.error || "Failed to load plan pricing settings");
        } finally {
            setIsLoading(false);
        }
    };

    // Real-time live calculations based on current inputs
    const numMonthlyPrice = parseFloat(monthlyPrice) || 0;
    const numDiscount = Math.min(100, Math.max(0, parseFloat(yearlyDiscount) || 0));
    const numMaxMembers = parseInt(maxMembers, 10) || 100;

    const discountMultiplier = 1.0 - (numDiscount / 100.0);
    const liveYearlyMonthlyEq = Math.round(numMonthlyPrice * discountMultiplier * 100.0) / 100.0;
    const liveYearlyTotal = Math.round(liveYearlyMonthlyEq * 12.0 * 100.0) / 100.0;
    const liveTotalSavings = Math.round((numMonthlyPrice * 12.0 - liveYearlyTotal) * 100.0) / 100.0;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (numMonthlyPrice <= 0) {
            toast.error("Monthly price must be greater than zero");
            return;
        }

        if (numDiscount < 0 || numDiscount > 100) {
            toast.error("Yearly discount must be between 0% and 100%");
            return;
        }

        setIsSaving(true);
        try {
            const updated = await paymentApi.update_plan_settings({
                monthly_price: numMonthlyPrice,
                yearly_discount_percent: numDiscount,
                plan_name: planName.trim() || "CostOp Pro",
                max_members: numMaxMembers,
            });

            setPricing(updated);
            toast.success("Plan settings updated successfully! Live pricing is now active.", {
                duration: 4500,
            });
        } catch (err: any) {
            console.error("Failed to update plan settings:", err);
            toast.error(err?.response?.data?.error || "Failed to save plan settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* Header */}
                <header className="min-h-[62px] min-[1200px]:min-h-[76px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 min-[1200px]:px-8 py-2.5 sm:py-3 min-[1200px]:py-5 flex items-center justify-between sticky top-0 z-10 shadow-xs transition-all gap-2">
                    <div className="flex items-center gap-2.5 min-[1200px]:gap-4 min-w-0">
                        <MobileNav />
                        <div className="w-8 h-8 min-[1200px]:w-10 min-[1200px]:h-10 rounded-xl bg-emerald-50 text-emerald-600 hidden sm:flex items-center justify-center shadow-inner flex-shrink-0">
                            <Sliders size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <h1 className="text-sm sm:text-base min-[1200px]:text-[22px] font-extrabold text-slate-900 tracking-tight leading-none truncate">
                                    Org & Plan Settings
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex-shrink-0">
                                    <ShieldCheck size={11} className="sm:w-3 sm:h-3" />
                                    <span className="hidden min-[480px]:inline">Admin Only</span>
                                    <span className="min-[480px]:hidden">Admin</span>
                                </span>
                            </div>
                            <p className="text-[11px] min-[1200px]:text-[13px] font-semibold text-slate-500 hidden sm:block mt-0.5">
                                Configure production subscription plans and yearly discount rates
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => setShowManageUsers(true)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 transition-all cursor-pointer flex-shrink-0"
                            title="Manage all users and Pro tier access"
                        >
                            <Users size={15} />
                            <span className="hidden min-[480px]:inline">Manage Users</span>
                            <span className="min-[480px]:hidden">Users</span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            type="button"
                            onClick={loadPricing}
                            disabled={isLoading}
                            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Refresh pricing"
                        >
                            <RefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
                        </motion.button>
                        <NotificationBell />
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
                    {/* Admin Banner */}
                    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white rounded-[2rem] p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                        <div className="relative z-[1] max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
                                <Sparkles size={13} /> Website Administrator Panel
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                                Manage CostOp Pro Pricing & Yearly Discount
                            </h2>
                            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                                Settings configured here immediately control what customers are charged through Razorpay in production. Any updates will reflect live on the Billing page, Upgrade Modal, and automated receipt emails.
                            </p>
                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowManageUsers(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                                >
                                    <Users size={16} />
                                    <span>Manage Users & Pro Access</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
                            <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                    <div className="space-y-1.5">
                                        <div className="h-5 w-40 bg-slate-200 rounded" />
                                        <div className="h-3 w-56 bg-slate-100 rounded" />
                                    </div>
                                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                                </div>
                                {[1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="h-3 w-32 bg-slate-200 rounded" />
                                        <div className="h-11 w-full bg-slate-100 rounded-xl" />
                                    </div>
                                ))}
                                <div className="pt-4 flex justify-end">
                                    <div className="h-11 w-36 bg-slate-200 rounded-xl" />
                                </div>
                            </div>
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-4">
                                    <div className="h-4 w-40 bg-slate-200 rounded" />
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((idx) => (
                                            <div key={idx} className="flex justify-between py-2 border-b border-slate-100">
                                                <div className="h-3 w-28 bg-slate-100 rounded" />
                                                <div className="h-3 w-16 bg-slate-200 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex-shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3.5 w-36 bg-slate-200 rounded" />
                                        <div className="h-3 w-full bg-slate-100 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Form Settings (7 cols) */}
                            <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Plan Configuration</h3>
                                        <p className="text-xs text-slate-500 font-medium">Update pricing values for workspace subscriptions</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Active Plan
                                    </span>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    {/* Plan Name */}
                                    <div>
                                        <label htmlFor="plan-name" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                                            Plan Display Name
                                        </label>
                                        <input
                                            id="plan-name"
                                            type="text"
                                            value={planName}
                                            onChange={(e) => setPlanName(e.target.value)}
                                            placeholder="CostOp Pro"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Monthly Price */}
                                        <div>
                                            <label htmlFor="monthly-price" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                                                Monthly Plan Price (₹)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <IndianRupee size={16} />
                                                </div>
                                                <input
                                                    id="monthly-price"
                                                    type="number"
                                                    step="1"
                                                    min="1"
                                                    value={monthlyPrice}
                                                    onChange={(e) => setMonthlyPrice(e.target.value)}
                                                    placeholder="999"
                                                    required
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
                                                Standard monthly charge per workspace
                                            </span>
                                        </div>

                                        {/* Yearly Discount */}
                                        <div>
                                            <label htmlFor="yearly-discount" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                                                Discount on Yearly Plan (%)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <Percent size={15} />
                                                </div>
                                                <input
                                                    id="yearly-discount"
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    max="100"
                                                    value={yearlyDiscount}
                                                    onChange={(e) => setYearlyDiscount(e.target.value)}
                                                    placeholder="20"
                                                    required
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
                                                Discount applied when billed annually
                                            </span>
                                        </div>
                                    </div>

                                    {/* Max Members Quota */}
                                    <div>
                                        <label htmlFor="max-members" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                                            Included Team Member Quota
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Users size={16} />
                                            </div>
                                            <input
                                                id="max-members"
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={maxMembers}
                                                onChange={(e) => setMaxMembers(e.target.value)}
                                                placeholder="100"
                                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            />
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
                                            Maximum team members allowed in Pro workspace (default: 100)
                                        </span>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (pricing) {
                                                    setMonthlyPrice(pricing.monthly_price.toString());
                                                    setYearlyDiscount(pricing.yearly_discount_percent.toString());
                                                    setPlanName(pricing.plan_name || "CostOp Pro");
                                                    setMaxMembers(pricing.max_members?.toString() || "100");
                                                }
                                            }}
                                            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                                        >
                                            Reset to Saved
                                        </button>
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isSaving}
                                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Saving Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={16} />
                                                    <span>Save Plan Settings</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Column: Live Calculated Breakdown & Customer Experience Preview (5 cols) */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Live Financial Summary Card */}
                                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-7 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles size={16} className="text-emerald-600" />
                                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                                            Live Calculated Rates
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Monthly */}
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-slate-500 block">Monthly Rate</span>
                                                <span className="text-xl font-black text-slate-900">
                                                    ₹{numMonthlyPrice.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                                                Standard
                                            </span>
                                        </div>

                                        {/* Yearly Monthly Equivalent */}
                                        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-emerald-800 block">Annual Plan (Per Month)</span>
                                                <span className="text-2xl font-black text-emerald-900">
                                                    ₹{liveYearlyMonthlyEq.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                                                Save {numDiscount}%
                                            </span>
                                        </div>

                                        {/* Total Annual Charge */}
                                        <div className="p-4 rounded-2xl border border-slate-100 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Billed Annually:</span>
                                                <span className="font-extrabold text-slate-900">
                                                    ₹{liveYearlyTotal.toLocaleString('en-IN')} / year
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Total Customer Savings:</span>
                                                <span className="font-extrabold text-emerald-600">
                                                    ₹{liveTotalSavings.toLocaleString('en-IN')} saved
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer View Preview */}
                                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-7 shadow-sm">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                                        Customer Billing Preview
                                    </h4>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <div>
                                                <span className="text-2xl font-black text-slate-900">
                                                    ₹{numMonthlyPrice.toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium ml-1">/ month</span>
                                            </div>
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                                                Save {numDiscount}% on annual
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                            Billed annually at ₹{liveYearlyTotal.toLocaleString('en-IN')} (₹{liveYearlyMonthlyEq.toLocaleString('en-IN')}/mo) or ₹{numMonthlyPrice.toLocaleString('en-IN')}/mo billed monthly.
                                        </p>
                                    </div>
                                </div>

                                {/* Gateway Status */}
                                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-5 shadow-sm flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">Razorpay Production Gateway</h4>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                            Live checkout transactions use HMAC SHA-256 signature verification and automated GST invoicing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Manage Users Modal */}
                <ManageUsersModal
                    isOpen={showManageUsers}
                    onClose={() => {
                        setShowManageUsers(false);
                        if (searchParams.get("tab") === "users" || searchParams.get("manageUsers") === "true") {
                            searchParams.delete("tab");
                            searchParams.delete("manageUsers");
                            setSearchParams(searchParams, { replace: true });
                        }
                    }}
                />
            </main>
        </div>
    );
}
