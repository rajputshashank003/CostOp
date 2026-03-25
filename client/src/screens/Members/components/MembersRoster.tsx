import { useContext } from "react";
import { Users, Clock, Mail, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import size from "lodash/size";
import map from "lodash/map";
import MembersContext from "../context";

export default function MembersRoster() {
    const { members, invites, handleRevoke, handleMoveToTeam, teams, selectedTeamId, setSelectedTeamId } = useContext(MembersContext);

    return (
        <div className="grid grid-cols-1 space-y-4">

            {/* Team Tabs — only shown when user belongs to multiple teams */}
            {teams.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-2">
                    {map(teams, (t: any) => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTeamId(t.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer ${selectedTeamId === t.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
                                }`}
                        >
                            {t.name}
                            <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-md ${selectedTeamId === t.id ? "bg-emerald-500" : "bg-slate-100 text-slate-500"}`}>
                                {t.role}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2 mt-4 flex items-center gap-2">
                <Users size={16} /> Active Members ({size(members)})
            </h3>

            <AnimatePresence>
                {map(members, (m: any) => {
                    const currentTeamRole = teams.find((t: any) => t.id === selectedTeamId)?.role;
                    const isAdmin = currentTeamRole === "owner";
                    const otherTeams = teams.filter((t: any) => t.id !== selectedTeamId);

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={m.user.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <img
                                    src={m.user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(m.user.name || "U")}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full border border-slate-100 flex-shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name || "U")}&background=random`;
                                    }}
                                />
                                <div className="min-w-0">
                                    <p className="text-[15px] font-bold text-slate-900 leading-none mb-1.5 truncate">{m.user.name || "User"}</p>
                                    <p className="text-[13px] font-semibold text-slate-500 truncate">{m.user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {m.designation && (
                                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 tracking-wide capitalize">
                                        {m.designation}
                                    </span>
                                )}
                                <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    {m.role}
                                </span>

                                {/* Admin: Move to Team dropdown */}
                                {isAdmin && m.role !== "owner" && otherTeams.length > 0 && (
                                    <div className="relative group">
                                        <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-200 cursor-pointer">
                                            <ArrowRightLeft size={13} />
                                            <span className="hidden sm:inline">Move</span>
                                        </button>
                                        <div className="absolute right-0 top-8 z-20 hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                                            {otherTeams.map((t: any) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleMoveToTeam(m.user.id, t.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
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
        </div>
    );
}
