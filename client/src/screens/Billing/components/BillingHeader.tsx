import { useNavigate } from "react-router-dom";
import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";
import { CreditCard, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";

export default function BillingHeader() {
    const { user } = useUser();
    const navigate = useNavigate();

    return (
        <header className="h-[62px] desk:h-[76px] flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-4 desk:px-8 sticky top-0 z-10 shadow-xs transition-all">
            <div className="flex items-center gap-2.5 desk:gap-3 relative z-[60] min-w-0">
                <MobileNav />
                <div className="w-8 h-8 desk:w-10 desk:h-10 rounded-xl bg-emerald-50 text-emerald-600 hidden sm:flex items-center justify-center flex-shrink-0">
                    <CreditCard size={18} className="desk:w-5 desk:h-5" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-base desk:text-[20px] font-extrabold text-slate-900 tracking-tight leading-tight mb-0.5 truncate">
                        Plans & Billing
                    </h1>
                    <p className="text-xs text-slate-500 font-medium hidden lg:block truncate">
                        Choose the right tier for your team and manage workspace quotas
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 desk:gap-3.5 flex-shrink-0">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/orders')}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 desk:px-4 py-1.5 desk:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs desk:text-sm font-semibold shadow-2xs transition-all cursor-pointer hover:border-slate-300 flex-shrink-0"
                    aria-label="Order History"
                    title="View purchase receipts and invoices"
                >
                    <ReceiptText size={15} className="text-emerald-600 desk:w-4 desk:h-4" />
                    <span className="hidden sm:inline">Order History</span>
                    <span className="hidden xs:inline sm:hidden">Orders</span>
                </motion.button>

                <NotificationBell />

                {user && (
                    <div className="flex items-center gap-2 desk:gap-3 ml-1 desk:ml-2 pl-2 desk:pl-4 border-l border-slate-200 flex-shrink-0">
                        <div className="text-right hidden desk:block">
                            <p className="text-xs desk:text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                            <p className="text-[12px] text-slate-500 hidden desk:block truncate max-w-[170px]">{user.email}</p>
                        </div>
                        <img
                            src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U")}
                            alt="Avatar"
                            className="w-8 h-8 desk:w-10 desk:h-10 rounded-full border border-slate-200 object-cover"
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
