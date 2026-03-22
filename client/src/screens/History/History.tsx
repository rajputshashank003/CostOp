import map from "lodash/map";
import size from "lodash/size";
import SubscriptionCard from "../Home/components/SubscriptionCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useUser } from "../../hooks/useUser";
import { AnimatePresence } from "framer-motion";
import HistorySkeleton from "../../components/Skeleton/HistorySkeleton";
import SpendsChart from "./components/SpendsChart";
import HistoryContext from "./context";
import useHistory from "./useHistory";
import HistoryHeader from "./components/HistoryHeader";
import HistoryToolbar from "./components/HistoryToolbar";
import { useContext } from "react";

const HistoryComp = () => {
    const { isLoading: isAuthLoading } = useUser();
    const { archived, isLoading } = useContext(HistoryContext);

    if (isLoading || isAuthLoading) {
        return <HistorySkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <HistoryHeader />

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    <SpendsChart />

                    <HistoryToolbar />

                    {size(archived) === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 font-medium pb-20">
                            No archived subscriptions found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                            <AnimatePresence>
                                {map(archived, (sub: any) => (
                                    <SubscriptionCard key={sub.id} sub={sub} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
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
