import { useContext, useState } from "react";
import { Plus, LayoutDashboard, Settings, LogOut, Receipt, TrendingDown, CalendarClock, CreditCard as CreditCardIcon } from "lucide-react";
import map from "lodash/map";
import slice from "lodash/slice";
import size from "lodash/size";
import HomeContext from "./context";
import { motion, AnimatePresence } from "framer-motion";
import useHome from "./useHome";
import { useUser } from "../../hooks/useUser";
import AddSubscriptionModal from "../../components/AddSubscriptionModal/AddSubscriptionModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import SubscriptionCard from "./components/SubscriptionCard";
import UpcomingRenewalsModal from "../../components/UpcomingRenewalsModal/UpcomingRenewalsModal";
import Sidebar from "../../components/Sidebar/Sidebar";
import MobileNav from "../../components/MobileNav/MobileNav";
import SmallRenewalItem from "./components/SmallRenewalItem";


const HomeComp = () => {
    const { subscriptions, isLoadingSubs, refreshSubscriptions, metrics, isLoadingMetrics } = useContext(HomeContext);
    const { user, logout, isLoading: isAuthLoading } = useUser();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [subToDelete, setSubToDelete] = useState<any>(null);
    const [isRenewalsModalOpen, setIsRenewalsModalOpen] = useState(false);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        refreshSubscriptions();
    };

    if (isLoadingSubs || isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f0f5]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3 relative z-[60]">
                        <MobileNav />
                        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-sm text-sm cursor-pointer"
                        >
                            <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}><Plus size={18} /></motion.div>
                            <span className="hidden sm:inline">Add Subscription</span>
                            <span className="sm:hidden">Add</span>
                        </motion.button>

                        {user && (
                            <div className="flex items-center gap-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-[13px] text-slate-500 truncate max-w-[120px] lg:max-w-none">{user.email}</p>
                                </div>
                                <img
                                    src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U")}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border border-slate-200"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random`;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </header>

                {/* Dashboard Area - Scrollable */}
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {size(subscriptions) === 0 ? (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center mt-[-40px]"
                        >
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                                <Receipt size={36} className="text-emerald-500" />
                            </div>
                            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 mb-3 tracking-[-0.5px]">No subscriptions tracked</h2>
                            <p className="text-[14px] sm:text-[15px] text-slate-600 mb-8 leading-[1.6] px-4">
                                Gain visibility into your software spend immediately. Add your first tool to completely track upcoming costs and renewals.
                            </p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200 cursor-pointer"
                            >
                                <Plus size={22} />
                                Track First Subscription
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-6 sm:gap-8 pb-12">
                            {/* Metrics Row */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                            >
                                {/* Widget 1: Total Monthly Spend */}
                                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-200 transition-colors">
                                    <div className="relative z-10">
                                        <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2 mb-2">
                                            <TrendingDown size={16} className="text-emerald-500" />
                                            Total Monthly Spend
                                        </p>
                                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                            {isLoadingMetrics ? "..." : formatter.format(metrics?.total_monthly_spend || 0)}
                                        </h2>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center relative z-10 shadow-inner">
                                        <CreditCardIcon size={28} />
                                    </div>
                                    {/* Abstract BG Pattern */}
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Widget 2: Upcoming Renewals (30 Days) */}
                                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                    <div className="relative z-10 flex items-center justify-between mb-4">
                                        <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2">
                                            <CalendarClock size={16} className="text-blue-500" />
                                            Upcoming Renewals
                                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md ml-1 border border-blue-100 shadow-sm leading-none">30 DAYS</span>
                                        </p>
                                    </div>
                                    <div className="relative z-10">
                                        {isLoadingMetrics ? (
                                            <p className="text-slate-400 font-medium">Loading...</p>
                                        ) : size(metrics?.upcoming_renewals) > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {map(slice(metrics.upcoming_renewals, 0, 2), (r: any) => (
                                                    <SmallRenewalItem key={r.id} r={r} formatter={formatter} />
                                                ))}
                                                {size(metrics.upcoming_renewals) > 2 && (
                                                    <button
                                                        onClick={() => setIsRenewalsModalOpen(true)}
                                                        className="text-[12px] font-semibold text-slate-400 hover:text-blue-600 transition-colors text-center mt-1 py-1 w-full cursor-pointer"
                                                    >
                                                        + {size(metrics.upcoming_renewals) - 2} more renewals
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-slate-500 font-bold text-sm tracking-tight flex items-center gap-2 justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                                                No upcoming renewals this month! 🎉
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            </motion.div>

                            {/* Grid */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                                    Active Subscriptions
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{size(subscriptions)}</span>
                                </h3>
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0 },
                                        show: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1 }
                                        }
                                    }}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                                >
                                    <AnimatePresence>
                                        {map(subscriptions, (sub: any) => (
                                            <SubscriptionCard key={sub.id} sub={sub} onDeleteClick={(s) => setSubToDelete(s)} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Overlay Component */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <AddSubscriptionModal
                        onClose={() => setIsAddModalOpen(false)}
                        onSuccess={handleAddSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {subToDelete && (
                    <DeleteConfirmationModal
                        subId={subToDelete.id}
                        subName={subToDelete.name}
                        onClose={() => setSubToDelete(null)}
                        onSuccess={() => { setSubToDelete(null); refreshSubscriptions(); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRenewalsModalOpen && metrics?.upcoming_renewals && (
                    <UpcomingRenewalsModal
                        renewals={metrics.upcoming_renewals}
                        onClose={() => setIsRenewalsModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const Home = () => {
    const value = useHome();
    return (
        <HomeContext.Provider value={value}>
            <HomeComp />
        </HomeContext.Provider>
    );
};

export default Home;
