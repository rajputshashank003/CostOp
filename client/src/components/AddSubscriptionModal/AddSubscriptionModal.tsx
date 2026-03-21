import { useState, useRef, useEffect } from "react";
import { X, Calendar, DollarSign, Users, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../../hooks/useUser";
import { SUBSCRIPTION_OPTIONS } from "../../utils/constants";
import map from "lodash/map";
import CustomSelect from "../CustomSelect/CustomSelect";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { motion } from "framer-motion";

interface AddSubscriptionModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddSubscriptionModal({ onClose, onSuccess }: AddSubscriptionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: SUBSCRIPTION_OPTIONS.CATEGORIES[0],
        plan_type: SUBSCRIPTION_OPTIONS.PLAN_TYPES[0],
        team_name: "",
        team_members_count: 1,
        billing_cycle: SUBSCRIPTION_OPTIONS.BILLING_CYCLES[0],
        cost: "",
        start_date: new Date().toISOString().split("T")[0],
        is_auto_pay: true,
    });

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.cost) {
            toast.error("Name and Cost are required!");
            return;
        }

        setIsLoading(true);
        try {
            // Calculate next billing date logically based on start date and cycle
            const startDate = new Date(formData.start_date);
            const nextBillingDate = new Date(startDate);
            if (formData.billing_cycle === "Monthly") {
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            } else {
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            }

            const payload = {
                ...formData,
                cost: parseFloat(formData.cost),
                team_members_count: parseInt(formData.team_members_count.toString(), 10),
                start_date: startDate.toISOString(),
                next_billing_date: nextBillingDate.toISOString()
            };

            await subscriptionsApi.create(payload);

            toast.success("Subscription tracked successfully!");
            onSuccess();
        } catch (err) {
            // Toast automatically handled by api_request/utils.ts
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Subscription</h2>
                        <p className="text-[13px] text-slate-500 mt-1">Track a new software tool's cost and billing cycle.</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ rotate: 90 }}
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </motion.button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="add-sub-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Name & Cost */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tool Name</label>
                                <input
                                    type="text" name="name" required
                                    value={formData.name} onChange={handleChange}
                                    placeholder="e.g. Zoom, Slack"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Cost</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <DollarSign size={16} />
                                    </div>
                                    <input
                                        type="number" step="0.01" name="cost" required
                                        value={formData.cost} onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category & Billing Cycle */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Category</label>
                                <CustomSelect
                                    options={SUBSCRIPTION_OPTIONS.CATEGORIES}
                                    value={formData.category}
                                    onChange={(v) => setFormData(p => ({ ...p, category: v }))}
                                    icon={Briefcase}
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Billing Cycle</label>
                                <CustomSelect
                                    options={SUBSCRIPTION_OPTIONS.BILLING_CYCLES}
                                    value={formData.billing_cycle}
                                    onChange={(v) => setFormData(p => ({ ...p, billing_cycle: v }))}
                                />
                            </div>
                        </div>

                        {/* Plan Type */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Plan Type</label>
                            <div className="flex gap-4">
                                {map(SUBSCRIPTION_OPTIONS.PLAN_TYPES, (pt: string) => (
                                    <label key={pt} className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl cursor-pointer transition-all text-sm ${formData.plan_type === pt ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                                        <input type="radio" name="plan_type" value={pt} checked={formData.plan_type === pt} onChange={handleChange} className="hidden" />
                                        {pt === "Team" ? <Users size={18} /> : null}
                                        {pt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Auto Pay Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-100 mt-2">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700">Auto Pay</label>
                                <p className="text-[12px] text-slate-500 mt-0.5">Automatically renew this subscription</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="is_auto_pay" checked={formData.is_auto_pay} onChange={(e) => setFormData(p => ({ ...p, is_auto_pay: e.target.checked }))} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>

                        {/* Team Details (Dynamic) */}
                        {formData.plan_type === "Team" && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Team Name</label>
                                    <input type="text" name="team_name" value={formData.team_name} onChange={handleChange} placeholder="e.g. Design Team" className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Team Size</label>
                                    <input type="number" min="1" name="team_members_count" value={formData.team_members_count} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                                </div>
                            </div>
                        )}

                        {/* Start Date */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Start Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Calendar size={16} />
                                </div>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-700 cursor-text text-sm" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-3 mt-auto rounded-b-[1.5rem]">
                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm text-sm cursor-pointer">
                        Cancel
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} type="submit" form="add-sub-form" disabled={isLoading} className="px-4 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer">
                        {isLoading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : "Save Subscription"}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
