import { useContext } from "react";
import HomeContext from "./context";
import { AnimatePresence } from "framer-motion";
import useHome from "./useHome";
import ArchiveConfirmationModal from "../../components/ArchiveConfirmationModal/ArchiveConfirmationModal";
import UpcomingRenewalsModal from "../../components/UpcomingRenewalsModal/UpcomingRenewalsModal";
import Sidebar from "../../components/Sidebar/Sidebar";
import HomeSkeleton from "../../components/Skeleton/HomeSkeleton";
import HomeHeader from "./components/HomeHeader";
import HomeEmptyState from "./components/HomeEmptyState";
import DashboardMetrics from "./components/DashboardMetrics";
import ActiveSubscriptions from "./components/ActiveSubscriptions";
import { useNavigate } from "react-router-dom";

const HomeComp = () => {
    const {
        isInitialLoad,
        refreshSubscriptions,
        metrics,
        spendTimeframe,
        setSpendTimeframe,
        customStart,
        setCustomStart,
        customEnd,
        setCustomEnd,
        historicalSpendTotal,
        isLoadingHistorical,
        subToArchive,
        setSubToArchive,
        isRenewalsModalOpen,
        setIsRenewalsModalOpen,
        searchQuery,
        filterCategory,
        filterCycle,
        isAuthLoading,
    } = useContext(HomeContext);
    const navigate = useNavigate();

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    if (isInitialLoad || isAuthLoading) {
        return <HomeSkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <HomeHeader onAddClick={() => navigate('/add-subscription')} />

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {metrics?.active_subscriptions === 0 && !searchQuery && filterCategory === "All Categories" && filterCycle === "All Cycles" ? (
                        <HomeEmptyState onAddClick={() => navigate('/add-subscription')} />
                    ) : (
                        <div className="flex flex-col gap-6 sm:gap-8 pb-12">
                            <DashboardMetrics
                                spendTimeframe={spendTimeframe}
                                setSpendTimeframe={setSpendTimeframe}
                                customStart={customStart}
                                setCustomStart={setCustomStart}
                                customEnd={customEnd}
                                setCustomEnd={setCustomEnd}
                                historicalSpendTotal={historicalSpendTotal}
                                isLoadingHistorical={isLoadingHistorical}
                                formatter={formatter}
                                onOpenRenewals={() => setIsRenewalsModalOpen(true)}
                            />

                            <ActiveSubscriptions />
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {subToArchive && (
                    <ArchiveConfirmationModal
                        subId={subToArchive.id}
                        subName={subToArchive.name}
                        onClose={() => setSubToArchive(null)}
                        onSuccess={() => { setSubToArchive(null); refreshSubscriptions(); }}
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
