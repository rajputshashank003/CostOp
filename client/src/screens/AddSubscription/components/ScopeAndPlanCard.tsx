import React from "react";
import { Building, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { SUBSCRIPTION_OPTIONS } from "../../../utils/constants";
import map from "lodash/map";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";

interface ScopeAndPlanCardProps {
    formData: any;
    teams: { id: number; name: string }[];
    isAddingTeam: boolean;
    newTeamName: string;
    setNewTeamName: (v: string) => void;
    setIsAddingTeam: (v: boolean) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    handleTeamChange: (v: string) => void;
    handleAddNewTeam: (e?: React.SyntheticEvent) => void;
}

const ScopeAndPlanCard = ({
    formData, 
    teams, 
    isAddingTeam, 
    newTeamName,
    setNewTeamName, 
    setIsAddingTeam, 
    setFormData,
    handleTeamChange, 
    handleAddNewTeam,
}: ScopeAndPlanCardProps) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building size={18} className="text-emerald-500" /> Scope &amp; Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Scope / Visibility</label>
                    <div className="grid grid-cols-3 gap-2">
                        {map(SUBSCRIPTION_OPTIONS.PLAN_TYPES, type => (
                            <div key={type} onClick={() => setFormData((p: any) => ({ ...p, plan_type: type }))} className={`border p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formData.plan_type === type ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>
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
                            <CustomSelect options={[...map(teams, t => String(t.id)), "+ Add New Team"]} value={String(formData.team_id)} onChange={handleTeamChange} renderLabel={(val: string) => val === "+ Add New Team" ? val : teams.find(t => String(t.id) === val)?.name || val} />
                        ) : (
                            <div className="flex gap-2">
                                <input value={newTeamName} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTeam(e); } }} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name..." className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" autoFocus />
                                <button onClick={handleAddNewTeam} type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Add</button>
                                <button onClick={() => { setIsAddingTeam(false); setFormData((p: any) => ({ ...p, team_id: teams[0]?.id || null })); }} type="button" className="px-3 bg-slate-100 text-slate-500 rounded-xl"><X size={16} /></button>
                            </div>
                        )}
                    </motion.div>
                )}

                {(formData.plan_type === "Organization" || formData.plan_type === "Team") && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pricing Model</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl">
                            <button type="button" onClick={() => setFormData((p: any) => ({ ...p, pricing_model: "per_seat" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.pricing_model === "per_seat" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Per Seat</button>
                            <button type="button" onClick={() => setFormData((p: any) => ({ ...p, pricing_model: "site_license" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.pricing_model === "site_license" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Site License (Unlimited)</button>
                        </div>
                    </motion.div>
                )}

                {formData.pricing_model === "per_seat" && formData.plan_type !== "Individual" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Seats Included</label>
                        <input name="seat_count" type="number" min="1" value={formData.seat_count} onChange={(e) => setFormData((p: any) => ({ ...p, seat_count: parseInt(e.target.value, 10) }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-lg" />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ScopeAndPlanCard;
