import { useState } from "react";
import head from "lodash/head";
import toUpper from "lodash/toUpper";
import { getLogoUrl } from "../../../services/logoService";

interface SmallRenewalItemProps {
    r: any;
    formatter: Intl.NumberFormat;
}

export default function SmallRenewalItem({ r, formatter }: SmallRenewalItemProps) {
    const [imgError, setImgError] = useState(false);
    const initial = r.name ? toUpper(head(r.name) as string) : "?";
    const logoUrl = !imgError ? getLogoUrl(r.name) : null;

    return (
        <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shadow-sm overflow-hidden">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={r.name}
                            onError={() => setImgError(true)}
                            className="w-5 h-5 object-contain mix-blend-multiply"
                        />
                    ) : (
                        initial
                    )}
                </div>
                <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-none">{r.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">
                        {new Date(r.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                </div>
            </div>
            <div className="text-[13px] font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                {formatter.format(r.cost)}
            </div>
        </div>
    );
}
