import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import map from "lodash/map";
import sumBy from "lodash/sumBy";
import size from "lodash/size";
import { useContext } from "react";
import HomeContext from "../context";

interface Props {
    formatter: Intl.NumberFormat;
}

export default function DepartmentSpend({ formatter }: Props) {
    const { metrics, isLoadingMetrics } = useContext(HomeContext);
    const deptSpends = metrics?.department_spends || [];
    const totalSpend = sumBy(deptSpends, "spend") || 1;

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors h-full min-h-[180px] flex flex-col">
            <div className="relative z-10 flex items-center justify-between mb-4">
                <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2">
                    <PieChart size={16} className="text-purple-500" />
                    Spend by Department
                </p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
                {isLoadingMetrics ? (
                    <p className="text-slate-400 font-medium">Loading...</p>
                ) : size(deptSpends) > 0 ? (
                    <div className="flex flex-col gap-3">
                        {map(deptSpends.slice(0, 4), (item: any, idx: number) => {
                            const percent = (item.spend / totalSpend) * 100;
                            return (
                                <div key={idx} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span className="font-bold text-slate-700 truncate max-w-[60%]">{item.department}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-500">{formatter.format(item.spend)}</span>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md w-10 text-right">
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                                            className="bg-purple-500 h-full rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {size(deptSpends) > 4 && (
                            <p className="text-[11px] font-semibold text-slate-400 text-center mt-1">
                                + {size(deptSpends) - 4} more departments
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-slate-500 font-bold text-sm tracking-tight flex items-center justify-center h-16 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                        No team spend data yet!
                    </div>
                )}
            </div>

            <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
}
