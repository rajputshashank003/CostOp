import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CreditCard, Calendar, Briefcase, User, Crown, Clock, MessageSquare } from "lucide-react";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { getLogoUrl } from "../../services/logoService";
import { motion } from "framer-motion";
import Sidebar from "../../components/Sidebar/Sidebar";
import toUpper from "lodash/toUpper";
import head from "lodash/head";
import map from "lodash/map";
import size from "lodash/size";

export default function SubscriptionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        subscriptionsApi.get_by_id(id)
            .then((res: any) => setData(res))
            .catch(() => navigate("/home"))
            .finally(() => setIsLoading(false));
    }, [id, navigate]);

    if (isLoading || !data) {
        return (
            <div className="flex min-h-screen bg-[#f0f0f5]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    const sub = data.subscription;
    const logoUrl = !imgError ? getLogoUrl(sub.name) : null;
    const initial = sub.name ? toUpper(head(sub.name) as string) : "?";
    const seatPercent = data.seat_count > 0 ? Math.round((data.assigned_count / data.seat_count) * 100) : 0;

    let nextBilling = "TBD";
    if (sub.is_auto_pay === false) {
        nextBilling = "One Time";
    } else if (sub.next_billing_date) {
        nextBilling = new Date(sub.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 font-extrabold text-sm overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt={sub.name} onError={() => setImgError(true)} className="w-6 h-6 object-contain" />
                            ) : (
                                initial
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{sub.name}</h1>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md tracking-wide uppercase">
                                <Briefcase size={9} /> {sub.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard icon={<CreditCard size={18} />} label={sub.billing_cycle} value={formatter.format(sub.cost)} accent="emerald" />
                            <MetricCard icon={<Calendar size={18} />} label="Next Bill" value={nextBilling} accent="blue" />
                            <MetricCard icon={<Users size={18} />} label="Seats Used" value={`${data.assigned_count} / ${data.seat_count}`} accent="violet" />
                            <MetricCard icon={<Users size={18} />} label="Available" value={`${data.available_seats} seats`} accent="amber" />
                        </div>

                        {/* Seat Utilisation Bar */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-3">Seat Utilisation</h2>
                            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${seatPercent}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className={`h-full rounded-full ${seatPercent >= 90 ? 'bg-red-500' : seatPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{seatPercent}% utilised — {data.assigned_count} of {data.seat_count} seats assigned</p>
                        </div>

                        {/* Two-column layout: People / Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Assigned Users */}
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

                            {/* Sidebar Info */}
                            <div className="space-y-4">
                                {/* Owner */}
                                {data.owner?.name && (
                                    <InfoCard title="Owner" icon={<Crown size={14} className="text-amber-500" />}>
                                        <PersonRow avatar={data.owner.avatar_url} name={data.owner.name} email={data.owner.email} />
                                    </InfoCard>
                                )}

                                {/* Added By */}
                                {data.added_by?.name && (
                                    <InfoCard title="Added By" icon={<User size={14} className="text-slate-400" />}>
                                        <PersonRow avatar={data.added_by.avatar_url} name={data.added_by.name} email={data.added_by.email} />
                                    </InfoCard>
                                )}

                                {/* Team */}
                                {data.team?.name && (
                                    <InfoCard title="Team" icon={<Users size={14} className="text-indigo-500" />}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800">{data.team.name}</span>
                                            <span className="text-xs text-slate-500">({data.team.member_count} members)</span>
                                        </div>
                                    </InfoCard>
                                )}

                                {/* Subscription Details */}
                                <InfoCard title="Details" icon={<Briefcase size={14} className="text-emerald-500" />}>
                                    <div className="space-y-2 text-sm">
                                        <DetailRow label="Plan Type" value={sub.plan_type} />
                                        <DetailRow label="Scope" value={sub.scope || "team"} />
                                        <DetailRow label="Auto Pay" value={sub.is_auto_pay ? "Yes" : "No"} />
                                        <DetailRow label="Start Date" value={new Date(sub.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                                        <DetailRow label="Status" value={sub.status} />
                                    </div>
                                </InfoCard>

                                {/* Origin Request */}
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
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ── Helper Components ────────────────────────────────────────────── */

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
        <div className={`rounded-2xl border p-5 ${colors[accent]} bg-white`}>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold opacity-70 mb-1">{icon} {label}</div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900">{value}</div>
        </div>
    );
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">{icon} {title}</h3>
            {children}
        </div>
    );
}

function PersonRow({ avatar, name, email }: { avatar?: string; name: string; email: string }) {
    return (
        <div className="flex items-center gap-3">
            {avatar ? (
                <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{head(name)}</div>
            )}
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="font-semibold text-slate-800 capitalize">{value}</span>
        </div>
    );
}
