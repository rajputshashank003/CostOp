import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, UserMinus, ChevronRight, Sparkles } from "lucide-react";
import { insightsApi } from "../../../utils/api_request/insights";
import DuplicateToolsModal from "../../../components/DuplicateToolsModal/DuplicateToolsModal";
import UnusedSeatsModal from "../../../components/UnusedSeatsModal/UnusedSeatsModal";
import { getLogoUrl } from "../../../services/logoService";

export default function CostInsights() {
    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [unusedSeats, setUnusedSeats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDuplicatesOpen, setIsDuplicatesOpen] = useState(false);
    const [isUnusedOpen, setIsUnusedOpen] = useState(false);

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const [dups, seats] = await Promise.all([
                    insightsApi.getDuplicates(),
                    insightsApi.getUnusedSeats(),
                ]);
                setDuplicates(Array.isArray(dups) ? dups : []);
                setUnusedSeats(Array.isArray(seats) ? seats : []);
            } catch {
                setDuplicates([]);
                setUnusedSeats([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, []);

    // Don't render the row if there are no insights at all
    if (!isLoading && duplicates.length === 0 && unusedSeats.length === 0) return null;

    const totalDupSavings = duplicates.reduce((acc: number, d: any) => {
        const perInstance = d.total_monthly_cost / d.team_count;
        return acc + perInstance * (d.team_count - 1);
    }, 0);
    const totalWaste = unusedSeats.reduce((acc: number, e: any) => acc + e.wasted_cost, 0);
    const totalUnused = unusedSeats.reduce((acc: number, e: any) => acc + e.unused_count, 0);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {/* Section header */}
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cost Insights</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Duplicate Tools Card */}
                    <div
                        onClick={() => duplicates.length > 0 && setIsDuplicatesOpen(true)}
                        className={`bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm group transition-all ${duplicates.length > 0 ? 'hover:border-emerald-300 hover:shadow-md cursor-pointer' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Layers size={18} />
                                </div>
                                <span className="text-[14px] font-bold text-slate-700">Duplicate Tools</span>
                            </div>
                            {duplicates.length > 0 ? (
                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                                    {duplicates.length} found
                                </span>
                            ) : (
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                    All clear ✨
                                </span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="h-16 flex items-center justify-center">
                                <span className="text-sm text-slate-400 font-medium">Analyzing...</span>
                            </div>
                        ) : duplicates.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-2 mb-3">
                                    {duplicates.slice(0, 2).map((d: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getLogoUrl(d.name as string) || undefined}
                                                    alt=""
                                                    className="w-5 h-5 rounded object-contain bg-white mix-blend-multiply"
                                                />
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-700">{d.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">{d.team_count} teams</p>
                                                </div>
                                            </div>
                                            <span className="text-[12px] font-bold text-rose-500">{formatter.format(d.total_monthly_cost)}/mo</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                        View All <ChevronRight size={13} />
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600">
                                        Save up to {formatter.format(totalDupSavings)}/mo
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-bold text-slate-500 flex items-center justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                                No duplicate tools detected
                            </div>
                        )}
                    </div>

                    {/* Unused Seats Card */}
                    <div
                        onClick={() => unusedSeats.length > 0 && setIsUnusedOpen(true)}
                        className={`bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm group transition-all ${unusedSeats.length > 0 ? 'hover:border-emerald-300 hover:shadow-md cursor-pointer' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <UserMinus size={18} />
                                </div>
                                <span className="text-[14px] font-bold text-slate-700">Unused Seats</span>
                            </div>
                            {unusedSeats.length > 0 ? (
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                    {totalUnused} wasted
                                </span>
                            ) : (
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                    All assigned ✨
                                </span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="h-16 flex items-center justify-center">
                                <span className="text-sm text-slate-400 font-medium">Analyzing...</span>
                            </div>
                        ) : unusedSeats.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-2 mb-3">
                                    {unusedSeats.slice(0, 2).map((e: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getLogoUrl(e.name as string) || undefined}
                                                    alt=""
                                                    className="w-5 h-5 rounded object-contain bg-white mix-blend-multiply"
                                                />
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-700">{e.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">{e.assigned_count}/{e.seat_count} seats used</p>
                                                </div>
                                            </div>
                                            <span className="text-[12px] font-bold text-rose-500">{formatter.format(e.wasted_cost)}/mo</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Review Seats <ChevronRight size={13} />
                                    </span>
                                    <span className="text-xs font-bold text-rose-500">
                                        Wasting {formatter.format(totalWaste)}/mo
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-bold text-slate-500 flex items-center justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                                All seats are assigned
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {isDuplicatesOpen && (
                    <DuplicateToolsModal
                        duplicates={duplicates}
                        onClose={() => setIsDuplicatesOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isUnusedOpen && (
                    <UnusedSeatsModal
                        entries={unusedSeats}
                        onClose={() => setIsUnusedOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
