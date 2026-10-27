import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import BillingContext from "./context";
import useBilling from "./useBilling";
import BillingHeader from "./components/BillingHeader";
import UsageMeter from "./components/UsageMeter";
import BillingIntervalToggle from "./components/BillingIntervalToggle";
import PlanCards from "./components/PlanCard";
import PlanComparisonTable from "./components/PlanComparisonTable";
import BillingFaq from "./components/BillingFaq";
import TrustBadges from "./components/TrustBadges";
import { ReceiptText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import BillingSkeleton from "../../components/Skeleton/BillingSkeleton";

const BillingContent = () => {
    const { isLoading, isFetching } = useContext(BillingContext);
    const navigate = useNavigate();

    if (isLoading || isFetching) {
        return <BillingSkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <BillingHeader />

                <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
                    {/* Hero Intro Header */}
                    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 pt-2 sm:pt-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 mb-3">
                            Simple & Transparent Pricing
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
                            Supercharge your SaaS Cost Optimization
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 font-medium">
                            Scale from early exploration on the Free tier to high-powered FinOps with 100 team seats, executive spend reports, and real-time Slack renewal alerts.
                        </p>
                    </div>

                    {/* Order History Quick Access Banner */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <ReceiptText size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Purchase Invoices & Orders</h4>
                                <p className="text-xs text-slate-500 font-medium">Looking for previous billing receipts or tax invoices? View all transaction details.</p>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate('/orders')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-end sm:self-center"
                        >
                            <span>View Orders</span>
                            <ArrowRight size={14} />
                        </motion.button>
                    </div>

                    {/* Current Plan & Headcount Usage Meter */}
                    <UsageMeter />

                    {/* Monthly vs Annual Toggle */}
                    <BillingIntervalToggle />

                    {/* Side-by-Side Free vs Pro Plan Cards */}
                    <PlanCards />

                    {/* Comprehensive Feature Breakdown Matrix */}
                    <PlanComparisonTable />

                    {/* Payment Security & Trust Badges */}
                    <TrustBadges />

                    {/* Frequently Asked Questions */}
                    <BillingFaq />

                    {/* Bottom CTA for Free users */}
                    <footer className="text-center pb-12 pt-4 border-t border-slate-200/80 text-xs text-slate-400 font-medium">
                        CostOp Technologies Inc. • Secured by Razorpay 256-bit SSL • All prices in INR (₹)
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default function Billing() {
    const value = useBilling();
    return (
        <BillingContext.Provider value={value}>
            <BillingContent />
        </BillingContext.Provider>
    );
}
