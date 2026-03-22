import { useContext, useState, useEffect } from "react";
import { Plus, LayoutDashboard, Settings, LogOut, Receipt, TrendingDown, CalendarClock, CreditCard as CreditCardIcon, Clock, Search } from "lucide-react";
import map from "lodash/map";
import slice from "lodash/slice";
import size from "lodash/size";
import reduce from "lodash/reduce";
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
import MonthPicker from "../../components/MonthPicker/MonthPicker";
import TimeframeDropdown from "../../components/TimeframeDropdown/TimeframeDropdown";
import HomeSkeleton from "../../components/Skeleton/HomeSkeleton";
import { historyApi } from "../../utils/api_request/history";
import { categoriesApi } from "../../utils/api_request/categories";


const HomeComp = () => {
    const {
        subscriptions, isLoadingSubs, refreshSubscriptions, metrics, isLoadingMetrics,
        searchQuery, setSearchQuery, filterCategory, setFilterCategory, filterCycle, setFilterCycle
    } = useContext(HomeContext);
    const { user, logout, isLoading: isAuthLoading } = useUser();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [subToDelete, setSubToDelete] = useState<any>(null);
    const [isRenewalsModalOpen, setIsRenewalsModalOpen] = useState(false);

    // Active List Filters State
    const [localSearch, setLocalSearch] = useState("");
    const [availableCategories, setAvailableCategories] = useState<any[]>([{ value: "All Categories", label: "All Categories" }]);

    useEffect(() => {
        categoriesApi.get_all().then((res: any) => {
            const mapped = map((res || []), (c: any) => ({ value: c.name, label: c.name }));
            setAvailableCategories([{ value: "All Categories", label: "All Categories" }, ...mapped]);
        }).catch(console.error);
    }, []);

    // Debounce the physical search input text back up linearly into the React Context triggers
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 400);
        return () => clearTimeout(handler);
    }, [localSearch, setSearchQuery]);

    // Dynamic Tracking State
    const [spendTimeframe, setSpendTimeframe] = useState<number | "current" | "custom">("current");
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const [historicalSpendTotal, setHistoricalSpendTotal] = useState<number>(0);
    const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

    useEffect(() => {
        if (spendTimeframe === "current") return;
        if (spendTimeframe === "custom" && !customStart && !customEnd) return;

        setIsLoadingHistorical(true);
        historyApi.get_spends(spendTimeframe, customStart, customEnd)
            .then((res: any) => {
                const total = reduce((res || []), (acc: number, curr: any) => acc + curr.spend, 0);
                setHistoricalSpendTotal(total);
            })
            .catch((err: any) => console.error(err))
            .finally(() => setIsLoadingHistorical(false));
    }, [spendTimeframe, customStart, customEnd]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        refreshSubscriptions();
    };

    if (isLoadingSubs || isAuthLoading) {
        return <HomeSkeleton />;
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
                                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative group hover:border-emerald-200 transition-colors h-full min-h-[180px]">
                                    {/* Abstract BG Pattern */}
                                    <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none z-0">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    <div className="relative z-20 flex justify-between items-start">
                                        <div>
                                            <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                                                <TrendingDown size={16} className="text-emerald-500" />
                                                {spendTimeframe === "current" ? "Current Monthly" : spendTimeframe === "custom" ? "Custom Range" : `Spend (Last ${spendTimeframe} M)`}
                                            </p>
                                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                                {spendTimeframe === "current"
                                                    ? (isLoadingMetrics ? "..." : formatter.format(metrics?.total_monthly_spend || 0))
                                                    : (isLoadingHistorical ? "..." : formatter.format(historicalSpendTotal))}
                                            </h2>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
                                            <CreditCardIcon size={24} />
                                        </div>
                                    </div>

                                    {/* Action Bar Footer Component */}
                                    <div className="relative z-20 mt-6 pt-4 border-t border-slate-100/80 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <TimeframeDropdown
                                                value={spendTimeframe}
                                                onChange={(v) => setSpendTimeframe(v as number | "current" | "custom")}
                                                options={[
                                                    { value: "current", label: "Current Snapshot" },
                                                    { value: 1, label: "Last 1 Month" },
                                                    { value: 3, label: "Last 3 Months" },
                                                    { value: 6, label: "Last 6 Months" },
                                                    { value: 12, label: "Last 12 Months" },
                                                    { value: "custom", label: "Custom Absolute Range" },
                                                ]}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {spendTimeframe === "custom" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-2 shadow-inner"
                                                >
                                                    <MonthPicker value={customStart} onChange={setCustomStart} placeholder="Start Date" />
                                                    <span className="text-emerald-700 font-extrabold text-[10px] uppercase">➜</span>
                                                    <MonthPicker value={customEnd} onChange={setCustomEnd} placeholder="End Date" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

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
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                        Active Subscriptions
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{size(subscriptions)}</span>
                                    </h3>

                                    {/* Backend-Driven Unified Filters */}
                                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
                                        <div className="relative w-full sm:w-[200px]">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search subscriptions..."
                                                value={localSearch}
                                                onChange={(e) => setLocalSearch(e.target.value)}
                                                className="w-full bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none hover:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <TimeframeDropdown
                                                value={filterCategory}
                                                onChange={(v) => setFilterCategory(v as string)}
                                                options={availableCategories}
                                            />
                                            <TimeframeDropdown
                                                value={filterCycle}
                                                onChange={(v) => setFilterCycle(v as string)}
                                                options={[
                                                    { value: "All Cycles", label: "All Cycles" },
                                                    { value: "Monthly", label: "Monthly" },
                                                    { value: "Yearly", label: "Yearly" }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                                    <AnimatePresence>
                                        {map(subscriptions, (sub: any) => (
                                            <SubscriptionCard key={sub.id} sub={sub} onDeleteClick={(s) => setSubToDelete(s)} />
                                        ))}
                                    </AnimatePresence>
                                </div>
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
