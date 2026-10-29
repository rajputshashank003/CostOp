import { useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Brain, ChevronRight } from "lucide-react";
import get from "lodash/get";
import slice from "lodash/slice";
import size from "lodash/size";
import reduce from "lodash/reduce";
import map from "lodash/map";
import HomeContext from "../context";
import AIInsightsModal from "./AIInsightsModal";
import { AI_TYPE_CONFIG, AI_DEFAULT_CONFIG } from "@/screens/Home/components/aiInsightsConfig";
import { useMoney } from "@/hooks/useMoney";

export default function AIInsightsCard() {
    const { formatter } = useMoney();
    const { aiInsights, isLoadingAI, isRefreshingAI, aiError, fetchAIInsights } = useContext(HomeContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const insights = aiInsights?.insights ?? [];
    const totalSavings = reduce(insights, (sum: number, i: any) => sum + i.estimated_monthly_savings, 0);
    const hasInsights = !isLoadingAI && !aiError && size(insights) > 0;

    return (
        <div
            onClick={() => hasInsights && setIsModalOpen(true)}
            className={`bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm group transition-all flex flex-col h-full ${hasInsights ? 'hover:border-emerald-300 hover:shadow-md cursor-pointer' : ''}`}
        >
            {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Brain size={18} className="text-white" />
                        </div>
                        <span className="text-[14px] font-bold text-slate-700">AI Insights</span>
                    </div>
                    {isLoadingAI ? (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                            Analyzing...
                        </span>
                    ) : hasInsights ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            {size(insights)} tips
                        </span>
                    ) : aiError ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); fetchAIInsights(); }}
                            className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    ) : (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            All optimized
                        </span>
                    )}
                </div>

                {/* Body */}
                {isLoadingAI ? (
                    <div className="flex flex-col gap-2">
                        <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                        <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                    </div>
                ) : hasInsights ? (
                    <>
                        <div className="flex flex-col gap-2 mb-3">
                            {map(slice(insights, 0, 2), (insight: any, i: number) => {
                                const cfg = get(AI_TYPE_CONFIG, insight.type, AI_DEFAULT_CONFIG);
                                const Icon = cfg.icon;
                                return (
                                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
                                                <Icon size={12} className="text-white" />
                                            </div>
                                            <p className="text-[13px] font-bold text-slate-700 truncate">{insight.title}</p>
                                        </div>
                                        <span className="text-[12px] font-bold text-emerald-600 flex-shrink-0 ml-2">
                                            {formatter.format(insight.estimated_monthly_savings)}/mo
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                View All <ChevronRight size={13} />
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                                Save up to {formatter.format(totalSavings)}/mo
                            </span>
                        </div>
                    </>
                ) : aiError ? (
                    <div className="text-sm font-bold text-slate-500 flex items-center justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                        Could not load AI insights
                    </div>
                ) : (
                    <div className="text-sm font-bold text-slate-500 flex items-center justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                        No savings found right now
                    </div>
                )}

            <AnimatePresence>
                {isModalOpen && hasInsights && (
                    <AIInsightsModal
                        insights={insights}
                        totalSavings={totalSavings}
                        onClose={() => setIsModalOpen(false)}
                        onRefresh={() => fetchAIInsights(true)}
                        isRefreshing={isRefreshingAI}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
