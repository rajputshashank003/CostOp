import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, CreditCard as CreditCardIcon, CalendarClock } from "lucide-react";
import map from "lodash/map";
import slice from "lodash/slice";
import size from "lodash/size";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";
import MonthPicker from "../../../components/MonthPicker/MonthPicker";
import SmallRenewalItem from "./SmallRenewalItem";
import { useContext } from "react";
import HomeContext from "../context";

interface Props {
    spendTimeframe: number | "current" | "custom";
    setSpendTimeframe: (val: number | "current" | "custom") => void;
    customStart: string;
    setCustomStart: (val: string) => void;
    customEnd: string;
    setCustomEnd: (val: string) => void;
    historicalSpendTotal: number;
    isLoadingHistorical: boolean;
    formatter: Intl.NumberFormat;
    onOpenRenewals: () => void;
}

export default function DashboardMetrics({
    spendTimeframe, setSpendTimeframe, customStart, setCustomStart, customEnd, setCustomEnd,
    historicalSpendTotal, isLoadingHistorical, formatter, onOpenRenewals
}: Props) {
    const { metrics, isLoadingMetrics } = useContext(HomeContext);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
            {/* Widget 1: Total Monthly Spend */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative group hover:border-emerald-200 transition-colors h-full min-h-[180px]">
                <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none z-0">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="relative z-20 flex justify-between items-start">
                    <div>
                        <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                            <TrendingDown size={16} className="text-emerald-500" />
                            {spendTimeframe === "current" ? "Current Monthly" : spendTimeframe === "custom" ? "Custom Range" : `Spend (Last ${spendTimeframe} M)`}
                        </p>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            {spendTimeframe === "current"
                                ? (isLoadingMetrics ? "..." : formatter.format(metrics?.total_monthly_spend || 0))
                                : (isLoadingHistorical ? "..." : formatter.format(historicalSpendTotal))}
                        </h2>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
                        <CreditCardIcon size={24} />
                    </div>
                </div>

                <div className="relative z-20 mt-6 pt-4 border-t border-slate-100/80 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <TimeframeDropdown
                            value={spendTimeframe}
                            onChange={(v) => setSpendTimeframe(v as number | "current" | "custom")}
                            options={[
                                { value: "current", label: "Current Snapshot" },
                                { value: 1, label: "Last 1 Month" },
                                { value: 3, label: "Last 3 Months" },
                                { value: 6, label: "Last 6 Months" },
                                { value: 12, label: "Last 12 Months" },
                                { value: "custom", label: "Custom Absolute Range" },
                            ]}
                        />
                    </div>

                    <AnimatePresence>
                        {spendTimeframe === "custom" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-2 shadow-inner"
                            >
                                <MonthPicker value={customStart} onChange={setCustomStart} placeholder="Start Date" maxDate={customEnd} />
                                <span className="text-emerald-700 font-extrabold text-[10px] uppercase">➜</span>
                                <MonthPicker value={customEnd} onChange={setCustomEnd} placeholder="End Date" minDate={customStart} align="right" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Widget 2: Upcoming Renewals (30 Days) */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="relative z-10 flex items-center justify-between mb-4">
                    <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2">
                        <CalendarClock size={16} className="text-blue-500" />
                        Upcoming Renewals
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md ml-1 border border-blue-100 shadow-sm leading-none">30 DAYS</span>
                    </p>
                </div>
                <div className="relative z-10">
                    {isLoadingMetrics ? (
                        <p className="text-slate-400 font-medium">Loading...</p>
                    ) : size(metrics?.upcoming_renewals) > 0 ? (
                        <div className="flex flex-col gap-3">
                            {map(slice(metrics.upcoming_renewals, 0, 2), (r: any) => (
                                <SmallRenewalItem key={r.id} r={r} formatter={formatter} />
                            ))}
                            {size(metrics.upcoming_renewals) > 2 && (
                                <button
                                    onClick={onOpenRenewals}
                                    className="text-[12px] font-semibold text-slate-400 hover:text-blue-600 transition-colors text-center mt-1 py-1 w-full cursor-pointer"
                                >
                                    + {size(metrics.upcoming_renewals) - 2} more renewals
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-500 font-bold text-sm tracking-tight flex items-center gap-2 justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                            No upcoming renewals this month! 🎉
                        </div>
                    )}
                </div>
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        </motion.div>
    );
}
