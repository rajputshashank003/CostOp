import React, { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { historyApi } from "../../../utils/api_request/history";
import MonthPicker from "../../../components/MonthPicker/MonthPicker";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";
import map from "lodash/map";
import maxBy from "lodash/maxBy";

interface SpendData {
    month: string;
    spend: number;
}

export default function SpendsChart() {
    const [data, setData] = useState<SpendData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [months, setMonths] = useState<number | "custom">(6);
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");

    useEffect(() => {
        if (months === "custom" && !customStart && !customEnd) return;

        setIsLoading(true);
        historyApi.get_spends(months, customStart, customEnd)
            .then((res: any) => {
                setData(res || []);
            })
            .catch((err: any) => console.error(err))
            .finally(() => setIsLoading(false));
    }, [months, customStart, customEnd]);

    const maxSpend = maxBy(data, 'spend')?.spend || 1; // avoid div by 0

    // Format currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-4 sm:p-6 mb-8 mt-2 shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-50">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Historical Spends</h2>
                        <p className="text-sm font-medium text-slate-500">Track your SaaS burn rate over time</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <AnimatePresence>
                        {months === "custom" && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: "auto" }}
                                exit={{ opacity: 0, x: 20, width: 0 }}
                                className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-2 py-1.5 shadow-sm whitespace-nowrap"
                            >
                                <MonthPicker value={customStart} onChange={setCustomStart} placeholder="Start" align="right" />
                                <span className="text-emerald-600 font-extrabold text-[10px] uppercase mx-1 tracking-widest">TO</span>
                                <MonthPicker value={customEnd} onChange={setCustomEnd} placeholder="End" align="right" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TimeframeDropdown
                        value={months}
                        onChange={(v: any) => setMonths(v as number | "custom")}
                        options={[
                            { value: 3, label: "Last 3 Months" },
                            { value: 4, label: "Last 4 Months" },
                            { value: 5, label: "Last 5 Months" },
                            { value: 6, label: "Last 6 Months" },
                            { value: 8, label: "Last 8 Months" },
                            { value: 12, label: "Last 12 Months" },
                            { value: 24, label: "Last 24 Months" },
                            { value: "custom", label: "Custom Range" },
                        ]}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 font-medium">
                    No spends recorded for this period.
                </div>
            ) : (
                <div className="relative pt-6 pb-2">
                    {/* Y-Axis Labels & Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none z-0 text-[10px] font-semibold text-slate-400">
                        <div className="flex items-end w-full border-b border-slate-200 pb-1 h-0">
                            <span className="-translate-y-4 bg-white pr-2">{formatter.format(maxSpend)}</span>
                        </div>
                        <div className="flex items-end w-full border-b border-slate-200 pb-1 h-0">
                            <span className="-translate-y-4 bg-white pr-2">{formatter.format(maxSpend / 2)}</span>
                        </div>
                        <div className="flex items-end w-full border-b border-slate-200 pb-1 h-0">
                            <span className="-translate-y-4 bg-white pr-2">$0.00</span>
                        </div>
                    </div>

                    {/* Chart Data Area */}
                    <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 relative z-10 pl-14">
                        {map(data, (item: SpendData, i: number) => {
                            const heightPercent = maxSpend > 0 ? (item.spend / maxSpend) * 100 : 0;
                            const isCurrentMonth = i === data.length - 1;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50">
                                        {formatter.format(item.spend)}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                    </div>

                                    {/* Bar Wrapper */}
                                    <div className="w-full h-full flex items-end justify-center">
                                        <div
                                            className={`w-full max-w-[44px] transition-all duration-500 ease-out cursor-crosshair
                                                ${isCurrentMonth ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-slate-200 group-hover:bg-emerald-300'}
                                                ${heightPercent > 3 ? 'rounded-t-md' : 'rounded-t-sm'}
                                            `}
                                            style={{ height: `max(${heightPercent}%, 4px)` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex items-center justify-between gap-1 sm:gap-2 pl-14 mt-3">
                        {map(data, (item: SpendData, i: number) => {
                            const isCurrentMonth = i === data.length - 1;
                            return (
                                <div key={`label-${i}`} className={`flex-1 text-center text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis
                                    ${isCurrentMonth ? 'text-emerald-700' : 'text-slate-500'}
                                `}>
                                    {item.month.split(" ")[0]}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
