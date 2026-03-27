import React, { useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryIcon } from "../../../utils/helpers";
import { getLogoUrl } from "../../../services/logoService";
import SubscriptionDetailContext from "../context";

const SubscriptionDetailHeader = () => {
    const { sub, imgError, setImgError, initial, navigate } = useContext(SubscriptionDetailContext);
    const logoUrl = !imgError ? getLogoUrl(sub.name) : null;

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
                <ArrowLeft size={20} />
            </motion.button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 font-extrabold text-sm overflow-hidden">
                    {logoUrl ? (
                        <img src={logoUrl} alt={sub.name} onError={() => setImgError(true)} className="w-6 h-6 object-contain" />
                    ) : (
                        initial
                    )}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">{sub.name}</h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md tracking-wide uppercase">
                        {getCategoryIcon(sub.category, 10)} {sub.category}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDetailHeader;
