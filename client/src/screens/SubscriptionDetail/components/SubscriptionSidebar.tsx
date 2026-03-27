import React, { useContext } from "react";
import { Users, User, Crown, Clock, MessageSquare, Briefcase } from "lucide-react";
import SubscriptionDetailContext from "../context";
import { InfoCard, PersonRow, DetailRow } from "./Primitives";

const SubscriptionSidebar = () => {
    const { data, sub } = useContext(SubscriptionDetailContext);

    return (
        <div className="space-y-4">
            {data.owner?.name && (
                <InfoCard title="Owner" icon={<Crown size={14} className="text-amber-500" />}>
                    <PersonRow avatar={data.owner.avatar_url} name={data.owner.name} email={data.owner.email} />
                </InfoCard>
            )}

            {data.added_by?.name && (
                <InfoCard title="Added By" icon={<User size={14} className="text-slate-400" />}>
                    <PersonRow avatar={data.added_by.avatar_url} name={data.added_by.name} email={data.added_by.email} />
                </InfoCard>
            )}

            {data.team?.name && (
                <InfoCard title="Team" icon={<Users size={14} className="text-indigo-500" />}>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{data.team.name}</span>
                        <span className="text-xs text-slate-500">({data.team.member_count} members)</span>
                    </div>
                </InfoCard>
            )}

            <InfoCard title="Details" icon={<Briefcase size={14} className="text-emerald-500" />}>
                <div className="space-y-2 text-sm">
                    <DetailRow label="Plan Type" value={sub.plan_type} />
                    <DetailRow label="Scope" value={sub.scope || "team"} />
                    <DetailRow label="Auto Pay" value={sub.is_auto_pay ? "Yes" : "No"} />
                    <DetailRow label="Start Date" value={new Date(sub.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                    <DetailRow label="Status" value={sub.status} />
                </div>
            </InfoCard>

            {data.origin_request?.requester_name && (
                <InfoCard title="Requested By" icon={<MessageSquare size={14} className="text-violet-500" />}>
                    <p className="text-sm font-semibold text-slate-800 mb-1">{data.origin_request.requester_name}</p>
                    {data.origin_request.justification && (
                        <p className="text-xs text-slate-500 italic">"{data.origin_request.justification}"</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                        <Clock size={10} className="inline mr-1" />
                        {new Date(data.origin_request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </InfoCard>
            )}
        </div>
    );
};

export default SubscriptionSidebar;
