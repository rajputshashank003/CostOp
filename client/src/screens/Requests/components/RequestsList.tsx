import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import map from "lodash/map";
import size from "lodash/size";
import RequestCard from "./RequestCard";

interface RequestsListProps {
    requests: any[];
    isLoading: boolean;
    activeTab: string;
    isAdmin: boolean;
    onApprove: (req: any) => void;
    onReject: (id: number) => void;
}

const RequestsList = ({ requests, isLoading, activeTab, isAdmin, onApprove, onReject }: RequestsListProps) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-3 mt-2">
                {map([1, 2, 3], i => (
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
        );
    }

    if (size(requests) === 0) {
        return (
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
        );
    }

    return (
        <AnimatePresence mode="popLayout">
            <div className="space-y-3">
                {map(requests, (req: any) => (
                    <RequestCard
                        key={req.id}
                        req={req}
                        isAdmin={isAdmin}
                        onApprove={onApprove}
                        onReject={onReject}
                    />
                ))}
            </div>
        </AnimatePresence>
    );
};

export default RequestsList;
