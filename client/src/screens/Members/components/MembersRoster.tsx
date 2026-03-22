import { useContext } from "react";
import { Users, Clock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import size from "lodash/size";
import map from "lodash/map";
import MembersContext from "../context";

export default function MembersRoster() {
    const { members, invites, handleRevoke } = useContext(MembersContext);

    return (
        <div className="grid grid-cols-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2 mt-4 flex items-center gap-2">
                <Users size={16} /> Active Members ({size(members)})
            </h3>

            <AnimatePresence>
                {map(members, (m: any) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={m.user.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={m.user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(m.user.name || "U")}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full border border-slate-100"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name || "U")}&background=random`;
                                }}
                            />
                            <div>
                                <p className="text-[15px] font-bold text-slate-900 leading-none mb-1.5">{m.user.name || "User"}</p>
                                <p className="text-[13px] font-semibold text-slate-500">{m.user.email}</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {m.role}
                        </div>
                    </motion.div>
                ))}
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
                                        <p className="text-[13px] font-semibold text-amber-600 flex items-center gap-1">Waiting to join...</p>
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
