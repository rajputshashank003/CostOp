import { Settings2 } from "lucide-react";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";

const SettingsHeader = () => {
    return (
        <header className="min-h-[62px] desk:min-h-[76px] bg-white border-b border-slate-200 px-3 sm:px-4 desk:px-8 py-3 desk:py-5 flex items-center justify-between sticky top-0 z-10 shadow-xs transition-all">
            <div className="flex items-center gap-2.5 desk:gap-4 flex-shrink-0">
                <MobileNav />
                <div className="w-8 h-8 desk:w-10 desk:h-10 rounded-xl bg-slate-100 hidden sm:flex items-center justify-center shadow-inner flex-shrink-0">
                    <Settings2 size={18} className="text-slate-500 desk:w-5 desk:h-5" />
                </div>
                <div>
                    <h1 className="text-base desk:text-[22px] font-extrabold text-slate-900 tracking-tight leading-none mb-1">Organization Settings</h1>
                    <p className="text-[11px] desk:text-[13px] font-semibold text-slate-500 hidden sm:block">Manage your workspace configuration and policies</p>
                </div>
            </div>
            <NotificationBell />
        </header>
    );
};

export default SettingsHeader;
