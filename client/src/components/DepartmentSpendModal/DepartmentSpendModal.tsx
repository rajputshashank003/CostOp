import { useEffect } from "react";
import { X, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import map from "lodash/map";
import sumBy from "lodash/sumBy";

interface DepartmentSpend {
    department: string;
    spend: number;
}

interface DepartmentSpendModalProps {
    departments: DepartmentSpend[];
    onClose: () => void;
}

export default function DepartmentSpendModal({ departments, onClose }: DepartmentSpendModalProps) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const totalSpend = sumBy(departments, "spend") || 1;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
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
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <PieChart size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Spend by Department</h2>
                            <p className="text-[13px] font-medium text-slate-500">All Categories</p>
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
                        {map(departments, (item: DepartmentSpend, idx: number) => {
                            const percent = (item.spend / totalSpend) * 100;
                            return (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-slate-800">{item.department}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-600">{formatter.format(item.spend)}</span>
                                            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
