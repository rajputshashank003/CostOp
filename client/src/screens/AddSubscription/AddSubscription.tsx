import React, { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, Users, Briefcase, Building, Tag, Check, ArrowLeft, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { SUBSCRIPTION_OPTIONS } from "../../utils/constants";
import map from "lodash/map";
import size from "lodash/size";
import filter from "lodash/filter";
import head from "lodash/head";
import split from "lodash/split";
import sortBy from "lodash/sortBy";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import DatePicker from "../../components/DatePicker/DatePicker";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { requestsApi } from "../../utils/api_request/requests";
import { categoriesApi } from "../../utils/api_request/categories";
import { teamsApi } from "../../utils/api_request/teams";
import { membersApi } from "../../utils/api_request/members";

export default function AddSubscription() {
    const navigate = useNavigate();
    const location = useLocation();
    const originRequest = location.state?.request || null;
    const isRequestMode = location.state?.mode === "request"; // Regular team member submitting a request
    const [isLoading, setIsLoading] = useState(false);

    // Core Form Data
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        plan_type: head(SUBSCRIPTION_OPTIONS.PLAN_TYPES) as string,
        team_id: null as number | null,
        billing_cycle: head(SUBSCRIPTION_OPTIONS.BILLING_CYCLES) as string,
        cost: "",
        start_date: head(split(new Date().toISOString(), "T")) as string,
        is_auto_pay: true,

        // Advanced Access Control
        pricing_model: "per_seat" as "per_seat" | "site_license",
        seat_count: 1,
        access_type: "all_members" as "all_members" | "selected_members",
        assigned_user_ids: [] as number[],
        origin_request_id: originRequest?.id || null,
        requester_id: originRequest?.requester_id || null
    });

    const [categories, setCategories] = useState<string[]>([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");

    // Members & Assignments state
    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const [designationFilter, setDesignationFilter] = useState("");

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await categoriesApi.get_all();
                const fetchedCats = map(catRes, (c: any) => c.name);
                setCategories(fetchedCats);

                // If it's a new form without request prepopulation
                if (!originRequest && size(fetchedCats) > 0) {
                    setFormData(p => ({ ...p, category: head(fetchedCats) || "" }));
                }

                const teamRes = await teamsApi.get_all();
                setTeams(teamRes || []);
                if (!originRequest && size(teamRes) > 0) {
                    setFormData(p => ({ ...p, team_id: teamRes[0].id }));
                }
            } catch (err) { }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (originRequest) {
            setFormData(p => ({
                ...p,
                name: originRequest.name || "",
                category: originRequest.category || "",
                plan_type: originRequest.plan_type || p.plan_type,
                billing_cycle: originRequest.billing_cycle || p.billing_cycle,
                cost: originRequest.cost ? String(originRequest.cost) : "",
                seat_count: originRequest.seat_count || 1,
                team_id: originRequest.team_id || p.team_id,
            }));
        }
    }, [originRequest]);

    // Fetch members when scope/team changes
    useEffect(() => {
        const fetchScopeMembers = async () => {
            try {
                if (formData.plan_type === "Organization") {
                    const res = await membersApi.get_all();
                    setAvailableMembers(res.members || []);
                } else if (formData.team_id) {
                    const res = await membersApi.get_by_team(formData.team_id);
                    setAvailableMembers(res.members || []);
                } else {
                    setAvailableMembers([]);
                }
            } catch (err) { }
        };
        fetchScopeMembers();
    }, [formData.plan_type, formData.team_id]);

    // Force constraints based on toggles
    useEffect(() => {
        if (formData.pricing_model === "site_license") {
            setFormData(p => ({ ...p, access_type: "all_members" }));
        }
    }, [formData.pricing_model]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Category / Team handlers
    const handleCategoryChange = (v: string) => {
        if (v === "+ Add New Category") { setIsAddingCategory(true); setFormData(p => ({ ...p, category: "" })); }
        else { setIsAddingCategory(false); setFormData(p => ({ ...p, category: v })); }
    };
    const handleAddNewCategory = async (e?: React.SyntheticEvent) => {
        if (e) e.preventDefault();
        try {
            const res = await categoriesApi.create({ name: newCategoryName.trim() });
            setCategories(prev => sortBy([...prev, res.name]));
            setFormData(p => ({ ...p, category: res.name }));
            setIsAddingCategory(false); setNewCategoryName(""); toast.success("Category added!");
        } catch (err) { }
    };
    const handleTeamChange = (v: string) => {
        if (v === "+ Add New Team") { setIsAddingTeam(true); setFormData(p => ({ ...p, team_id: null })); }
        else { const tid = parseInt(v, 10); setIsAddingTeam(false); setFormData(p => ({ ...p, team_id: isNaN(tid) ? null : tid })); }
    };
    const handleAddNewTeam = async (e?: React.SyntheticEvent) => {
        if (e) e.preventDefault();
        try {
            const res = await teamsApi.create(newTeamName.trim());
            setTeams(prev => sortBy([...prev, { id: res.id, name: res.name }], 'name'));
            setFormData(p => ({ ...p, team_id: res.id }));
            setIsAddingTeam(false); setNewTeamName(""); toast.success("Team added!");
        } catch (err) { }
    };

    // Seat Assignment Logic
    const toggleUserAssignment = (userId: number) => {
        setFormData(p => {
            if (p.assigned_user_ids.includes(userId)) return { ...p, assigned_user_ids: p.assigned_user_ids.filter(id => id !== userId) };
            if (p.assigned_user_ids.length >= p.seat_count) { toast.error(`You have reached the maximum seat count of ${p.seat_count}.`); return p; }
            return { ...p, assigned_user_ids: [...p.assigned_user_ids, userId] };
        });
    };

    const filteredMembers = useMemo(() => {
        if (!designationFilter) return availableMembers;
        return filter(availableMembers, m => m.designation?.toLowerCase().includes(designationFilter.toLowerCase()));
    }, [availableMembers, designationFilter]);

    const handleSelectAllVisible = () => {
        setFormData(p => {
            let currentSelections = [...p.assigned_user_ids];
            for (const m of filteredMembers) {
                if (currentSelections.length >= p.seat_count) { toast.error(`Seat limit reached (${p.seat_count} max).`); break; }
                if (!currentSelections.includes(m.user.id)) currentSelections.push(m.user.id);
            }
            return { ...p, assigned_user_ids: currentSelections };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || (!isRequestMode && !formData.cost) || (formData.pricing_model === "per_seat" && formData.seat_count < 1)) {
            toast.error("Please fill in all required fields!"); return;
        }
        setIsLoading(true);
        try {
            if (isRequestMode) {
                // Regular user: submit as a pending request for admin approval
                await requestsApi.create({
                    name: formData.name,
                    category: formData.category,
                    plan_type: formData.plan_type,
                    billing_cycle: formData.billing_cycle,
                    cost: parseFloat(formData.cost) || 0,
                    seat_count: formData.seat_count,
                    scope: formData.plan_type === "Organization" ? "organization" : formData.plan_type === "Team" ? "team" : "individual",
                    justification: "",
                });
                toast.success("Request submitted! Waiting for admin approval.");
                navigate("/requests");
            } else {
                // Admin: create the subscription directly
                const startDate = new Date(formData.start_date);
                const nextBillingDate = new Date(startDate);
                if (formData.billing_cycle === "Monthly") nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                else nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

                const payload: any = {
                    name: formData.name, category: formData.category, plan_type: formData.plan_type,
                    billing_cycle: formData.billing_cycle, cost: parseFloat(formData.cost),
                    start_date: startDate.toISOString(), next_billing_date: nextBillingDate.toISOString(),
                    is_auto_pay: formData.is_auto_pay,
                    seat_count: formData.pricing_model === "site_license" ? 999999 : parseInt(formData.seat_count.toString(), 10),
                    assigned_user_ids: formData.access_type === "all_members" ? map(availableMembers, m => m.user.id) : formData.assigned_user_ids
                };

                if (formData.origin_request_id) {
                    payload.origin_request_id = formData.origin_request_id;
                    payload.owner_id = formData.requester_id;
                }

                if (formData.plan_type === "Organization") { payload.scope = "organization"; }
                else if (formData.plan_type === "Team" && formData.team_id) { payload.scope = "team"; payload.team_id = formData.team_id; }
                else { payload.scope = "individual"; }

                await subscriptionsApi.create(payload);
                toast.success("Subscription added with access configurations!");
                navigate("/home");
            }
        } catch (err) { } finally { setIsLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 pt-4 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-start gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 mt-1.5 bg-white text-slate-500 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-all border border-slate-200">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            {isRequestMode ? "Request a Subscription" : originRequest ? "Approve Subscription" : "Add Subscription"}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {isRequestMode ? "Fill in details and submit for admin approval." : "Link a new tool to track cost and manage seat assignments."}
                        </p>
                    </div>
                </div>
                {originRequest && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 hidden sm:block">
                        Fulfilling Request from {originRequest.requester_name || "Team Member"}
                    </div>
                )}
                {isRequestMode && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 hidden sm:block">
                        Pending admin review
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* TOOL DETAILS CARD */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-emerald-500" /> Tool Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tool Name *</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Figma, GitHub" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cost (USD) *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input name="cost" type="number" step="0.01" min="0" value={formData.cost} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                            {!isAddingCategory ? (
                                <CustomSelect options={[...categories, "+ Add New Category"]} value={formData.category} onChange={handleCategoryChange} />
                            ) : (
                                <div className="flex gap-2">
                                    <input value={newCategoryName} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewCategory(e); } }} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category..." className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" autoFocus />
                                    <button onClick={handleAddNewCategory} type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Add</button>
                                    <button onClick={() => { setIsAddingCategory(false); setFormData(p => ({ ...p, category: categories[0] || "" })); }} type="button" className="px-3 bg-slate-100 text-slate-500 rounded-xl"><X size={16} /></button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Cycle</label>
                            <div className="flex bg-slate-100 p-1.5 rounded-xl">
                                {SUBSCRIPTION_OPTIONS.BILLING_CYCLES.map(cycle => (
                                    <button key={cycle} type="button" onClick={() => setFormData(p => ({ ...p, billing_cycle: cycle }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.billing_cycle === cycle ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>{cycle}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PLAN DETAILS CARD */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building size={18} className="text-emerald-500" /> Scope & Plan</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Scope / Visibility</label>
                            <div className="grid grid-cols-3 gap-2">
                                {SUBSCRIPTION_OPTIONS.PLAN_TYPES.map(type => (
                                    <div key={type} onClick={() => setFormData(p => ({ ...p, plan_type: type }))} className={`border p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formData.plan_type === type ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>
                                        {type === "Individual" ? <Users size={16} /> : type === "Team" ? <Users size={18} /> : <Building size={18} />}
                                        <span className="text-xs font-bold">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formData.plan_type === "Team" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Team</label>
                                {!isAddingTeam ? (
                                    <CustomSelect options={[...map(teams, t => String(t.id)), "+ Add New Team"]} value={String(formData.team_id)} onChange={handleTeamChange} renderLabel={(val) => val === "+ Add New Team" ? val : teams.find(t => String(t.id) === val)?.name || val} />
                                ) : (
                                    <div className="flex gap-2">
                                        <input value={newTeamName} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTeam(e); } }} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name..." className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" autoFocus />
                                        <button onClick={handleAddNewTeam} type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Add</button>
                                        <button onClick={() => { setIsAddingTeam(false); setFormData(p => ({ ...p, team_id: teams[0]?.id || null })); }} type="button" className="px-3 bg-slate-100 text-slate-500 rounded-xl"><X size={16} /></button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {(formData.plan_type === "Organization" || formData.plan_type === "Team") && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pricing Model</label>
                                <div className="flex bg-slate-100 p-1.5 rounded-xl">
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, pricing_model: "per_seat" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.pricing_model === "per_seat" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Per Seat</button>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, pricing_model: "site_license" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.pricing_model === "site_license" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Site License (Unlimited)</button>
                                </div>
                            </motion.div>
                        )}

                        {formData.pricing_model === "per_seat" && formData.plan_type !== "Individual" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Seats Included</label>
                                <input name="seat_count" type="number" min="1" value={formData.seat_count} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-lg" />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* ACCESS CONFIGURATION - ONLY FOR PER-SEAT */}
                <AnimatePresence>
                    {(formData.plan_type === "Team" || formData.plan_type === "Organization") && formData.pricing_model === "per_seat" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Tag size={18} className="text-emerald-500" /> Access Configuration</h2>

                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Auto-Assign Access</label>
                            <div className="flex bg-slate-100 p-1.5 rounded-xl max-w-sm mb-6">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, access_type: "all_members" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.access_type === "all_members" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Everyone in Scope</button>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, access_type: "selected_members" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.access_type === "selected_members" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Selected Members</button>
                            </div>

                            {formData.access_type === "selected_members" && (
                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                                    <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 flex-1 max-w-sm">
                                            <Search size={16} className="text-slate-400" />
                                            <input type="text" placeholder="Filter by Designation (e.g. backend)" value={designationFilter} onChange={(e) => setDesignationFilter(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-700" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-slate-500">{formData.assigned_user_ids.length} of {formData.seat_count} seats allocated</span>
                                            <button type="button" onClick={handleSelectAllVisible} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Select All Visible</button>
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                                        {filteredMembers.length === 0 && <p className="text-sm font-medium text-slate-400 text-center py-4">No members found.</p>}
                                        {filteredMembers.map((m: any) => {
                                            const isSelected = formData.assigned_user_ids.includes(m.user.id);
                                            return (
                                                <div key={m.user.id} onClick={() => toggleUserAssignment(m.user.id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                                        </div>
                                                        <p className="font-bold text-sm text-slate-700">{m.user.name}</p>
                                                    </div>
                                                    {m.designation && <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 uppercase">{m.designation}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* START DATE */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold">
                        <DatePicker
                            value={formData.start_date}
                            onChange={(d) => setFormData(p => ({ ...p, start_date: d }))}
                        />
                    </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center min-w-[180px]">
                        {isLoading
                            ? <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                            : isRequestMode ? "Submit Request" : "Track Subscription"
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
