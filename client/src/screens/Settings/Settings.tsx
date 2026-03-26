import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Building2, Shield, Settings2, Users } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import utils from "../../utils/api_request/utils";
import toast from "react-hot-toast";

export default function Settings() {
    const { user, isLoading } = useUser();

    const [teamName, setTeamName] = useState("");
    const [allowInvites, setAllowInvites] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!user?.default_team_id) return;

        utils.request({ url: `/teams/${user.default_team_id}`, method: 'GET' })
            .then((team: any) => {
                setTeamName(team.name || "");
                setAllowInvites(team.allow_member_invites ?? true);
            })
            .catch(console.error)
            .finally(() => setIsFetching(false));
    }, [user?.default_team_id]);

    const handleSave = async () => {
        if (!teamName) return;
        setIsSaving(true);
        try {
            await utils.request({
                url: `/teams/${user?.default_team_id}/settings`,
                method: 'PATCH',
                data: {
                    name: teamName,
                    allow_member_invites: allowInvites
                }
            });
            toast.success("Workspace settings updated!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isFetching) {
        return <div className="flex h-screen items-center justify-center bg-[#f0f0f5]"><span className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></span></div>;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-inner">
                        <Settings2 size={20} className="text-slate-500" />
                    </div>
                    <div>
                        <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-none mb-1">Organization Settings</h1>
                        <p className="text-[13px] font-semibold text-slate-500">Manage your workspace configuration and policies</p>
                    </div>
                </header>

                <div className="p-4 sm:p-8 max-w-4xl w-full mx-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 leading-none mb-1">Workspace Profile</h3>
                                <p className="text-[13px] font-medium text-slate-500">Update your company's core identity</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest pl-1 mb-2 block">
                                Organization Name
                            </label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full max-w-md px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 leading-none mb-1">Security & Privileges</h3>
                                <p className="text-[13px] font-medium text-slate-500">Control who can perform administrative actions</p>
                            </div>
                        </div>
                        <div className="p-6 flex items-start sm:items-center justify-between gap-6 flex-col sm:flex-row">
                            <div className="flex gap-4">
                                <div className="mt-1 w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-slate-800 mb-1">Allow Member Invitations</h4>
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-lg">
                                        When enabled, any active member can invite coworkers to this workspace. If disabled, only <span className="font-bold text-indigo-600">Owners</span> can send invites.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setAllowInvites(!allowInvites)}
                                className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 cursor-pointer shadow-inner ${allowInvites ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${allowInvites ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-8 py-3.5 rounded-xl text-white font-extrabold text-[15px] transition-all shadow-lg flex items-center gap-2 ${isSaving ? 'bg-emerald-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/25 cursor-pointer'}`}
                        >
                            {isSaving ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Save Preferences'
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
