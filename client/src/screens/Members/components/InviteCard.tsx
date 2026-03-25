import { useContext } from "react";
import { UserPlus, Mail, Tag } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import MembersContext from "../context";

export default function InviteCard() {
    const {
        teams, selectedTeamId,
        inviteEmail, setInviteEmail,
        inviteDesignation, setInviteDesignation,
        isInviting,
        generatedLink,
        handleInvite,
    } = useContext(MembersContext);

    const selectedTeamName = teams.find((t: any) => t.id === selectedTeamId)?.name || "Your Team";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-4 sm:p-6 mb-8 mt-2 sm:mt-4"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserPlus size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Invite Coworkers</h2>
                    <p className="text-[13px] text-slate-500 font-medium">
                        Inviting to <span className="font-bold text-slate-700">{selectedTeamName}</span>
                    </p>
                </div>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                    </div>
                    <input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                    />
                </div>
                <div className="relative flex-1 sm:max-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Tag size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Role (e.g. Frontend)"
                        value={inviteDesignation}
                        onChange={(e) => setInviteDesignation(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isInviting}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                    {isInviting ? <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin"></span> : "Create Invite"}
                </button>
            </form>

            {generatedLink && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Share this invite link:</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="w-full bg-white border border-slate-200 text-slate-600 text-[13px] font-medium py-2 pl-3 rounded-lg outline-none"
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedLink);
                                toast.success("Link copied!");
                            }}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
