import { Settings2 } from "lucide-react";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";

const SettingsHeader = () => {
    return (
        <header className="min-h-[62px] min-[1200px]:min-h-[76px] bg-white border-b border-slate-200 px-3 sm:px-4 min-[1200px]:px-8 py-3 min-[1200px]:py-5 flex items-center justify-between sticky top-0 z-10 shadow-xs transition-all">
            <div className="flex items-center gap-2.5 min-[1200px]:gap-4 flex-shrink-0">
                <MobileNav />
                <div className="w-8 h-8 min-[1200px]:w-10 min-[1200px]:h-10 rounded-xl bg-slate-100 hidden sm:flex items-center justify-center shadow-inner flex-shrink-0">
                    <Settings2 size={18} className="text-slate-500 min-[1200px]:w-5 min-[1200px]:h-5" />
                </div>
                <div>
                    <h1 className="text-base min-[1200px]:text-[22px] font-extrabold text-slate-900 tracking-tight leading-none mb-1">Organization Settings</h1>
                    <p className="text-[11px] min-[1200px]:text-[13px] font-semibold text-slate-500 hidden sm:block">Manage your workspace configuration and policies</p>
                </div>
            </div>
            <NotificationBell />
        </header>
    );
};

export default SettingsHeader;
