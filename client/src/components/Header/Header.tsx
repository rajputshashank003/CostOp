import MobileNav from "../MobileNav/MobileNav";
import NotificationBell from "../Notifications/NotificationBell";

interface Props {
    title: string;
}

export default function Header({ title }: Props) {
    return (
        <header className="h-[62px] min-[1200px]:h-[76px] flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 min-[1200px]:px-8 transition-all">
            <div className="flex items-center gap-2.5 min-[1200px]:gap-3 relative z-[60] flex-1">
                <MobileNav />
                <h1 className="text-lg min-[1200px]:text-xl font-extrabold text-slate-900 tracking-tight hidden sm:block">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
            </div>
        </header>
    );
}
