import React, { useContext } from "react";
import { CreditCard, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import SubscriptionDetailContext from "../context";
import { MetricCard } from "./Primitives";

const MetricsRow = () => {
    const { data, sub, formatter, seatPercent, nextBilling } = useContext(SubscriptionDetailContext);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={<CreditCard size={18} />} label={sub.billing_cycle} value={formatter.format(sub.cost)} accent="emerald" />
                <MetricCard icon={<Calendar size={18} />} label="Next Bill" value={nextBilling} accent="blue" />
                <MetricCard icon={<Users size={18} />} label="Seats Used" value={`${data.assigned_count} / ${data.seat_count}`} accent="violet" />
                <MetricCard icon={<Users size={18} />} label="Available" value={`${data.available_seats} seats`} accent="amber" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700 mb-3">Seat Utilisation</h2>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${seatPercent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${seatPercent >= 90 ? 'bg-red-500' : seatPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{seatPercent}% utilised — {data.assigned_count} of {data.seat_count} seats assigned</p>
            </div>
        </>
    );
};

export default MetricsRow;
