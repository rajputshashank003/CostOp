import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "../../../hooks/useUser";
import MobileNav from "../../../components/MobileNav/MobileNav";

interface Props {
    onAddClick: () => void;
}

export default function HomeHeader({ onAddClick }: Props) {
    const { user } = useUser();

    return (
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3 relative z-[60]">
                <MobileNav />
                <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {user?.is_admin && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={onAddClick}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-sm text-sm cursor-pointer"
                    >
                        <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}><Plus size={18} /></motion.div>
                        <span className="hidden sm:inline">Add Subscription</span>
                        <span className="sm:hidden">Add</span>
                    </motion.button>
                )}

                {user && (
                    <div className="flex items-center gap-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-slate-200">
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
