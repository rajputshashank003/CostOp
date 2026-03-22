import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import map from "lodash/map";
import split from "lodash/split";

interface DatePickerProps {
    value: string; // "YYYY-MM-DD" or ""
    onChange: (val: string) => void;
    placeholder?: string;
    align?: "left" | "right" | "top";
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({ value, onChange, placeholder = "Select Date", align = "left" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial cleanly to avoid timezone offsets automatically mutating the local day
    let initYear = new Date().getFullYear();
    let initMonth = new Date().getMonth();

    if (value) {
        const parts = split(value, "-");
        if (parts.length === 3) {
            initYear = parseInt(parts[0], 10);
            initMonth = parseInt(parts[1], 10) - 1;
        }
    }

    const [viewYear, setViewYear] = useState(initYear);
    const [viewMonth, setViewMonth] = useState(initMonth);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            const parts = split(value, "-");
            if (parts.length === 3) {
                setViewYear(parseInt(parts[0], 10));
                setViewMonth(parseInt(parts[1], 10) - 1);
            }
        }
    }, [value]);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handleDayClick = (day: number) => {
        const m = (viewMonth + 1).toString().padStart(2, "0");
        const d = day.toString().padStart(2, "0");
        onChange(`${viewYear}-${m}-${d}`);
        setIsOpen(false);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDisplayValue = () => {
        if (!value) return placeholder;
        const parts = split(value, "-");
        if (parts.length !== 3) return placeholder;
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${SHORT_MONTHS[mIdx]} ${parts[2]}, ${parts[0]}`;
    };

    const positioningClass = align === "top"
        ? "bottom-full mb-1.5 left-0"
        : align === "right"
            ? "mt-1.5 right-0"
            : "mt-1.5 left-0";

    return (
        <div className="relative" ref={ref}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full bg-white border text-slate-700 text-[13px] font-semibold rounded-xl px-3.5 py-2.5 outline-none transition-all cursor-pointer shadow-sm group
                ${isOpen ? 'border-emerald-400 ring-4 ring-emerald-500/10' : 'border-slate-200 hover:border-emerald-300'}`}
            >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Calendar size={16} className={`flex-shrink-0 transition-colors ${isOpen ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                    <span className="truncate">{getDisplayValue()}</span>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: align === "top" ? 5 : -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: align === "top" ? 5 : -5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-[100] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-[260px] ${positioningClass}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 bg-slate-50/80 rounded-lg p-1 border border-slate-100 shadow-inner">
                            <button onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-slate-800 hover:shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="font-extrabold text-[13px] text-slate-700 tracking-wide">{MONTHS[viewMonth]} {viewYear}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-slate-800 hover:shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {map(DAYS, (d) => (
                                <div key={d} className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {map(emptyDays, (i) => (
                                <div key={`empty-${i}`} className="h-8"></div>
                            ))}
                            {map(monthDays, (d) => {
                                const m = (viewMonth + 1).toString().padStart(2, "0");
                                const ds = d.toString().padStart(2, "0");
                                const thisDate = `${viewYear}-${m}-${ds}`;
                                const isSelected = value === thisDate;

                                const todayStr = new Date().toISOString().split("T")[0];
                                const isToday = todayStr === thisDate;

                                return (
                                    <button
                                        key={d}
                                        onClick={(e) => { e.stopPropagation(); handleDayClick(d); }}
                                        className={`h-8 text-[12px] font-bold rounded-lg transition-all flex items-center justify-center
                                            ${isSelected
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-600 z-10'
                                                : isToday
                                                    ? 'bg-slate-100 text-emerald-700 hover:bg-emerald-50'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
                                            }
                                        `}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center px-1">
                            <button onClick={() => { onChange(""); setIsOpen(false); }} className="text-[10px] uppercase font-bold text-slate-400 hover:text-rose-500 transition-colors tracking-wider">Clear</button>
                            <button onClick={() => {
                                const now = new Date();
                                const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
                                onChange(todayStr);
                                setIsOpen(false);
                            }} className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-700 transition-colors tracking-wider flex items-center gap-1">Today</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
