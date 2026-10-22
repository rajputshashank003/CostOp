import { useNavigate } from "react-router-dom";
import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";
import { ReceiptText, CreditCard } from "lucide-react";

export default function OrdersHeader() {
    const { user } = useUser();
    const navigate = useNavigate();

    return (
        <header className="h-[62px] min-[1200px]:h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 min-[1200px]:px-8 sticky top-0 z-10 shadow-xs transition-all">
            <div className="flex items-center gap-2.5 min-[1200px]:gap-3 relative z-[60] flex-shrink-0">
                <MobileNav />
                <div className="w-8 h-8 min-[1200px]:w-10 min-[1200px]:h-10 rounded-xl bg-emerald-50 text-emerald-600 hidden sm:flex items-center justify-center flex-shrink-0">
                    <ReceiptText size={18} className="min-[1200px]:w-5 min-[1200px]:h-5" />
                </div>
                <div>
                    <h1 className="text-base min-[1200px]:text-[20px] font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
                        Orders & Purchases
                    </h1>
                    <p className="text-[11px] min-[1200px]:text-xs text-slate-500 font-medium hidden sm:block">
                        Review workspace billing history, tax invoices, and transaction receipts
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 min-[1200px]:gap-3.5 flex-shrink-0">
                <button
                    onClick={() => navigate('/billing')}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-[1200px]:px-4 py-1.5 min-[1200px]:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs min-[1200px]:text-sm font-semibold shadow-xs transition-all cursor-pointer hover:border-slate-300 flex-shrink-0"
                >
                    <CreditCard size={15} className="text-emerald-600 min-[1200px]:w-4 min-[1200px]:h-4" />
                    <span className="hidden sm:inline">Billing Plans</span>
                    <span className="sm:hidden">Plans</span>
                </button>

                <NotificationBell />

                {user && (
                    <div className="flex items-center gap-2 min-[1200px]:gap-3 ml-1 min-[1200px]:ml-2 pl-2 min-[1200px]:pl-4 border-l border-slate-200 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs min-[1200px]:text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                            <p className="text-[12px] text-slate-500 hidden min-[1200px]:block truncate max-w-[170px]">{user.email}</p>
                        </div>
                        <img
                            src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U")}
                            alt="Avatar"
                            className="w-8 h-8 min-[1200px]:w-10 min-[1200px]:h-10 rounded-full border border-slate-200 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random`;
                            }}
                        />
                    </div>
                )}
            </div>
        </header>
    );
}
