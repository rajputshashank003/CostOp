import { DollarSign, Layers } from "lucide-react";

interface ProfileHeaderProps {
    user: any;
    totalCost: number;
    subscriptionCount: number;
    formatter: Intl.NumberFormat;
}

const ProfileHeader = ({ user, totalCost, subscriptionCount, formatter }: ProfileHeaderProps) => {
    return (
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
                            <p className="text-xl font-extrabold text-indigo-700">{subscriptionCount} <span className="text-sm font-bold text-indigo-600/60">Tools</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
