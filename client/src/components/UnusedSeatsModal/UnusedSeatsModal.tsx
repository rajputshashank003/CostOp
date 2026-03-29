import { useEffect } from "react";
import { X, UserMinus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getLogoUrl } from "../../services/logoService";

interface UnusedSeat {
    subscription_id: number;
    name: string;
    category: string;
    billing_cycle: string;
    cost: number;
    seat_count: number;
    assigned_count: number;
    unused_count: number;
    wasted_cost: number;
}

interface Props {
    entries: UnusedSeat[];
    onClose: () => void;
}

export default function UnusedSeatsModal({ entries, onClose }: Props) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const navigate = useNavigate();
    const totalWaste = entries.reduce((acc, e) => acc + e.wasted_cost, 0);
    const totalUnused = entries.reduce((acc, e) => acc + e.unused_count, 0);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <UserMinus size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Unused Seats</h2>
                            <p className="text-[13px] font-medium text-slate-500">
                                {totalUnused} seats paid but not assigned
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ rotate: 90 }}
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </motion.button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="flex flex-col gap-4">
                        {entries.map((entry, idx) => {
                            const usedPct = (entry.assigned_count / entry.seat_count) * 100;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm cursor-pointer hover:border-emerald-200 transition-colors"
                                    onClick={() => { onClose(); navigate(`/subscription/${entry.subscription_id}`); }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={getLogoUrl(entry.name as string) || undefined}
                                                alt=""
                                                className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 mt-0.5"
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">{entry.name}</h3>
                                                {entry.category && (
                                                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                        {entry.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-emerald-600">
                                                {entry.unused_count} unused seat{entry.unused_count > 1 ? "s" : ""}
                                            </p>
                                            <p className="text-xs font-bold text-rose-500 mt-0.5">
                                                Wasting {formatter.format(entry.wasted_cost)}/mo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Seat usage bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${usedPct}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                                                className={`h-full rounded-full ${usedPct < 50 ? 'bg-gradient-to-r from-rose-400 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                                            {entry.assigned_count}/{entry.seat_count} used
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                {totalWaste > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600">Total Wasted Spend</span>
                        <span className="text-lg font-extrabold text-rose-500">{formatter.format(totalWaste)}<span className="text-sm font-medium text-slate-400">/mo</span></span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
