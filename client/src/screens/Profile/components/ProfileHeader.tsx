import { DollarSign, Layers, Shield, Users, MapPin } from "lucide-react";
import MoveTeamDropdown from "@/components/MoveTeamDropdown/MoveTeamDropdown";
import size from "lodash/size";
import map from "lodash/map";

interface ProfileHeaderProps {
    user: any;
    teams?: any[];
    totalCost: number;
    subscriptionCount: number;
    formatter: Intl.NumberFormat;
    isOwnProfile?: boolean;
    viewerIsAdmin?: boolean;
    allTeams?: any[];
    onMove?: (userId: number, currentTeamId: number, newTeamId: number) => Promise<void>;
    onCreate?: (name: string) => Promise<void>;
}

const ProfileHeader = ({ user, teams = [], totalCost, subscriptionCount, formatter, isOwnProfile, viewerIsAdmin, allTeams, onMove, onCreate }: ProfileHeaderProps) => {
    const isAdmin = user?.is_admin;
    const currentTeamId = teams.length > 0 ? teams[0].team_id : null;

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
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-extrabold text-slate-900">{user?.name}</h1>
                    {isAdmin && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase">
                            <Shield size={12} /> Admin
                        </span>
                    )}
                </div>
                <p className="text-lg font-bold text-slate-500 mb-2">{user?.email}</p>

                {/* Team badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                    {size(teams) > 0 && map(teams, (t: any) => (
                        <span key={t.team_id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                            <MapPin size={12} /> {t.team_name}
                            {t.designation && <span className="text-indigo-500 font-medium">· {t.designation}</span>}
                        </span>
                    ))}
                    {viewerIsAdmin && !isAdmin && onMove && onCreate && allTeams && (
                        <div className="ml-2">
                            <MoveTeamDropdown
                                userId={user?.id}
                                currentTeamId={currentTeamId}
                                allTeams={allTeams}
                                onMove={onMove}
                                onCreate={onCreate}
                            />
                        </div>
                    )}
                </div>



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
