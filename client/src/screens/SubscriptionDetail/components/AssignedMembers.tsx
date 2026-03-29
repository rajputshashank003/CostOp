import React, { useContext } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import map from "lodash/map";
import size from "lodash/size";
import head from "lodash/head";
import SubscriptionDetailContext from "../context";

const AssignedMembers = () => {
    const { data } = useContext(SubscriptionDetailContext);
    const navigate = useNavigate();

    // Build team name lookup map from granted_teams
    const teamNameMap: Record<number, string> = {};
    // Also build user→team name map by scanning granted_teams members
    const userTeamMap: Record<number, string> = {};
    for (const t of (data?.granted_teams || [])) {
        teamNameMap[t.team_id] = t.team_name;
        for (const m of (t.members || [])) {
            if (!userTeamMap[m.user_id]) {
                userTeamMap[m.user_id] = t.team_name;
            }
        }
    }

    return (
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                Assigned Members
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{size(data.assigned_users)}</span>
            </h2>
            {size(data.assigned_users) === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No users assigned to this subscription yet.</p>
            ) : (
                <div className="space-y-2.5">
                    {map(data.assigned_users, (u: any) => {
                        const teamName = u.source_team_id
                            ? teamNameMap[u.source_team_id]
                            : userTeamMap[u.user_id] || null;
                        return (
                            <div
                                key={u.user_id}
                                onClick={() => navigate(`/profile/${u.user_id}`)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100 cursor-pointer hover:bg-slate-100 hover:border-slate-200 transition-colors"
                            >
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} alt={u.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">{head(u.name)}</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                    <p className="text-xs text-slate-500 truncate hidden sm:block">{u.email}</p>
                                    {teamName && (
                                        <p className="text-[10px] text-indigo-500 font-semibold mt-0.5 truncate">
                                            📍 {teamName}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    {u.source === "team" ? (
                                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Team</span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Individual</span>
                                    )}
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                        {new Date(u.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AssignedMembers;

