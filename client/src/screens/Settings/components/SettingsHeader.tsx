import { Settings2 } from "lucide-react";

const SettingsHeader = () => {
    return (
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-inner">
                <Settings2 size={20} className="text-slate-500" />
            </div>
            <div>
                <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-none mb-1">Organization Settings</h1>
                <p className="text-[13px] font-semibold text-slate-500">Manage your workspace configuration and policies</p>
            </div>
        </header>
    );
};

export default SettingsHeader;
