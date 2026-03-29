import { useEffect } from "react";
import { X, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getLogoUrl } from "../../services/logoService";

interface DuplicateGroup {
    name: string;
    category: string;
    team_count: number;
    team_names: string[];
    total_monthly_cost: number;
    subscription_ids: number[];
}

interface Props {
    duplicates: DuplicateGroup[];
    onClose: () => void;
}

export default function DuplicateToolsModal({ duplicates, onClose }: Props) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const navigate = useNavigate();
    const totalSavings = duplicates.reduce((acc, d) => {
        // Savings = cost of all but one instance (keep the cheapest, dedup the rest)
        const perInstance = d.total_monthly_cost / d.team_count;
        return acc + perInstance * (d.team_count - 1);
    }, 0);

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
                            <Layers size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Duplicate Tools</h2>
                            <p className="text-[13px] font-medium text-slate-500">
                                Tools found across multiple teams
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
                        {duplicates.map((dup, idx) => {
                            const perInstance = dup.total_monthly_cost / dup.team_count;
                            const saveable = perInstance * (dup.team_count - 1);
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={getLogoUrl(dup.name as string) || undefined}
                                                alt=""
                                                className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 mt-0.5"
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">{dup.name}</h3>
                                                {dup.category && (
                                                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                        {dup.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-800">{formatter.format(dup.total_monthly_cost)}<span className="text-slate-400 font-medium text-xs">/mo</span></p>
                                            <p className="text-xs font-semibold text-rose-500 mt-0.5">Save {formatter.format(saveable)}/mo</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 ml-11">
                                        {dup.team_names.map((team, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { onClose(); navigate(`/subscription/${dup.subscription_ids[i]}`); }}
                                                className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[11px] font-semibold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-transparent transition-colors cursor-pointer"
                                            >
                                                {team}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                {totalSavings > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600">Potential Savings</span>
                        <span className="text-lg font-extrabold text-emerald-600">{formatter.format(totalSavings)}<span className="text-sm font-medium text-slate-400">/mo</span></span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
