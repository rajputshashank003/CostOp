import React, { useContext } from "react";
import { Users } from "lucide-react";
import map from "lodash/map";
import size from "lodash/size";
import head from "lodash/head";
import SubscriptionDetailContext from "../context";

const AssignedMembers = () => {
    const { data } = useContext(SubscriptionDetailContext);

    return (
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                Assigned Members
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{size(data.assigned_users)}</span>
            </h2>
            {size(data.assigned_users) === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No users assigned to this subscription yet.</p>
            ) : (
                <div className="space-y-3">
                    {map(data.assigned_users, (u: any) => (
                        <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                            {u.avatar_url ? (
                                <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">{head(u.name)}</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {new Date(u.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignedMembers;
