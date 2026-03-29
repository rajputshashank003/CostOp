import React, { useContext, useState, useEffect } from "react";
import { Plus, X, Search, Users, UserPlus, Shield } from "lucide-react";
import SubscriptionDetailContext from "../context";
import { subscriptionsApi } from "../../../utils/api_request/subscriptions";
import { teamsApi } from "../../../utils/api_request/teams";
import { membersApi } from "../../../utils/api_request/members";
import { useUser } from "../../../hooks/useUser";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import head from 'lodash/head';
import map from 'lodash/map';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import upperCase from 'lodash/upperCase';
import find from 'lodash/find';
import lowerCase from 'lodash/lowerCase';

const AccessManagement = () => {
    const { data, refreshData } = useContext(SubscriptionDetailContext);
    const { user } = useUser();
    const isAdmin = !!user?.is_admin;

    const [showTeamPicker, setShowTeamPicker] = useState(false);
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [teams, setTeams] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [teamSearch, setTeamSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Confirmation modal state
    const [revokeTeam, setRevokeTeam] = useState<{ id: number; name: string } | null>(null);
    const [removeUser, setRemoveUser] = useState<{ id: number; name: string } | null>(null);

    const subId = data?.subscription?.id;
    const grantedTeamIds = map(data?.granted_teams || [], 'team_id');
    const assignedUserIds = map(data?.assigned_users || [], 'user_id');

    const handleGrantTeam = async (teamId: number) => {
        setLoading(true);
        try {
            await subscriptionsApi.grantTeam(subId, teamId);
            setShowTeamPicker(false);
            refreshData();
        } catch (err: any) {
            alert(err?.error || "Failed to grant team access");
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeTeam = async (teamId: number) => {
        setLoading(true);
        try {
            await subscriptionsApi.revokeTeam(subId, teamId);
            setRevokeTeam(null);
            refreshData();
        } catch {
            alert("Failed to revoke team access");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignUser = async (userId: number) => {
        setLoading(true);
        try {
            await subscriptionsApi.assignUser(subId, userId);
            setShowUserPicker(false);
            refreshData();
        } catch (err: any) {
            alert(err?.error || "Failed to assign user");
        } finally {
            setLoading(false);
        }
    };

    const handleUnassignUser = async (userId: number) => {
        setLoading(true);
        try {
            await subscriptionsApi.unassignUser(subId, userId);
            setRemoveUser(null);
            refreshData();
        } catch {
            alert("Failed to remove user");
        } finally {
            setLoading(false);
        }
    };

    // Fetch available teams when picker opens
    useEffect(() => {
        if (!showTeamPicker) return;
        const fetchTeams = async () => {
            try {
                const res = await teamsApi.get_all();
                setTeams(Array.isArray(res) ? res : res?.teams || []);
            } catch { }
        }
        fetchTeams();
    }, [showTeamPicker]);

    // Fetch ALL workspace members for individual assignment
    useEffect(() => {
        if (!showUserPicker) return;
        const fetchMembers = async () => {
            try {
                const res = await membersApi.get_all();
                const allMembers = res?.members || [];
                // Normalize to { user_id, name, email, avatar_url }
                setTeamMembers(map(allMembers, (m: any) => ({
                    user_id: m.user?.id || m.user_id,
                    name: m.user?.name || m.name,
                    email: m.user?.email || m.email,
                    avatar_url: m.user?.avatar_url || m.avatar_url,
                })));
            } catch { }
        };
        fetchMembers();
    }, [showUserPicker]);

    if (!isAdmin) return null;

    const filteredTeams = filter(teams,
        (t: any) => !includes(grantedTeamIds, t.id) && lowerCase(t.name).includes(teamSearch.toLowerCase())
    );
    const filteredMembers = filter(teamMembers,
        (m: any) => !includes(assignedUserIds, m.user_id) && (lowerCase(m.name).includes(userSearch.toLowerCase()) || lowerCase(m.email).includes(userSearch.toLowerCase()))
    );

    return (
        <div className="lg:col-span-3 space-y-6">
            {/* Manage Access Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Shield size={16} className="text-emerald-500" />
                        Manage Access
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-xs font-semibold">Admin</span>
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowTeamPicker(!showTeamPicker); setShowUserPicker(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                            <Users size={14} /> Grant Team
                        </button>
                        <button
                            onClick={() => { setShowUserPicker(!showUserPicker); setShowTeamPicker(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                            <UserPlus size={14} /> Add Individual
                        </button>
                    </div>
                </div>

                {/* Team Picker Dropdown */}
                {showTeamPicker && (
                    <div className="border border-slate-200 rounded-xl p-3 mb-4 bg-slate-50/50">
                        <div className="relative mb-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={teamSearch}
                                onChange={(e) => setTeamSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {filteredTeams.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-2">No teams available</p>
                            ) : (
                                filteredTeams.map((t: any) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleGrantTeam(t.id)}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 text-left transition-colors"
                                    >
                                        <span className="text-sm font-medium text-slate-700">{t.name}</span>
                                        <Plus size={14} className="text-indigo-500" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* User Picker Dropdown */}
                {showUserPicker && (
                    <div className="border border-slate-200 rounded-xl p-3 mb-4 bg-slate-50/50">
                        <div className="relative mb-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {filteredMembers.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-2">No members available</p>
                            ) : (
                                filteredMembers.map((m: any) => (
                                    <button
                                        key={m.user_id}
                                        onClick={() => handleAssignUser(m.user_id)}
                                        disabled={loading}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 text-left transition-colors"
                                    >
                                        {m.avatar_url ? (
                                            <img src={m.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                                {m.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{m.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{m.email}</p>
                                        </div>
                                        <Plus size={14} className="text-emerald-500 shrink-0" />
                                    </button>
                                ))
                            )}
                        </div>
                        {data?.available_seats <= 0 && (
                            <p className="text-xs text-red-500 text-center mt-2 font-medium">No seats available</p>
                        )}
                    </div>
                )}

                {/* Granted Teams with Revoke */}
                {data?.granted_teams?.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Granted Teams</p>
                        {data.granted_teams.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-indigo-500" />
                                    <span className="text-sm font-semibold text-slate-800">{t.team_name}</span>
                                    <span className="text-xs text-slate-500">({t.member_count} members)</span>
                                </div>
                                <button
                                    onClick={() => setRevokeTeam({ id: t.team_id, name: t.team_name })}
                                    disabled={loading}
                                    className="p-1 rounded-md hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                                    title="Revoke team access"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Individual Assignments with Remove */}
                {data?.assigned_users?.length > 0 && (
                    <div className="space-y-2 mt-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Users</p>
                        {data.assigned_users.map((u: any) => {
                            const teamName = u.source === "team" && u.source_team_id
                                ? find(data.granted_teams || [], (t: any) => t.team_id === u.source_team_id)?.team_name
                                : null;
                            return (
                                <div key={u.assignment_id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-100">
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {upperCase(head(u.name))}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                                        <p className="text-xs text-slate-500 truncate hidden sm:block">{u.email}</p>
                                        {teamName && (
                                            <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">📍 {teamName}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {u.source === "team" ? (
                                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase hidden sm:inline">Team</span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase hidden sm:inline">Individual</span>
                                        )}
                                        <button
                                            onClick={() => setRemoveUser({ id: u.user_id, name: u.name })}
                                            disabled={loading}
                                            className="p-1 rounded-md hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                                            title="Remove access"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Revoke Team Confirmation Modal */}
            <ConfirmModal
                open={!!revokeTeam}
                onClose={() => setRevokeTeam(null)}
                onConfirm={() => revokeTeam && handleRevokeTeam(revokeTeam.id)}
                title="Revoke Team Access?"
                description={`Remove ${revokeTeam?.name || "this team"}'s access? All team-sourced seat assignments will be removed.`}
                confirmLabel="Yes, Revoke"
                loading={loading}
                icon={<Users size={32} />}
            />

            {/* Remove User Confirmation Modal */}
            <ConfirmModal
                open={!!removeUser}
                onClose={() => setRemoveUser(null)}
                onConfirm={() => removeUser && handleUnassignUser(removeUser.id)}
                title="Remove Access?"
                description={`Remove ${removeUser?.name || "this user"}'s access to this subscription?`}
                confirmLabel="Yes, Remove"
                loading={loading}
            />
        </div>
    );
};

export default AccessManagement;
