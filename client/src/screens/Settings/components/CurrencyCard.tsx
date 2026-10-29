import React from "react";
import { Coins } from "lucide-react";
import { CURRENCY_META, CurrencyCode } from "../../../context/CurrencyContext";
import { useMoney } from "../../../hooks/useMoney";

interface CurrencyCardProps {
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
}

const OPTIONS: CurrencyCode[] = ["INR", "USD"];

const CurrencyCard = ({ currency, setCurrency }: CurrencyCardProps) => {
    const { rates, rateSource, rateUpdatedAt } = useMoney();
    const updated = rateUpdatedAt ? new Date(rateUpdatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <Coins size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-none mb-1">Currency</h3>
                    <p className="text-[13px] font-medium text-slate-500">How costs are shown across your workspace</p>
                </div>
            </div>
            <div className="p-6">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest pl-1 mb-2 block">Display Currency</label>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl" role="radiogroup" aria-label="Display currency">
                    {OPTIONS.map((code) => {
                        const active = currency === code;
                        return (
                            <button
                                key={code}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setCurrency(code)}
                                className={`px-5 py-2.5 rounded-lg text-[14px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    active ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                <span className="text-[16px]">{CURRENCY_META[code].symbol}</span>
                                {code}
                                <span className={`hidden sm:inline text-[12px] font-semibold ${active ? "text-emerald-600/70" : "text-slate-400"}`}>{CURRENCY_META[code].label}</span>
                            </button>
                        );
                    })}
                </div>
                <p className="text-[13px] font-medium text-slate-500 mt-4 pl-1">
                    Costs are converted at <span className="font-bold text-slate-700">1 USD = ₹{rates.INR.toFixed(2)}</span>
                    {rateSource === "live" && updated ? <> · rate updated {updated}</> : <> · using the default rate while the live rate is unavailable</>}
                </p>
            </div>
        </div>
    );
};

export default CurrencyCard;
