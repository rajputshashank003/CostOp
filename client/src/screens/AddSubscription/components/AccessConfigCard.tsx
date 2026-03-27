import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Search, Check } from "lucide-react";
import map from "lodash/map";
import size from "lodash/size";

interface AccessConfigCardProps {
    formData: any;
    filteredMembers: any[];
    designationFilter: string;
    setDesignationFilter: (v: string) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    toggleUserAssignment: (userId: number) => void;
    handleSelectAllVisible: () => void;
}

const AccessConfigCard = ({
    formData, 
    filteredMembers, 
    designationFilter,
    setDesignationFilter, 
    setFormData, 
    toggleUserAssignment, 
    handleSelectAllVisible,
}: AccessConfigCardProps) => {
    return (
        <AnimatePresence>
            {(formData.plan_type === "Team" || formData.plan_type === "Organization") && formData.pricing_model === "per_seat" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Tag size={18} className="text-emerald-500" /> Access Configuration</h2>

                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Auto-Assign Access</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl max-w-sm mb-6">
                        <button type="button" onClick={() => setFormData((p: any) => ({ ...p, access_type: "all_members" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.access_type === "all_members" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Everyone in Scope</button>
                        <button type="button" onClick={() => setFormData((p: any) => ({ ...p, access_type: "selected_members" }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.access_type === "selected_members" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Selected Members</button>
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
                                {size(filteredMembers) === 0 && <p className="text-sm font-medium text-slate-400 text-center py-4">No members found.</p>}
                                {map(filteredMembers, (m: any) => {
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
    );
};

export default AccessConfigCard;
