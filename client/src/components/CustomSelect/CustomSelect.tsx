import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import map from "lodash/map";

export default function CustomSelect({
    options, value, onChange, icon: Icon
}: {
    options: string[], value: string, onChange: (v: string) => void, icon?: any
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Icon size={16} />
                </div>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 rounded-xl border outline-none transition-all flex items-center justify-between cursor-pointer text-sm bg-white ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <span className="text-slate-700">{value}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    {map(options, opt => (
                        <div
                            key={opt}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center ${value === opt ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
