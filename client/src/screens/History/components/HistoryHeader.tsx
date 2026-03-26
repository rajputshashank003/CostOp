import { useContext } from "react";
import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";
import HistoryContext from "../context";

export default function HistoryHeader() {
    const { user } = useUser();
    const { historyMode, setHistoryMode } = useContext(HistoryContext);

    return (
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3 relative z-[60]">
                <MobileNav />
                <h1 className="text-xl font-bold text-slate-900 hidden sm:block">History</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setHistoryMode("all")}
                        className={`px-2 sm:px-4 py-1.5 min-w-[60px] sm:min-w-[100px] text-[11px] sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${historyMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setHistoryMode("archived")}
                        className={`px-2 sm:px-4 py-1.5 min-w-[70px] sm:min-w-[120px] text-[11px] sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${historyMode === "archived" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <span className="sm:hidden">Archived</span>
                        <span className="hidden sm:inline">Archived Only</span>
                    </button>
                </div>

                {user && (
                    <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                            <p className="text-[13px] text-slate-500 truncate max-w-[120px] lg:max-w-none">{user.email}</p>
                        </div>
                        <img
                            src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U")}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border border-slate-200"
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
