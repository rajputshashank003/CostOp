import { useContext } from "react";
import { Users, Clock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import size from "lodash/size";
import map from "lodash/map";
import MembersContext from "../context";
import MoveTeamDropdown from "./MoveTeamDropdown";

export default function MembersRoster() {
    const { members, invites, handleRevoke, teams, allTeams, isLoading } = useContext(MembersContext);

    // Build team name lookup from allTeams
    const teamNameMap: Record<number, string> = {};
    for (const t of (allTeams || [])) {
        teamNameMap[t.id] = t.name;
    }

    return (
        <div className="grid grid-cols-1 space-y-4">

            {isLoading && (
                <div className="flex justify-center py-16">
                    <span className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></span>
                </div>
            )}

            {!isLoading && (
                <>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2 mt-4 flex items-center gap-2">
                        <Users size={16} /> Active Members ({size(members)})
                    </h3>

                    <AnimatePresence>
                        {map(members, (m: any) => {
                            const isAdmin = teams.some((t: any) => t.role === "owner");
                            const teamName = teamNameMap[m.team_id];

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={m.user.id}
                                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                >
                                    {/* Left: Avatar + Name + Email + Team */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={m.user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(m.user.name || "U")}
                                            alt="Avatar"
                                            className="w-11 h-11 rounded-full border border-slate-100 flex-shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name || "U")}&background=random`;
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-[15px] font-bold text-slate-900 leading-none">{m.user.name || "User"}</p>
                                                {m.has_subscription && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Has active subscriptions"></span>
                                                )}
                                            </div>
                                            <p className="text-[12px] font-semibold text-slate-400">{m.user.email}</p>
                                            {teamName && (
                                                <p className="text-[11px] font-semibold text-indigo-500 mt-0.5">📍 {teamName}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Badges + Role + Move */}
                                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-shrink-0 pl-14 sm:pl-0">
                                        {m.designation && (
                                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-600 tracking-wide capitalize">
                                                {m.designation}
                                            </span>
                                        )}
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                            {m.role}
                                        </span>

                                        {/* Admin: Move to Team dropdown */}
                                        {isAdmin && m.role !== "owner" && (
                                            <MoveTeamDropdown userId={m.user.id} currentTeamId={m.team_id} />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {members.length === 0 && (
                            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-500 font-bold mb-1">No active members found</p>
                                <p className="text-sm text-slate-400">Try adjusting your search or subscription filters.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {size(invites) > 0 && (
                        <>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2 mt-8 flex items-center gap-2">
                                <Clock size={16} /> Pending Invites ({size(invites)})
                            </h3>

                            <AnimatePresence>
                                {map(invites, (inv: any) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={inv.id}
                                        className="bg-white rounded-2xl p-4 border border-dashed border-slate-300 shadow-sm flex items-center justify-between opacity-80"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-bold text-slate-700 leading-none mb-1.5">{inv.email}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {inv.designation && (
                                                        <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-600 tracking-wide capitalize">
                                                            {inv.designation}
                                                        </span>
                                                    )}
                                                    <p className="text-[13px] font-semibold text-amber-600 flex items-center gap-1">Waiting to join...</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRevoke(inv.id)} className="text-sm font-bold text-red-500 hover:text-red-700 hover:underline transition-colors px-3 py-1.5 cursor-pointer">
                                            Revoke
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
