import React from "react";
import { DollarSign, Briefcase, X } from "lucide-react";
import { SUBSCRIPTION_OPTIONS } from "../../../utils/constants";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import map from "lodash/map";

interface ToolDetailsCardProps {
    formData: any;
    categories: string[];
    isAddingCategory: boolean;
    newCategoryName: string;
    setNewCategoryName: (v: string) => void;
    setIsAddingCategory: (v: boolean) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleCategoryChange: (v: string) => void;
    handleAddNewCategory: (e?: React.SyntheticEvent) => void;
}

const ToolDetailsCard = ({
    formData, 
    categories, 
    isAddingCategory, 
    newCategoryName,
    setNewCategoryName, 
    setIsAddingCategory, 
    setFormData,
    handleChange, 
    handleCategoryChange, 
    handleAddNewCategory,
}: ToolDetailsCardProps) => {
    return (
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
                            <input value={newCategoryName} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewCategory(e); } }} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category..." className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" autoFocus />
                            <button onClick={handleAddNewCategory} type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Add</button>
                            <button onClick={() => { setIsAddingCategory(false); setFormData((p: any) => ({ ...p, category: categories[0] || "" })); }} type="button" className="px-3 bg-slate-100 text-slate-500 rounded-xl"><X size={16} /></button>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Cycle</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        {map(SUBSCRIPTION_OPTIONS.BILLING_CYCLES, cycle => (
                            <button key={cycle} type="button" onClick={() => setFormData((p: any) => ({ ...p, billing_cycle: cycle }))} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${formData.billing_cycle === cycle ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>{cycle}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolDetailsCard;
