import { useState, useEffect } from "react";
import map from "lodash/map";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import size from "lodash/size";
import SubscriptionCard from "../Home/components/SubscriptionCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import MobileNav from "../../components/MobileNav/MobileNav";
import { useUser } from "../../hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";
import HistorySkeleton from "../../components/Skeleton/HistorySkeleton";

export default function History() {
    const { user, isLoading: isAuthLoading } = useUser();
    const [archived, setArchived] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading) return;
        subscriptionsApi.get_all("archived")
            .then(data => setArchived(data || []))
            .finally(() => setIsLoading(false));
    }, [isAuthLoading]);

    if (isLoading || isAuthLoading) {
        return <HistorySkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3 relative z-[60]">
                        <MobileNav />
                        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Archived History</h1>
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

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {size(archived) === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 font-medium pb-20">
                            No archived subscriptions found.
                        </div>
                    ) : (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                        >
                            <AnimatePresence>
                                {map(archived, (sub: any) => (
                                    <SubscriptionCard key={sub.id} sub={sub} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
