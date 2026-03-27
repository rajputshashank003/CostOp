import { useContext } from "react";
import RequestsContext from "./context";
import useRequests from "./useRequests";
import { useUser } from "../../hooks/useUser";
import Sidebar from "../../components/Sidebar/Sidebar";
import RequestsHeader from "./components/RequestsHeader";
import RequestsList from "./components/RequestsList";

function RequestsComp() {
    const { user } = useUser();
    const {
        requests,
        isLoading,
        activeTab,
        setActiveTab,
        handleApprove,
        handleReject,
    } = useContext(RequestsContext);

    const isAdmin = !!user?.is_admin;

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <RequestsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <RequestsList
                            requests={requests}
                            isLoading={isLoading}
                            activeTab={activeTab}
                            isAdmin={isAdmin}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function Requests() {
    const value = useRequests();
    return (
        <RequestsContext.Provider value={value}>
            <RequestsComp />
        </RequestsContext.Provider>
    );
}
