import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Clock } from "lucide-react";
import map from "lodash/map";
import find from "lodash/find";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
    label: string;
    value: string | number;
}

interface TimeframeDropdownProps {
    value: string | number;
    onChange: (val: string | number) => void;
    options: Option[];
    align?: "left" | "right";
}

export default function TimeframeDropdown({ value, onChange, options, align = "left" }: TimeframeDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const handleToggle = () => {
        if (!isOpen && ref.current) {
            setRect(ref.current.getBoundingClientRect());
        }
        setIsOpen(prev => !prev);
    };

    // Close on outside click
    const handleClickOutside = useCallback((e: MouseEvent) => {
        const target = e.target as Node;
        if (ref.current?.contains(target)) return;
        if (portalRef.current?.contains(target)) return;
        setIsOpen(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        // Defer listener to avoid catching the same click that opened it
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    const selectedOption = find(options, o => o.value === value);

    const portalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={portalRef}
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="fixed z-[9999] mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl w-[200px] overflow-hidden"
                    style={{
                        top: (rect?.bottom || 0),
                        left: align === "right" ? undefined : Math.max(8, Math.min(rect?.left || 0, window.innerWidth - 208)),
                        right: align === "right" ? Math.max(8, Math.min(window.innerWidth - (rect?.right || 0), window.innerWidth - 208)) : undefined,
                    }}
                >
                    <div className="flex flex-col py-1">
                        {map(options, (opt) => {
                            const isCustom = opt.value === "custom";
                            const isCurrent = opt.value === "current";
                            const isSelected = opt.value === value;

                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={`px-3 py-2 text-[12px] cursor-pointer transition-colors flex items-center justify-between
                                        ${isSelected ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'}
                                        ${isCustom && !isSelected ? 'border-t border-slate-100 mt-1 pt-2' : ''}
                                        ${isCurrent && !isSelected ? 'border-b border-slate-100 mb-1 pb-2' : ''}
                                    `}
                                >
                                    <span className="tracking-wide truncate pr-2">{opt.label}</span>
                                    {isSelected && (
                                        <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative" ref={ref}>
            <div
                onClick={handleToggle}
                className={`flex items-center justify-between gap-2 bg-white border text-slate-700 text-[12px] font-bold rounded-lg px-2.5 py-1.5 outline-none transition-all cursor-pointer shadow-sm
                ${isOpen ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'}`}
            >
                <div className="flex items-center gap-2">
                    <Clock size={13} className={`flex-shrink-0 transition-colors ${isOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className="truncate tracking-wide flex-1 text-left max-w-[130px] sm:max-w-[180px]">{selectedOption?.label || "Select Range"}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
            </div>

            {createPortal(portalContent, document.body)}
        </div>
    );
}
