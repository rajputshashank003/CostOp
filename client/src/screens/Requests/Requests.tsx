import { useContext } from "react";
import { Inbox, CheckCircle2, XCircle, Clock, DollarSign, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import map from "lodash/map";
import size from "lodash/size";
import RequestsContext from "./context";
import useRequests from "./useRequests";
import { useUser } from "../../hooks/useUser";
import Sidebar from "../../components/Sidebar/Sidebar";
import MobileNav from "../../components/MobileNav/MobileNav";

const STATUS_TABS = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle2 },
    { key: "rejected", label: "Rejected", icon: XCircle },
] as const;

function RequestCard({ req, isAdmin, onApprove, onReject }: any) {
    const statusColor: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-600 border-red-200",
    };
    return (
        <motion.div
            layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                        <Package size={18} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-[15px]">{req.name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {req.category || "Uncategorized"} · {req.billing_cycle || "—"} · {req.scope}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${statusColor[req.status] || ""}`}>
                    {req.status}
                </span>
            </div>

            <div className={`mt-4 grid gap-3 ${isAdmin ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
                <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1">Cost</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                        <DollarSign size={13} />{req.cost?.toFixed(2) || "0.00"}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1">Seats</p>
                    <p className="font-bold text-slate-800">{req.seat_count || 1}</p>
                </div>
                {isAdmin && (
                    <div className="bg-slate-50 rounded-xl p-3 col-span-2 sm:col-span-1">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1">Requested By</p>
                        <p className="font-bold text-slate-800 truncate">{req.requester_name || "—"}</p>
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
                    <button onClick={() => onReject(req.id)} className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-all cursor-pointer">
                        Reject
                    </button>
                    <button onClick={() => onApprove(req.id)} className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer">
                        Approve
                    </button>
                </div>
            )}

            {req.reviewer_name && req.status !== "pending" && (
                <p className="text-[12px] text-slate-400 mt-3 text-right">
                    Reviewed by <span className="font-bold text-slate-600">{req.reviewer_name}</span>
                </p>
            )}
        </motion.div>
    );
}

function RequestsComp() {
    const { user } = useUser();
    const {
        requests, isLoading, activeTab, setActiveTab,
        form, setForm, isSubmitting, handleSubmit,
        handleApprove, handleReject,
    } = useContext(RequestsContext);

    const isAdmin = user?.is_admin;

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3 relative z-[60]">
                        <MobileNav />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Subscription Requests</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:block text-[13px] font-semibold text-slate-500">
                            {isAdmin ? "Team Admin" : "Team Member"}
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* Request Form — shown only to regular team members */}
                        {!isAdmin && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-5 sm:p-6"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Inbox size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Request a Subscription</h2>
                                        <p className="text-[13px] text-slate-500">Submit for admin approval</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            required placeholder="Tool name  (e.g. Figma)"
                                            value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                                            className="col-span-1 sm:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 text-sm font-medium"
                                        />
                                        <input
                                            placeholder="Category  (e.g. Design)"
                                            value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 text-sm font-medium"
                                        />
                                        <input
                                            type="number" placeholder="Cost (USD)" min="0" step="0.01"
                                            value={form.cost} onChange={e => setForm((f: any) => ({ ...f, cost: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 text-sm font-medium"
                                        />
                                        <select
                                            value={form.billing_cycle} onChange={e => setForm((f: any) => ({ ...f, billing_cycle: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-white"
                                        >
                                            <option value="Monthly">Monthly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                        <select
                                            value={form.scope} onChange={e => setForm((f: any) => ({ ...f, scope: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-white"
                                        >
                                            <option value="team">Team</option>
                                            <option value="individual">Individual</option>
                                        </select>
                                        <input
                                            type="number" placeholder="Seats needed" min="1"
                                            value={form.seat_count} onChange={e => setForm((f: any) => ({ ...f, seat_count: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 text-sm font-medium"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Why does your team need this tool? (optional but helpful)"
                                        value={form.justification} onChange={e => setForm((f: any) => ({ ...f, justification: e.target.value }))}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 text-sm font-medium resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={isSubmitting}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                                            Submit Request
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Tabs + List */}
                        <div>
                            <div className="flex gap-2 mb-4">
                                {STATUS_TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer ${activeTab === tab.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center h-32 text-slate-400 font-semibold">Loading...</div>
                            ) : size(requests) === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                                    <Inbox size={32} className="opacity-40" />
                                    <p className="font-semibold">No {activeTab} requests</p>
                                </div>
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
