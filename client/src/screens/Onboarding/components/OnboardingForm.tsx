import React from "react";
import { motion } from "framer-motion";
import { Building2, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";

interface OnboardingFormProps {
    teamName: string;
    setTeamName: (v: string) => void;
    designation: string;
    setDesignation: (v: string) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}

const OnboardingForm = ({
    teamName, setTeamName,
    designation, setDesignation,
    isSubmitting, handleSubmit,
}: OnboardingFormProps) => {
    return (
        <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest pl-1">
                        Workspace Name
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Building2 size={18} />
                        </div>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                            placeholder="e.g. Acme Corp"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest pl-1 mt-2">
                        Your Role
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Briefcase size={18} />
                        </div>
                        <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                            placeholder="e.g. Head of Engineering"
                            required
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-6 w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-extrabold text-[15px] transition-all shadow-lg ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/25 cursor-pointer'}`}
                >
                    {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Continue to App <ArrowRight size={18} strokeWidth={2.5} /></>
                    )}
                </motion.button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
                <CheckCircle2 size={14} className="text-emerald-500" /> Auto-creates your isolated secure data vault
            </div>
        </div>
    );
};

export default OnboardingForm;
