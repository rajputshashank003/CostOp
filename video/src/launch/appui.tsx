// CostOp desktop app rebuilt from client/src (Sidebar, DashboardMetrics, DepartmentSpend,
// CostInsights, AIInsightsCard, subscription cards) with the same Tailwind classes, in ₹.
import React from "react";
import type { LucideIcon } from "lucide-react";
import {
    ArrowDownToLine,
    Bell,
    Brain,
    CalendarClock,
    ChevronRight,
    CreditCard,
    Download,
    History,
    Inbox,
    Layers,
    LayoutDashboard,
    LogOut,
    PieChart,
    Receipt,
    ReceiptText,
    Sparkles,
    TrendingDown,
    UserMinus,
    Users,
} from "lucide-react";

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export const BrowserFrame: React.FC<{ url: string; children: React.ReactNode; width: number; height: number; typed?: number }> = ({
    url,
    children,
    width,
    height,
    typed,
}) => (
    <div className="rounded-[18px] overflow-hidden shadow-2xl border border-slate-900/10 bg-white" style={{ width, height, boxShadow: "0 50px 120px -30px rgba(2,44,34,0.45)" }}>
        <div className="flex items-center gap-4 px-5" style={{ height: 52, background: "#1f2937" }}>
            <div className="flex gap-2">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <div key={c} className="w-3.5 h-3.5 rounded-full" style={{ background: c }} />
                ))}
            </div>
            <div className="flex-1 flex items-center gap-3 rounded-full px-5 text-[17px] text-slate-200" style={{ height: 34, background: "#111827" }}>
                <span className="text-slate-400">⌕</span>
                <span>{typed === undefined ? url : url.slice(0, Math.floor(typed))}</span>
            </div>
        </div>
        <div style={{ height: height - 52, position: "relative", overflow: "hidden" }}>{children}</div>
    </div>
);

const NAV: [LucideIcon, string][] = [
    [LayoutDashboard, "Dashboard"],
    [History, "History"],
    [Users, "Members"],
    [Inbox, "Requests"],
    [Users, "Profile"],
    [CreditCard, "Billing"],
    [ReceiptText, "Orders"],
];

export const Sidebar: React.FC = () => (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-6">
            <div className="flex items-center gap-2">
                <Receipt size={28} className="text-emerald-600" />
                <span className="text-[22px] font-extrabold tracking-[-0.5px] text-slate-900">CostOp</span>
            </div>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
            {NAV.map(([Icon, label], i) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${i === 0 ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`}>
                    <Icon size={20} />
                    {label}
                </div>
            ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium">
                <LogOut size={20} />
                Sign Out
            </div>
        </div>
    </aside>
);

export const Header: React.FC = () => (
    <div className="h-[62px] bg-white border-b border-slate-200/80 flex items-center justify-between px-8">
        <h1 className="text-[20px] font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-700 shadow-sm">
                <Download size={16} /> Export Report
                <span className="text-[10px] font-bold text-white bg-emerald-600 px-1.5 py-0.5 rounded-md ml-1">PRO</span>
            </div>
            <Bell size={20} className="text-slate-500" />
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
                <div className="text-right leading-tight">
                    <div className="text-[13px] font-bold text-slate-900">YOUR TEAM</div>
                    <div className="text-[11px] text-slate-500">admin@yourstartup.in</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center">Y</div>
            </div>
        </div>
    </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = "", style }) => (
    <div className={`bg-white rounded-[1.5rem] border border-slate-200 shadow-sm ${className}`} style={style}>
        {children}
    </div>
);

export const SpendCard: React.FC<{ value: number }> = ({ value }) => (
    <Card className="p-6 flex flex-col justify-between h-full border-emerald-200">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                    <TrendingDown size={16} className="text-emerald-500" /> Current Monthly
                </p>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {inr(value)}
                </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <CreditCard size={24} />
            </div>
        </div>
        <div className="pt-4 border-t border-slate-100/80">
            <span className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5">Current Snapshot</span>
        </div>
    </Card>
);

export const RenewalRow: React.FC<{ name: string; tile: string; date: string; cost: number; style?: React.CSSProperties }> = ({ name, tile, date, cost, style }) => (
    <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100" style={style}>
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${tile}`}>{name.charAt(0)}</div>
            <div>
                <p className="text-[13px] font-bold text-slate-900 leading-none">{name}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">{date}</p>
            </div>
        </div>
        <div className="text-[13px] font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">{inr(cost)}</div>
    </div>
);

export const RenewalsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Card className="p-6 h-full">
        <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2 mb-4">
            <CalendarClock size={16} className="text-emerald-500" /> Upcoming Renewals
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ml-1 border border-emerald-100">30 DAYS</span>
        </p>
        <div className="flex flex-col gap-3">{children}</div>
    </Card>
);

export const DEPTS = [
    { d: "AI", v: 610, p: 61 },
    { d: "Communication", v: 130, p: 13 },
    { d: "Marketing", v: 110, p: 11 },
    { d: "Design", v: 80, p: 8 },
];

export const DeptCard: React.FC<{ grow: number }> = ({ grow }) => (
    <Card className="p-6 h-full flex flex-col">
        <p className="text-[14px] font-semibold text-slate-500 flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-emerald-500" /> Spend by Department
        </p>
        <div className="flex flex-col gap-3">
            {DEPTS.map((x) => (
                <div key={x.d} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                        <span className="font-bold text-slate-700">{x.d}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-500">{inr(x.v)}</span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md w-10 text-right">{x.p}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full" style={{ width: `${x.p * grow}%` }} />
                    </div>
                </div>
            ))}
        </div>
        <p className="text-[12px] font-semibold text-slate-400 text-center mt-auto pt-2">+ 1 more departments</p>
    </Card>
);

export const InsightShell: React.FC<{
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    badge: string;
    badgeClass: string;
    footerL?: string;
    footerR?: React.ReactNode;
    children: React.ReactNode;
    style?: React.CSSProperties;
}> = ({ icon, iconClass, title, badge, badgeClass, footerL = "View All", footerR, children, style }) => (
    <Card className="p-5 flex flex-col h-full" style={style}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}>{icon}</div>
                <span className="text-[14px] font-bold text-slate-700">{title}</span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>{badge}</span>
        </div>
        <div className="flex flex-col gap-2 mb-3">{children}</div>
        {footerR && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    {footerL} <ChevronRight size={13} />
                </span>
                {footerR}
            </div>
        )}
    </Card>
);

