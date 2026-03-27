import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { getCategoryIcon } from "../../../utils/helpers";

interface RequestCardProps {
    req: any;
    isAdmin: boolean;
    onApprove: (req: any) => void;
    onReject: (id: number) => void;
}

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

const RequestCard = ({ req, isAdmin, onApprove, onReject }: RequestCardProps) => {
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
};

export default RequestCard;
