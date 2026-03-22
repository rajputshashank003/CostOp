import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";

export default function MembersHeader() {
    const { user } = useUser();

    return (
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3 relative z-[60]">
                <MobileNav />
                <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Workspace Members</h1>
            </div>
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-4">
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
