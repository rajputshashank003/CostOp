import map from "lodash/map";
import size from "lodash/size";
import SubscriptionCard from "../Home/components/SubscriptionCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useUser } from "../../hooks/useUser";
import { AnimatePresence, motion } from "framer-motion";
import HistorySkeleton from "../../components/Skeleton/HistorySkeleton";
import SpendsChart from "./components/SpendsChart";
import DepartmentSpendHistory from "./components/DepartmentSpendHistory";
import HistoryContext from "./context";
import useHistory from "./useHistory";
import HistoryHeader from "./components/HistoryHeader";
import HistoryToolbar from "./components/HistoryToolbar";
import { useContext, useState } from "react";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import toast from "react-hot-toast";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";

const HistoryComp = () => {
    const { user, isLoading: isAuthLoading } = useUser();
    const { archived, isLoading, isRefetching, refreshArchived } = useContext(HistoryContext);
    const [subToDelete, setSubToDelete] = useState<any>(null);
    const isAdmin = user?.is_admin ?? false;

    const handleRestore = async (sub: any) => {
        try {
            await subscriptionsApi.restore(sub.id);
            toast.success(`${sub.name} restored successfully`);
            refreshArchived();
        } catch (err: any) {
            toast.error(err?.error || "Failed to restore subscription");
        }
    };

    // Only show full-page skeleton on very first load; filter/search changes are silent
    if (isLoading || isAuthLoading) {
        return <HistorySkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <HistoryHeader />

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    {/* Widgets are always rendered; never affected by filter/search refetches */}
                    <SpendsChart />

                    <DepartmentSpendHistory />

                    <HistoryToolbar />

                    {/* Grid dims slightly during refetch instead of going white */}
                    <motion.div
                        animate={{ opacity: isRefetching ? 0.5 : 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        {size(archived) === 0 && !isRefetching ? (
                            <div className="h-full flex items-center justify-center text-slate-500 font-medium pb-20 pt-8">
                                No archived subscriptions found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                                <AnimatePresence>
                                    {map(archived, (sub: any) => {
                                        const canRestore = sub.next_billing_date ? new Date(sub.next_billing_date) > new Date() : false;
                                        return (
                                            <SubscriptionCard
                                                key={sub.id}
                                                sub={sub}
                                                onDeleteClick={isAdmin ? () => setSubToDelete(sub) : undefined}
                                                onRestoreClick={isAdmin ? () => handleRestore(sub) : undefined}
                                                canRestore={canRestore}
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            <AnimatePresence>
                {subToDelete && (
                    <DeleteConfirmationModal
                        subId={subToDelete.id}
                        subName={subToDelete.name}
                        onClose={() => setSubToDelete(null)}
                        onSuccess={() => { setSubToDelete(null); refreshArchived(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default function History() {
    const historyState = useHistory();

    return (
        <HistoryContext.Provider value={historyState}>
            <HistoryComp />
        </HistoryContext.Provider>
    );
}
