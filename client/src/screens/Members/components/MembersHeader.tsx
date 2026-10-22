import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";
import NotificationBell from "../../../components/Notifications/NotificationBell";

export default function MembersHeader() {
    const { user } = useUser();

    return (
        <header className="h-[62px] min-[1200px]:h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 min-[1200px]:px-8 transition-all">
            <div className="flex items-center gap-2.5 min-[1200px]:gap-3 relative z-[60] flex-shrink-0">
                <MobileNav />
                <h1 className="text-lg min-[1200px]:text-xl font-bold text-slate-900 hidden sm:block">Workspace Members</h1>
            </div>
            <div className="flex items-center gap-2 min-[1200px]:gap-4 flex-shrink-0">
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
