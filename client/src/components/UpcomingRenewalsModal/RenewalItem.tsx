import { useState } from "react";
import head from "lodash/head";
import toUpper from "lodash/toUpper";
import { getLogoUrl } from "../../utils/logoService";

export interface Subscription {
    id: number;
    name: string;
    cost: number;
    next_billing_date: string;
}

interface RenewalItemProps {
    r: Subscription;
    formatter: Intl.NumberFormat;
}

export default function RenewalItem({ r, formatter }: RenewalItemProps) {
    const [imgError, setImgError] = useState(false);
    const initial = r.name ? toUpper(head(r.name) as string) : "?";
    const logoUrl = !imgError ? getLogoUrl(r.name) : null;

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors overflow-hidden">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={r.name}
                            onError={() => setImgError(true)}
                            className="w-7 h-7 object-contain mix-blend-multiply"
                        />
                    ) : (
                        initial
                    )}
                </div>
                <div>
                    <p className="text-[15px] font-bold text-slate-900 leading-none mb-1.5 object-contain">{r.name}</p>
                    <p className="text-[13px] font-semibold text-slate-500">
                        {new Date(r.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </div>
            </div>
            <div className="text-[15px] font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100 transition-colors">
                {formatter.format(r.cost)}
            </div>
        </div>
    );
}
