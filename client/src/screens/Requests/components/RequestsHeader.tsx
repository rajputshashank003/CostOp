import { Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileNav from "../../../components/MobileNav/MobileNav";
import { useUser } from "../../../hooks/useUser";
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
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3 relative z-[60]">
                <MobileNav />
                <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Subscription Requests</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Status Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {map(STATUS_TABS, tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-2 sm:px-4 py-1.5 min-w-[60px] sm:min-w-[90px] text-[11px] sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {!isAdmin && (
                    <button
                        onClick={() => navigate("/add-subscription", { state: { mode: "request" } })}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] sm:text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                        <Plus size={15} />
                        <span className="hidden sm:inline">Request Subscription</span>
                        <span className="sm:hidden">Request</span>
                    </button>
                )}

                {user && (
                    <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-3">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                            <p className="text-[12px] text-slate-500 truncate max-w-[120px]">{user.email}</p>
                        </div>
                        <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}`}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full border border-slate-200 flex-shrink-0"
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
