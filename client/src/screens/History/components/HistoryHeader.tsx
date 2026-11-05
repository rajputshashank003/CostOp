import { useContext } from "react";
import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";
import HistoryContext from "../context";

export default function HistoryHeader() {
    const { user } = useUser();
    const { historyMode, setHistoryMode } = useContext(HistoryContext);

    return (
        <header className="h-[62px] desk:h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 desk:px-8 transition-all">
            <div className="flex items-center gap-2.5 desk:gap-3 relative z-[60] flex-shrink-0">
                <MobileNav />
                <h1 className="text-lg desk:text-xl font-bold text-slate-900 hidden sm:block">History</h1>
            </div>

            <div className="flex items-center gap-2 desk:gap-3.5 flex-shrink-0">
                <div className="flex bg-slate-100 p-0.5 desk:p-1 rounded-xl">
                    <button
                        onClick={() => setHistoryMode("all")}
                        className={`px-3 desk:px-4 py-2 desk:py-1.5 min-w-[55px] desk:min-w-[100px] text-xs desk:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${historyMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setHistoryMode("archived")}
                        className={`px-3 desk:px-4 py-2 desk:py-1.5 min-w-[65px] desk:min-w-[120px] text-xs desk:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${historyMode === "archived" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <span className="desk:hidden">Archived</span>
                        <span className="hidden desk:inline">Archived Only</span>
                    </button>
                </div>

                <NotificationBell />

                {user && (
                    <div className="flex items-center gap-2 desk:gap-3 ml-1 desk:ml-2 pl-2 desk:pl-4 border-l border-slate-200 flex-shrink-0">
                        <div className="text-right hidden sm:block">
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
