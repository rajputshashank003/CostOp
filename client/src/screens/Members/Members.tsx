import { useState, useEffect } from "react";
import map from "lodash/map";
import size from "lodash/size";
import { Users, Mail, UserPlus, Clock } from "lucide-react";
import { membersApi } from "../../utils/api_request/members";
import Sidebar from "../../components/Sidebar/Sidebar";
import MobileNav from "../../components/MobileNav/MobileNav";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import MembersSkeleton from "../../components/Skeleton/MembersSkeleton";

export default function Members() {
    const { user, isLoading: isAuthLoading } = useUser();
    const [members, setMembers] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");

    const fetchRoster = () => {
        setIsLoading(true);
        membersApi.get_all()
            .then(data => {
                setMembers(data.members || []);
                setInvites(data.invites || []);
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (!isAuthLoading) {
            fetchRoster();
        }
    }, [isAuthLoading]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        setGeneratedLink("");
        try {
            const res = await membersApi.invite(inviteEmail);
            toast.success("Invitation created! You can copy the link.");
            if (res.invite_link) {
                setGeneratedLink(res.invite_link);
            }
            setInviteEmail("");
            fetchRoster(); // Refresh to show pending invite
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to send invitation.");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            await membersApi.revoke(id);
            toast.success("Invite revoked successfully");
            fetchRoster(); // Remount lists
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to revoke invite.");
        }
    };

    if (isLoading || isAuthLoading) {
        return <MembersSkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3 relative z-[60]">
                        <MobileNav />
                        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Workspace Members</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-[13px] text-slate-500 truncate max-w-[120px] lg:max-w-none">{user.email}</p>
                                </div>
                                <img
                                    src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U")}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border border-slate-200"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random`;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full">

                    {/* Invite Card */}
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
                                <p className="text-[13px] text-slate-500 font-medium">Add members to track SaaS tools together.</p>
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

                    {/* Roster Layout */}
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
                </div>
            </main>
        </div>
    );
}
