import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { SUBSCRIPTION_OPTIONS } from "../../utils/constants";
import map from "lodash/map";
import size from "lodash/size";
import filter from "lodash/filter";
import head from "lodash/head";
import split from "lodash/split";
import sortBy from "lodash/sortBy";
import includes from "lodash/includes";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { requestsApi } from "../../utils/api_request/requests";
import { categoriesApi } from "../../utils/api_request/categories";
import { teamsApi } from "../../utils/api_request/teams";
import { membersApi } from "../../utils/api_request/members";
import React from "react";

const useAddSubscriptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const originRequest = location.state?.request || null;
    const isRequestMode = location.state?.mode === "request";
    const [isLoading, setIsLoading] = useState(false);

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

    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const [designationFilter, setDesignationFilter] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                if (!includes(currentSelections, m.user.id)) currentSelections.push(m.user.id);
            }
            return { ...p, assigned_user_ids: currentSelections };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || (!isRequestMode && !formData.cost) || (formData.pricing_model === "per_seat" && formData.seat_count < 1)) {
            toast.error("Please fill in all required fields!"); return;
        }
        // Block submit if "Everyone in Scope" but seats < team members
        if (!isRequestMode && formData.pricing_model === "per_seat" && formData.access_type === "all_members" && availableMembers.length > formData.seat_count) {
            toast.error(`Not enough seats (${formData.seat_count}) for all ${availableMembers.length} members. Please select specific members.`);
            setFormData(p => ({ ...p, access_type: "selected_members" }));
            return;
        }
        setIsLoading(true);
        try {
            if (isRequestMode) {
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
                else if (formData.plan_type === "Team" && formData.team_id) { payload.scope = "team"; payload.team_ids = [formData.team_id]; }
                else { payload.scope = "individual"; }

                await subscriptionsApi.create(payload);
                toast.success("Subscription added with access configurations!");
                navigate("/home");
            }
        } catch (err) { } finally { setIsLoading(false); }
    };

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await categoriesApi.get_all();
                const fetchedCats = map(catRes, (c: any) => c.name);
                setCategories(fetchedCats);

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

    useEffect(() => {
        if (formData.pricing_model === "site_license") {
            setFormData(p => ({ ...p, access_type: "all_members" }));
        }
    }, [formData.pricing_model]);

    // Auto-switch to "Selected Members" when seats are fewer than available members
    useEffect(() => {
        if (
            formData.pricing_model === "per_seat" &&
            formData.access_type === "all_members" &&
            availableMembers.length > formData.seat_count
        ) {
            setFormData(p => ({ ...p, access_type: "selected_members" }));
            toast.error(`Only ${formData.seat_count} seat(s) for ${availableMembers.length} members — please select who gets access.`);
        }
    }, [formData.seat_count, formData.pricing_model, availableMembers.length]);

    return {
        navigate,
        originRequest,
        isRequestMode,
        isLoading,
        formData,
        setFormData,
        categories,
        isAddingCategory,
        setIsAddingCategory,
        newCategoryName,
        setNewCategoryName,
        teams,
        isAddingTeam,
        setIsAddingTeam,
        newTeamName,
        setNewTeamName,
        availableMembers,
        designationFilter,
        setDesignationFilter,
        filteredMembers,
        handleChange,
        handleCategoryChange,
        handleAddNewCategory,
        handleTeamChange,
        handleAddNewTeam,
        toggleUserAssignment,
        handleSelectAllVisible,
        handleSubmit,
    };
};

export default useAddSubscriptions;