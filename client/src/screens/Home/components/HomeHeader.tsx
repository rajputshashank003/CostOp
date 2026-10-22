import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";
import ExportReportButton from "../../../components/ExportReport/ExportReportButton";
import { organizationApi } from "../../../utils/api_request/organization";

interface Props {
    onAddClick: () => void;
}

export default function HomeHeader({ onAddClick }: Props) {
    const { user } = useUser();
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        organizationApi.get_details().then((data) => {
            if (data?.plan) setIsPro(data.plan === 'pro');
        }).catch(() => {});
    }, []);

    return (
        <header className="h-[62px] min-[1200px]:h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 min-[1200px]:px-8 transition-all">
            <div className="flex items-center gap-2.5 min-[1200px]:gap-3 relative z-[60] flex-shrink-0">
                <MobileNav />
                <h1 className="text-lg min-[1200px]:text-xl font-bold text-slate-900 hidden sm:block">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2 min-[1200px]:gap-3.5 flex-shrink-0">
                <ExportReportButton isPro={isPro} />

                {user?.is_admin && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={onAddClick}
                        className="inline-flex items-center justify-center gap-1.5 min-[1200px]:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3 min-[1200px]:px-5 py-1.5 min-[1200px]:py-2.5 rounded-xl font-semibold shadow-xs text-xs min-[1200px]:text-sm cursor-pointer flex-shrink-0"
                    >
                        <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}><Plus size={16} className="min-[1200px]:w-[18px] min-[1200px]:h-[18px]" /></motion.div>
                        <span className="hidden min-[1200px]:inline">Add Subscription</span>
                        <span className="hidden sm:inline min-[1200px]:hidden">Add Sub</span>
                        <span className="sm:hidden">Add</span>
                    </motion.button>
                )}

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
