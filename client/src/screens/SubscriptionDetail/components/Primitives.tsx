import React from "react";
import head from "lodash/head";

export function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
        <div className={`rounded-2xl border p-5 ${colors[accent]} bg-white`}>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold opacity-70 mb-1">{icon} {label}</div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900">{value}</div>
        </div>
    );
}

export function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">{icon} {title}</h3>
            {children}
        </div>
    );
}

export function PersonRow({ avatar, name, email }: { avatar?: string; name: string; email: string }) {
    return (
        <div className="flex items-center gap-3">
            {avatar ? (
                <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{head(name)}</div>
            )}
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
        </div>
    );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="font-semibold text-slate-800 capitalize">{value}</span>
        </div>
    );
}
