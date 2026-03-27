import React from "react";
import { PieChart } from "lucide-react";
import { motion } from "framer-motion";
import HistoryContext from "../context";
import map from "lodash/map";
import sumBy from "lodash/sumBy";
import size from "lodash/size";

interface DeptSpendData {
    department: string;
    spend: number;
}

export default function DepartmentSpendHistory() {
    const { deptSpendData: data, isLoadingDeptSpends: isLoading } = React.useContext(HistoryContext);

    const totalSpend = sumBy(data, 'spend') || 1;
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-4 sm:p-6 mb-8 mt-2 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-50">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <PieChart size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">All-Time Spend by Department</h2>
                        <p className="text-sm font-medium text-slate-500">Distribution across active and archived plans</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : size(data) === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 font-medium bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                    No department spend data recorded yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 relative z-10 pt-2 pb-2">
                    {map(data.slice(0, 10), (item: DeptSpendData, idx: number) => {
                        const percent = (item.spend / totalSpend) * 100;
                        return (
                            <div key={idx} className="flex flex-col gap-1.5 w-full">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="font-bold text-slate-700 truncate max-w-[60%]">{item.department}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-500">{formatter.format(item.spend)}</span>
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md w-10 text-right">
                                            {Math.round(percent)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1, delay: idx * 0.05, ease: "easeOut" }}
                                        className="bg-purple-500 h-full rounded-full"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="absolute right-0 top-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
}
