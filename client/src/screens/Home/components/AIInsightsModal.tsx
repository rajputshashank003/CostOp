import { useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import get from "lodash/get";
import map from "lodash/map";
import LinkedDescription from "./LinkedDescription";
import { AI_TYPE_CONFIG, AI_DEFAULT_CONFIG } from "@/screens/Home/components/aiInsightsConfig";
import { useMoney } from "@/hooks/useMoney";

interface AIInsight {
    type: string;
    title: string;
    description: string;
    estimated_monthly_savings: number;
    confidence: string;
    action_label: string;
}

interface Props {
    insights: AIInsight[];
    totalSavings: number;
    onClose: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export default function AIInsightsModal({ insights, totalSavings, onClose, onRefresh, isRefreshing }: Props) {
    const { formatter } = useMoney();
    const navigate = useNavigate();

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
            onClick={(e) => {
                e.stopPropagation();
                if (e.target === e.currentTarget) onClose();
            }}
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Brain size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">AI Cost Insights</h2>
                            <p className="text-[13px] font-medium text-slate-500">Personalized savings powered by AI</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40"
                        >
                            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ rotate: 90 }}
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {isRefreshing ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <motion.div
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Brain size={22} className="text-white" />
                            </motion.div>
                            <p className="text-sm font-bold text-slate-700">Regenerating insights...</p>
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.div key={i} className="w-2 h-2 rounded-full bg-emerald-400"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {map(insights, (insight, idx) => {
                                const cfg = get(AI_TYPE_CONFIG, insight.type, AI_DEFAULT_CONFIG);
                                const Icon = cfg.icon;
                                const confidenceClass =
                                    insight.confidence === "high" ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                                        : insight.confidence === "medium" ? "text-amber-600 bg-amber-50 border border-amber-100"
                                            : "text-slate-500 bg-slate-50 border border-slate-200";

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Icon size={16} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-[15px] font-bold text-slate-800">{insight.title}</h3>
                                                    <span className="text-[15px] font-bold text-emerald-600 flex-shrink-0 ml-2">
                                                        {formatter.format(insight.estimated_monthly_savings)}<span className="text-slate-400 font-medium text-xs">/mo</span>
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mb-2 ${confidenceClass}`}>
                                                    {cfg.badge} &middot; {insight.confidence}
                                                </span>
                                                <p className="text-[14px] text-slate-600 leading-relaxed">
                                                    <LinkedDescription text={insight.description} onNavigate={(path) => { onClose(); navigate(path); }} />
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {totalSavings > 0 && !isRefreshing && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600">Total Potential Savings</span>
                        <span className="text-lg font-extrabold text-emerald-600">{formatter.format(totalSavings)}<span className="text-sm font-medium text-slate-400">/mo</span></span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