export const InsightRow: React.FC<{ left: React.ReactNode; title: string; sub?: string; right: string; rightClass?: string; style?: React.CSSProperties }> = ({
    left,
    title,
    sub,
    right,
    rightClass = "text-emerald-600",
    style,
}) => (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2" style={style}>
        <div className="flex items-center gap-3 min-w-0">
            {left}
            <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-700 truncate">{title}</p>
                {sub && <p className="text-[11px] text-slate-400 font-medium">{sub}</p>}
            </div>
        </div>
        <span className={`text-[12px] font-bold flex-shrink-0 ml-2 ${rightClass}`}>{right}</span>
    </div>
);

export const Tile: React.FC<{ letter: string; cls: string; size?: number }> = ({ letter, cls, size = 20 }) => (
    <div className={`rounded-md flex items-center justify-center font-bold ${cls}`} style={{ width: size, height: size, fontSize: size * 0.55 }}>
        {letter}
    </div>
);

export const GradIcon: React.FC<{ g: string; children: React.ReactNode }> = ({ g, children }) => (
    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${g} flex items-center justify-center flex-shrink-0 text-white`}>{children}</div>
);

export const AIIcon = () => <Brain size={18} className="text-white" />;
export const DupIcon = () => <Layers size={18} />;
export const SeatIcon = () => <UserMinus size={18} />;
export { ArrowDownToLine, Sparkles, Users };

// Subscription card from the dashboard grid
export const SubCard: React.FC<{ name: string; tile: string; cat: string; amount: number; next: string; plan: string; style?: React.CSSProperties }> = ({
    name,
    tile,
    cat,
    amount,
    next,
    plan,
    style,
}) => (
    <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-5" style={{ width: 340, ...style }}>
        <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-extrabold ${tile}`}>{name.charAt(0)}</div>
            </div>
            <div>
                <div className="text-[18px] font-bold text-slate-900 leading-tight">{name}</div>
                <span className="inline-block mt-1 text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">{cat}</span>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">Monthly</div>
                <div className="text-[19px] font-extrabold text-slate-900">{inr(amount)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">Next Bill</div>
                <div className="text-[15px] font-bold text-slate-900 mt-1">{next}</div>
            </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[12px]">
            <span className="font-semibold text-slate-600">{plan}</span>
            <span className="font-bold tracking-wider text-slate-400 text-[10px]">ADDED BY ADMIN</span>
        </div>
    </div>
);
