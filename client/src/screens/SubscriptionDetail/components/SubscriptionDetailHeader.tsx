import React, { useContext, useState, useEffect, useCallback } from "react";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryIcon } from "../../../utils/helpers";
import { getLogoUrl } from "../../../services/logoService";
import SubscriptionDetailContext from "../context";
import AlertModal from "../../../components/Alerts/AlertModal";
import { alertsApi } from "../../../utils/api_request/alerts";

const SubscriptionDetailHeader = () => {
    const { sub, imgError, setImgError, initial, navigate } = useContext(SubscriptionDetailContext);
    const logoUrl = !imgError ? getLogoUrl(sub.name) : null;
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [hasActiveAlert, setHasActiveAlert] = useState(false);

    const checkAlerts = useCallback(async () => {
        if (!sub?.id) return;
        try {
            const alerts = await alertsApi.get_all(sub.id);
            const active = Array.isArray(alerts) && alerts.some((a: any) => a.status === 'active');
            setHasActiveAlert(active);
        } catch {
            setHasActiveAlert(false);
        }
    }, [sub?.id]);

    useEffect(() => {
        checkAlerts();
    }, [checkAlerts]);

    return (
        <>
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div className="flex items-center gap-3 flex-1">
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

                {/* Set Alert Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAlertModalOpen(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${hasActiveAlert
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        }`}
                    title={hasActiveAlert ? "Alert is active — click to manage" : "Set an alert"}
                >
                    {hasActiveAlert ? <Bell size={15} /> : <BellOff size={15} />}
                    <span className="hidden sm:inline">{hasActiveAlert ? "Alert Active" : "Set Alert"}</span>
                </motion.button>
            </div>

            {/* Alert Modal */}
            {alertModalOpen && (
                <AlertModal
                    subscriptionId={sub.id}
                    subscriptionName={sub.name}
                    isAutoPay={sub.is_auto_pay}
                    onClose={() => setAlertModalOpen(false)}
                    onAlertsChange={checkAlerts}
                />
            )}
        </>
    );
};

export default SubscriptionDetailHeader;
