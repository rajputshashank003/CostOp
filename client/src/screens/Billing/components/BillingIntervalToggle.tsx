import { useContext } from "react";
import BillingContext from "../context";
import { motion } from "framer-motion";

export default function BillingIntervalToggle() {
    const { billingInterval, setBillingInterval } = useContext(BillingContext);

    return (
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-10">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <button
                    type="button"
                    onClick={() => setBillingInterval("monthly")}
                    className={`relative z-10 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
                        billingInterval === "monthly" ? "text-emerald-800" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                    {billingInterval === "monthly" && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-emerald-50 rounded-xl border border-emerald-200 -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    Monthly Billing
                </button>

                <button
                    type="button"
                    onClick={() => setBillingInterval("annual")}
                    className={`relative z-10 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-2 cursor-pointer ${
                        billingInterval === "annual" ? "text-emerald-800" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                    {billingInterval === "annual" && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-emerald-50 rounded-xl border border-emerald-200 -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    Annual Billing
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                        Save 20%
                    </span>
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
                Switch between monthly billing or save 2 months with annual payment
            </p>
        </div>
    );
}
