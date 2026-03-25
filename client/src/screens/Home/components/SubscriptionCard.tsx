import { useState } from "react";
import { Calendar, CreditCard, Users, Briefcase, User, Archive, Trash2 } from "lucide-react";
import toUpper from "lodash/toUpper";
import head from "lodash/head";
import { getLogoUrl } from "../../../services/logoService";
import { motion } from "framer-motion";

export interface Subscription {
    id: number;
    name: string;
    category: string;
    plan_type: string;
    team_members_count: number;
    billing_cycle: string;
    cost: number;
    is_auto_pay: boolean;
    start_date: string;
    next_billing_date: string;
    added_by_name?: string;
    archived_by_name?: string;
}

interface Props {
    sub: Subscription;
    /** Called when the user clicks the action button on an active card (Archive) */
    onArchiveClick?: (sub: Subscription) => void;
    /** Called when the user clicks the delete button on an archived card (admin only) */
    onDeleteClick?: (sub: Subscription) => void;
}

export default function SubscriptionCard({ sub, onArchiveClick, onDeleteClick }: Props) {
    const [imgError, setImgError] = useState(false);

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    let nextBilling = "TBD";
    if (sub.is_auto_pay === false) {
        nextBilling = "One Time";
    } else if (sub.next_billing_date) {
        nextBilling = new Date(sub.next_billing_date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    }

    const initial = sub.name ? toUpper(head(sub.name) as string) : "?";
    const logoUrl = !imgError ? getLogoUrl(sub.name) : null;

    return (
        <motion.div
            layout
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1rem] bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 font-extrabold text-xl shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt={sub.name} onError={() => setImgError(true)} className="w-8 h-8 object-contain" />
                        ) : (
                            initial
                        )}
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-slate-900 tracking-tight leading-none mb-2">{sub.name}</h3>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md tracking-wide uppercase">
                            <Briefcase size={10} />
                            {sub.category}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Archive button — shown on active cards */}
                    {onArchiveClick && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onArchiveClick(sub)}
                            title="Archive subscription"
                            className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 cursor-pointer border border-transparent hover:border-amber-100"
                        >
                            <Archive size={16} />
                        </motion.button>
                    )}
                    {/* Delete button — shown on archived cards (admin only, passed from parent) */}
                    {onDeleteClick && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteClick(sub)}
                            title="Permanently delete"
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 cursor-pointer border border-transparent hover:border-red-100"
                        >
                            <Trash2 size={16} />
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <div className="text-[12px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                        <CreditCard size={12} />
                        {sub.billing_cycle}
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {formatter.format(sub.cost)}
                    </div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <div className="text-[12px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                        <Calendar size={12} />
                        Next Bill
                    </div>
                    <div className="text-[14px] font-bold text-slate-900 mt-1.5 truncate">
                        {nextBilling}
                    </div>
                </div>
            </div>

            {sub.plan_type === "Team" ? (
                <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[13px] font-semibold text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span>Team Plan ({sub.team_members_count} seats)</span>
                    </div>
                    {sub.archived_by_name ? (
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Archived by {sub.archived_by_name}</div>
                    ) : sub.added_by_name ? (
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Added by {sub.added_by_name}</div>
                    ) : null}
                </div>
            ) : (
                <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[13px] font-semibold text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span>Individual Plan</span>
                    </div>
                    {sub.archived_by_name ? (
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Archived by {sub.archived_by_name}</div>
                    ) : sub.added_by_name ? (
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Added by {sub.added_by_name}</div>
                    ) : null}
                </div>
            )}
        </motion.div>
    );
}
