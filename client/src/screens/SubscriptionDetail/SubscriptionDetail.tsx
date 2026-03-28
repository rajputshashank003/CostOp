import React, { useContext } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import SubscriptionDetailContext from "./context";
import useSubscriptionDetail from "./useSubscriptionDetail";
import SubscriptionDetailHeader from "./components/SubscriptionDetailHeader";
import MetricsRow from "./components/MetricsRow";
import AssignedMembers from "./components/AssignedMembers";
import SubscriptionSidebar from "./components/SubscriptionSidebar";
import AccessManagement from "./components/AccessManagement";

const SubscriptionDetailComp = () => {
    const { data, isLoading } = useContext(SubscriptionDetailContext);

    if (isLoading || !data) {
        return (
            <div className="flex min-h-screen bg-[#f0f0f5]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <SubscriptionDetailHeader />
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <MetricsRow />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <AssignedMembers />
                            <SubscriptionSidebar />
                        </div>
                        <AccessManagement />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default function SubscriptionDetail() {
    const value = useSubscriptionDetail();
    return (
        <SubscriptionDetailContext.Provider value={value}>
            <SubscriptionDetailComp />
        </SubscriptionDetailContext.Provider>
    );
}
