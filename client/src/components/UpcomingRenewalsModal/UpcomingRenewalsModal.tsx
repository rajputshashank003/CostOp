import { useEffect } from "react";
import { X, CalendarClock } from "lucide-react";
import map from "lodash/map";
import { motion } from "framer-motion";
import RenewalItem, { Subscription } from "./RenewalItem";

interface UpcomingRenewalsModalProps {
    renewals: Subscription[];
    onClose: () => void;
}

export default function UpcomingRenewalsModal({ renewals, onClose }: UpcomingRenewalsModalProps) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

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
            {/* Modal Content */}
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
                            <CalendarClock size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Upcoming Renewals</h2>
                            <p className="text-[13px] font-medium text-slate-500">Next 30 Days</p>
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

                {/* Body (Scrollable List) */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="flex flex-col gap-3">
                        {map(renewals, (r: Subscription) => (
                            <RenewalItem key={r.id} r={r} formatter={formatter} />
                        ))}
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
}
