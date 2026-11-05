import { Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileNav from "../../../components/MobileNav/MobileNav";
import { useUser } from "../../../hooks/useUser";
import NotificationBell from "../../../components/Notifications/NotificationBell";
import map from "lodash/map";

const STATUS_TABS = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle2 },
    { key: "rejected", label: "Rejected", icon: XCircle },
] as const;

interface RequestsHeaderProps {
    activeTab: string;
    setActiveTab: (tab: "pending" | "approved" | "rejected") => void;
}

const RequestsHeader = ({ activeTab, setActiveTab }: RequestsHeaderProps) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const isAdmin = user?.is_admin;

    return (
        <header className="h-[62px] desk:h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 desk:px-8 transition-all">
            <div className="flex items-center gap-2.5 desk:gap-3 relative z-[60] flex-shrink-0">
                <MobileNav />
                <h1 className="text-lg desk:text-xl font-bold text-slate-900 hidden sm:block">Subscription Requests</h1>
            </div>

            <div className="flex items-center gap-2 desk:gap-3.5 flex-shrink-0">
                {/* Status Tabs */}
                <div className="flex bg-slate-100 p-0.5 desk:p-1 rounded-xl">
                    {map(STATUS_TABS, tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-3 desk:px-4 py-2 desk:py-1.5 min-w-[55px] desk:min-w-[90px] text-xs desk:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {!isAdmin && (
                    <button
                        onClick={() => navigate("/add-subscription", { state: { mode: "request" } })}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 desk:px-4 py-1.5 desk:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs desk:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                        <Plus size={14} className="desk:w-4 desk:h-4" />
                        <span className="hidden desk:inline">Request Subscription</span>
                        <span className="hidden sm:inline desk:hidden">Request</span>
                        <span className="sm:hidden">Request</span>
                    </button>
                )}

                <NotificationBell />

                {user && (
                    <div className="flex items-center gap-2 desk:gap-3 ml-1 desk:ml-2 pl-2 desk:pl-3 border-l border-slate-200 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs desk:text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                            <p className="text-[12px] text-slate-500 hidden desk:block truncate max-w-[170px]">{user.email}</p>
                        </div>
                        <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}`}
                            alt="Avatar"
                            className="w-8 h-8 desk:w-9 desk:h-9 rounded-full border border-slate-200 flex-shrink-0 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random`;
                            }}
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default RequestsHeader;
