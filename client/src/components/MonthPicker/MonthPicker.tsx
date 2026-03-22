import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import map from "lodash/map";

interface MonthPickerProps {
    value: string; // "YYYY-MM"
    onChange: (val: string) => void;
    placeholder?: string;
    align?: "left" | "right";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthPicker({ value, onChange, placeholder = "Select Month", align = "left" }: MonthPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Initialize view year to selected value year or current year natively
    const [viewYear, setViewYear] = useState(value ? parseInt(value.split("-")[0]) : new Date().getFullYear());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync view year if value organically changes globally
    useEffect(() => {
        if (value) {
            setViewYear(parseInt(value.split("-")[0]));
        }
    }, [value]);

    const handleMonthClick = (monthIndex: number) => {
        const formattedMonth = (monthIndex + 1).toString().padStart(2, "0");
        onChange(`${viewYear}-${formattedMonth}`);
        setIsOpen(false);
    };

    const getDisplayValue = () => {
        if (!value) return placeholder;
        const [y, m] = value.split("-");
        if (!y || !m) return placeholder;
        return `${MONTHS[parseInt(m) - 1]} ${y}`;
    };

    return (
        <div className="relative" ref={ref}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-white border text-slate-700 text-[12px] font-bold rounded-lg px-2.5 py-1.5 outline-none transition-all cursor-pointer w-[120px] sm:w-[130px] shadow-sm flex items-center justify-between group
                ${isOpen ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'}`}
            >
                <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
                <Calendar size={14} className={`transition-colors ml-1.5 flex-shrink-0 ${isOpen ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-[100] mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[220px] ${align === "right" ? "right-0" : "left-0"}`}
                    >
                        {/* Year Selector */}
                        <div className="flex items-center justify-between mb-3 bg-slate-50/80 rounded-lg p-1 border border-slate-100 shadow-inner">
                            <button onClick={() => setViewYear(y => y - 1)} className="p-1 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-slate-800 hover:shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="font-extrabold text-[13px] text-slate-700 tracking-wide">{viewYear}</span>
                            <button onClick={() => setViewYear(y => y + 1)} className="p-1 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-slate-800 hover:shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 gap-1.5">
                            {map(MONTHS, (m, idx) => {
                                const isSelected = value === `${viewYear}-${(idx + 1).toString().padStart(2, "0")}`;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => handleMonthClick(idx)}
                                        className={`py-1.5 text-[11px] font-bold rounded-lg transition-all
                                            ${isSelected
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-600'
                                                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100'
                                            }
                                        `}
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center px-1">
                            <button onClick={() => { onChange(""); setIsOpen(false); }} className="text-[10px] uppercase font-bold text-slate-400 hover:text-rose-500 transition-colors tracking-wider">Reset</button>
                            <button onClick={() => {
                                const now = new Date();
                                onChange(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`);
                                setIsOpen(false);
                            }} className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-700 transition-colors tracking-wider">Current Month</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
