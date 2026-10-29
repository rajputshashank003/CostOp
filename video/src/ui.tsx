// Stateless replicas of CostOp client UI (same Tailwind classes as client/src),
// rendered at app pixel size and scaled up with CSS zoom for 1080p video.
import React from "react";
import { Brain, CalendarClock, ChevronRight, CreditCard, PieChart, TrendingDown } from "lucide-react";
import { usd } from "./brand";

export const Zoom: React.FC<{ k: number; width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, width, children, style }) => (
    <div style={{ zoom: k, width, ...style }}>{children}</div>
);

// Landing HeroSection card
export const HeroSpendCard: React.FC<{ total: number; rows: React.ReactNode }> = ({ total, rows }) => (
    <div className="relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</div>
                <div className="text-4xl font-extrabold text-slate-900">
                    {usd.format(total)}
                    <span className="text-lg text-slate-400">/mo</span>
                </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <PieChart size={28} />
            </div>
        </div>
        <div className="space-y-4">{rows}</div>
    </div>
);

export const HeroRow: React.FC<{ n: string; c: string; d: string; color: string; style?: React.CSSProperties; right?: React.ReactNode }> = ({
    n,
    c,
    d,
    color,
    style,
    right,
}) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50" style={style}>
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${color}`}>{n.charAt(0)}</div>
            <div>
                <div className="font-bold text-slate-900">{n}</div>
                <div className="text-xs font-semibold text-slate-500">{d}</div>
            </div>
        </div>
        {right ?? <div className="font-bold text-slate-700">{c}</div>}
    </div>
);

// Home SmallRenewalItem
export const RenewalItem: React.FC<{ name: string; date: string; cost: number }> = ({ name, date, cost }) => (
    <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shadow-sm">
                {name.charAt(0)}
            </div>
            <div>
                <p className="text-[13px] font-bold text-slate-900 leading-none">{name}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">{date}</p>
            </div>
        </div>
        <div className="text-[13px] font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">{usd.format(cost)}</div>
    </div>
);

// Home DashboardMetrics → SpendWidget
export const SpendWidget: React.FC<{ value: number }> = ({ value }) => (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                    <TrendingDown size={16} className="text-emerald-500" />
                    Current Monthly
                </p>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{usd.format(value)}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <CreditCard size={24} />
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center gap-2">
            <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Current Snapshot</span>
            <span className="text-[12px] font-semibold text-slate-400">23 active tools</span>
        </div>
    </div>
);

// Home DashboardMetrics → RenewalsWidget
export const RenewalsWidget: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2">
                <CalendarClock size={16} className="text-emerald-500" />
                Upcoming Renewals
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ml-1 border border-emerald-100 shadow-sm leading-none">
                    30 DAYS
                </span>
            </p>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
    </div>
);

// Home AIInsightsCard
export const AIInsights: React.FC<{ children: React.ReactNode; total: number; glow: number }> = ({ children, total, glow }) => (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Brain size={18} className="text-white" />
                </div>
                <span className="text-[14px] font-bold text-slate-700">AI Insights</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">3 tips</span>
        </div>
        <div className="flex flex-col gap-2 mb-3">{children}</div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                View All <ChevronRight size={13} />
            </span>
            <span
                className="text-xs font-bold text-emerald-600 rounded-md px-1.5 py-0.5"
                style={{ background: `rgba(16,185,129,${0.18 * glow})`, transform: `scale(${1 + 0.08 * glow})` }}
            >
                Save up to {usd.format(total)}/mo
            </span>
        </div>
    </div>
);

export const InsightRow: React.FC<{ icon: React.ReactNode; gradient: string; title: string; save: number; style?: React.CSSProperties }> = ({
    icon,
    gradient,
    title,
    save,
    style,
}) => (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2" style={style}>
        <div className="flex items-center gap-3 min-w-0">
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 text-white`}>{icon}</div>
            <p className="text-[13px] font-bold text-slate-700 truncate">{title}</p>
        </div>
        <span className="text-[12px] font-bold text-emerald-600 flex-shrink-0 ml-2">{usd.format(save)}/mo</span>
    </div>
);
