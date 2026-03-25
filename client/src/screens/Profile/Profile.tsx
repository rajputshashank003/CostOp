import { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { usersApi } from "../../utils/api_request/users";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import SubscriptionCard from "../Home/components/SubscriptionCard";
import map from "lodash/map";
import { DollarSign, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
    const { user, isLoading: isAuthLoading } = useUser();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading) return;
        usersApi.get_profile_subscriptions()
            .then(res => {
                setSubscriptions(res || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [isAuthLoading]);

    const totalCost = subscriptions.reduce((sum, sub) => {
        // Just summing the full tool cost to give a sense of responsibility/portfolio size
        // Alternatively, if we wanted per-seat cost: sub.cost / sub.seat_count
        let unitCost = sub.cost;
        if (sub.pricing_model === "per_seat" && sub.seat_count > 0) {
            unitCost = sub.cost / sub.seat_count;
        }
        return sum + unitCost;
    }, 0);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen bg-[#f0f0f5]">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></span>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header title="My Profile" />

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Profile Header Block */}
                        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <img
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&size=128&background=random`}
                                alt={user?.name || "User Avatar"}
                                className="w-32 h-32 rounded-3xl border-4 border-emerald-50 shadow-md flex-shrink-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&size=128&background=random`;
                                }}
                            />
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{user?.name}</h1>
                                <p className="text-lg font-bold text-slate-500 mb-6">{user?.email}</p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="bg-emerald-50 rounded-2xl px-5 py-4 border border-emerald-100 flex items-center gap-4 min-w-[200px]">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider mb-0.5">Assigned Cost (Per Seat)</p>
                                            <p className="text-xl font-extrabold text-emerald-700">{formatter.format(totalCost)} <span className="text-sm font-bold text-emerald-600/60">/mo</span></p>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 rounded-2xl px-5 py-4 border border-indigo-100 flex items-center gap-4 min-w-[200px]">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider mb-0.5">Active Tools</p>
                                            <p className="text-xl font-extrabold text-indigo-700">{subscriptions.length} <span className="text-sm font-bold text-indigo-600/60">Tools</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assigned Tools List */}
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-800 mb-6 px-2">Assigned Software Stack</h2>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-[2rem] p-6 h-48 animate-pulse border border-slate-200"></div>
                                    ))}
                                </div>
                            ) : subscriptions.length === 0 ? (
                                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-sm">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                                        <Layers size={32} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-800 mb-2">No Assigned Tools</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                        You haven't been assigned any software seats yet. When you are added to a team or organization tool, it will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {map(subscriptions, (sub) => (
                                        <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <SubscriptionCard
                                                sub={sub}
                                                onArchiveClick={() => { }}
                                                onAssignClick={() => { }}
                                                isProfileView={true}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
