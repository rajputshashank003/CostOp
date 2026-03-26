import { useContext } from "react";
import { Inbox, CheckCircle2, XCircle, Clock, DollarSign, Package, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import map from "lodash/map";
import size from "lodash/size";
import RequestsContext from "./context";
import useRequests from "./useRequests";
import { useUser } from "../../hooks/useUser";
import Sidebar from "../../components/Sidebar/Sidebar";
import MobileNav from "../../components/MobileNav/MobileNav";
import { getCategoryIcon } from "../../utils/helpers";

const STATUS_TABS = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle2 },
    { key: "rejected", label: "Rejected", icon: XCircle },
] as const;

function RequestCard({ req, isAdmin, onApprove, onReject }: any) {
    const statusStyles: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-600 border-red-200",
    };
    const statusDot: Record<string, string> = {
        pending: "bg-amber-400",
        approved: "bg-emerald-500",
        rejected: "bg-red-500",
    };

    return (
        <motion.div
            layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100/60">
                        {getCategoryIcon(req.category, 18)}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-[15px] truncate">{req.name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                            {req.category || "Uncategorized"} · {req.billing_cycle || "—"} · {req.scope}
                        </p>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${statusStyles[req.status] || ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[req.status] || "bg-slate-400"}`} />
                    {req.status}
                </span>
            </div>

            <div className={`mt-4 grid gap-3 ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                        <DollarSign size={10} /> Cost
                    </p>
                    <p className="font-bold text-slate-800 text-sm">${req.cost?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Seats</p>
                    <p className="font-bold text-slate-800 text-sm">{req.seat_count || 1}</p>
                </div>
                {isAdmin && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Requested By</p>
                        <p className="font-bold text-slate-800 text-sm truncate">{req.requester_name || "—"}</p>
                    </div>
                )}
            </div>

            {req.justification && (
                <p className="mt-3 text-[13px] text-slate-600 bg-slate-50 rounded-xl px-4 py-3 italic border border-slate-100">
                    "{req.justification}"
                </p>
            )}

            {isAdmin && req.status === "pending" && (
                <div className="flex gap-2 mt-4 justify-end">
                    <button
                        onClick={() => onReject(req.id)}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => onApprove(req)}
                        className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer border border-emerald-600"
                    >
                        Approve & Configure
                    </button>
                </div>
            )}

            {req.reviewer_name && req.status !== "pending" && (
                <p className="text-[11px] text-slate-400 mt-3 text-right">
                    Reviewed by <span className="font-bold text-slate-600">{req.reviewer_name}</span>
                </p>
            )}
        </motion.div>
    );
}

function RequestsComp() {
    const { user } = useUser();
    const navigate = useNavigate();
    const {
        requests, isLoading, activeTab, setActiveTab,
        handleApprove, handleReject,
    } = useContext(RequestsContext);

    const isAdmin = user?.is_admin;

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3 relative z-[60]">
                        <MobileNav />
                        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Subscription Requests</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Status Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-2 sm:px-4 py-1.5 min-w-[60px] sm:min-w-[90px] text-[11px] sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Request Subscription button — for non-admins */}
                        {!isAdmin && (
                            <button
                                onClick={() => navigate("/add-subscription", { state: { mode: "request" } })}
                                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] sm:text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                            >
                                <Plus size={15} />
                                <span className="hidden sm:inline">Request Subscription</span>
                                <span className="sm:hidden">Request</span>
                            </button>
                        )}

                        {/* Avatar */}
                        {user && (
                            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-3">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-[12px] text-slate-500 truncate max-w-[120px]">{user.email}</p>
                                </div>
                                <img
                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}`}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full border border-slate-200 flex-shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random`;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {isLoading ? (
                            <div className="space-y-3 mt-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                                        <div className="flex gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-slate-100" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-100 rounded w-1/3" />
                                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : size(requests) === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <Inbox size={28} className="opacity-50" />
                                </div>
                                <p className="font-bold text-slate-600 text-base">No {activeTab} requests</p>
                                {!isAdmin && (
                                    <button
                                        onClick={() => navigate("/add-subscription", { state: { mode: "request" } })}
                                        className="flex items-center gap-2 mt-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                    >
                                        <Plus size={16} /> Request a Subscription
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                <div className="space-y-3">
                                    {map(requests, (req: any) => (
                                        <RequestCard
                                            key={req.id}
                                            req={req}
                                            isAdmin={isAdmin}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
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
