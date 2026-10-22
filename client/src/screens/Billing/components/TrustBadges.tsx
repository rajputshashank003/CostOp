import { Shield, Zap, ReceiptText, Clock } from "lucide-react";

export default function TrustBadges() {
    return (
        <section aria-label="Security & Assurance" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Shield size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-900">Bank-Grade Security</h4>
                    <p className="text-[11px] text-slate-500 font-medium">256-bit SSL encrypted by Razorpay</p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-900">Instant Activation</h4>
                    <p className="text-[11px] text-slate-500 font-medium">100 seats unlocked immediately</p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <ReceiptText size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-900">GST Tax Invoices</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Automated compliant tax invoices</p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-900">Cancel Anytime</h4>
                    <p className="text-[11px] text-slate-500 font-medium">No minimum contracts or lock-ins</p>
                </div>
            </div>
        </section>
    );
}
