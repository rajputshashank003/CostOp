import { useContext, useState, useEffect } from "react";
import size from "lodash/size";
import map from "lodash/map";
import HomeContext from "./context";
import { AnimatePresence } from "framer-motion";
import useHome from "./useHome";
import { useUser } from "../../hooks/useUser";
import AddSubscriptionModal from "../../components/AddSubscriptionModal/AddSubscriptionModal";
import ArchiveConfirmationModal from "../../components/ArchiveConfirmationModal/ArchiveConfirmationModal";
import UpcomingRenewalsModal from "../../components/UpcomingRenewalsModal/UpcomingRenewalsModal";
import Sidebar from "../../components/Sidebar/Sidebar";
import HomeSkeleton from "../../components/Skeleton/HomeSkeleton";
import { categoriesApi } from "../../utils/api_request/categories";

import HomeHeader from "./components/HomeHeader";
import HomeEmptyState from "./components/HomeEmptyState";
import DashboardMetrics from "./components/DashboardMetrics";
import ActiveSubscriptions from "./components/ActiveSubscriptions";

const HomeComp = () => {
    const {
        subscriptions, isLoadingSubs, refreshSubscriptions, metrics, isLoadingMetrics,
        searchQuery, setSearchQuery, filterCategory, setFilterCategory, filterCycle, setFilterCycle,
        spendTimeframe, setSpendTimeframe, customStart, setCustomStart, customEnd, setCustomEnd,
        historicalSpendTotal, isLoadingHistorical
    } = useContext(HomeContext);
    const { user, logout, isLoading: isAuthLoading } = useUser();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [subToArchive, setSubToArchive] = useState<any>(null);
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

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <HomeHeader onAddClick={() => setIsAddModalOpen(true)} />

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {metrics?.active_subscriptions === 0 && !searchQuery && filterCategory === "All Categories" && filterCycle === "All Cycles" ? (
                        <HomeEmptyState onAddClick={() => setIsAddModalOpen(true)} />
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

                            <ActiveSubscriptions
                                localSearch={localSearch}
                                setLocalSearch={setLocalSearch}
                                availableCategories={availableCategories}
                                onSetArchive={(s) => setSubToArchive(s)}
                            />
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
