import MobileNav from "../MobileNav/MobileNav";

interface Props {
    title: string;
}

export default function Header({ title }: Props) {
    return (
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-4 sm:px-8">
            <div className="flex items-center gap-3 relative z-[60]">
                <MobileNav />
                <h1 className="text-xl font-bold text-slate-900 hidden sm:block">{title}</h1>
            </div>
        </header>
    );
}
