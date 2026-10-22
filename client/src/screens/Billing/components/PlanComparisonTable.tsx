import { Check, X, Sparkles } from "lucide-react";

interface FeatureRow {
    feature: string;
    description: string;
    free: string | boolean;
    pro: string | boolean;
}

interface CategoryGroup {
    category: string;
    features: FeatureRow[];
}

const COMPARISON_DATA: CategoryGroup[] = [
    {
        category: "Workspace Capacity & Seats",
        features: [
            {
                feature: "Active Team Members",
                description: "Number of active workspace colleagues allowed concurrently",
                free: "Up to 30 members",
                pro: "Up to 100 members",
            },
            {
                feature: "Pending Invites Exemption",
                description: "Pending invites do not consume active member quotas",
                free: true,
                pro: true,
            },
            {
                feature: "Role-Based Access Control",
                description: "Admin workspace permissions and team member views",
                free: true,
                pro: true,
            },
        ],
    },
    {
        category: "Reporting & Executive Exports",
        features: [
            {
                feature: "Executive Monthly Spend PDF",
                description: "High-resolution branded PDF executive summary for leadership",
                free: false,
                pro: true,
            },
            {
                feature: "Raw CSV Ledger Export",
                description: "Download entire active inventory and renewal schedules as CSV",
                free: false,
                pro: true,
            },
            {
                feature: "Department Burn Analytics",
                description: "Visual breakdown of spend per category, department, and owner",
                free: true,
                pro: true,
            },
        ],
    },
    {
        category: "Alerts & Team Integrations",
        features: [
            {
                feature: "Slack Webhook Notifications",
                description: "Broadcast renewal alerts to company Slack channel via incoming webhook",
                free: false,
                pro: true,
            },
            {
                feature: "Resend Email Notifications",
                description: "Automated renewal alerts sent 7, 2, and 1 day before charge",
                free: true,
                pro: true,
            },
            {
                feature: "1-Click Slack Integration Test",
                description: "Test webhook connection directly from workspace Settings",
                free: false,
                pro: true,
            },
        ],
    },
    {
        category: "Payments, Invoicing & Support",
        features: [
            {
                feature: "Payment Gateway",
                description: "Secured checkout via Razorpay (UPI, Credit/Debit cards, Netbanking)",
                free: "Not required",
                pro: "Razorpay 256-bit SSL",
            },
            {
                feature: "GST Compliant Invoices",
                description: "Automated business tax receipts with GST number support",
                free: false,
                pro: true,
            },
            {
                feature: "Customer Support",
                description: "Dedicated assistance and turnaround response time",
                free: "Standard Support",
                pro: "Priority FinOps Support",
            },
        ],
    },
];

export default function PlanComparisonTable() {
    const renderValue = (val: string | boolean, isProCol = false) => {
        if (typeof val === "boolean") {
            return val ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${
                    isProCol ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600"
                }`}>
                    <Check size={14} strokeWidth={3} />
                </div>
            ) : (
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <X size={14} strokeWidth={2.5} />
                </div>
            );
        }
        return (
            <span className={`text-xs sm:text-sm font-bold ${
                isProCol ? "text-emerald-800" : "text-slate-700"
            }`}>
                {val}
            </span>
        );
    };

    return (
        <section aria-label="Feature Comparison Matrix" className="bg-white rounded-[2rem] border border-slate-200 shadow-xs p-5 sm:p-8 mb-12 sm:mb-16 overflow-hidden">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
                <span className="text-xs font-black tracking-widest text-emerald-600 uppercase mb-2 block">
                    Detailed Matrix
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Compare Free vs. Pro Plans
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    Every feature, quota limit, and capability clearly outlined so you can pick the right fit.
                </p>
            </div>

            {/* Responsive table container */}
            <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[560px]">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-4 px-4 sm:px-6 text-sm font-extrabold text-slate-900 w-1/2">
                                Capabilities & Tools
                            </th>
                            <th className="py-4 px-4 text-center text-sm font-extrabold text-slate-700 w-1/4">
                                Free Tier
                            </th>
                            <th className="py-4 px-4 text-center text-sm font-black text-emerald-700 w-1/4 bg-emerald-50/60 rounded-t-xl">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Sparkles size={14} className="text-emerald-600" />
                                    <span>Pro Workspace</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON_DATA.map((group, groupIdx) => (
                            <React.Fragment key={groupIdx}>
                                <tr className="bg-slate-50/70 border-b border-slate-200">
                                    <td
                                        colSpan={3}
                                        className="py-3 px-4 sm:px-6 text-xs font-black uppercase tracking-wider text-slate-600"
                                    >
                                        {group.category}
                                    </td>
                                </tr>
                                {group.features.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                                    >
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="font-bold text-xs sm:text-sm text-slate-900">
                                                {row.feature}
                                            </div>
                                            <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                                                {row.description}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {renderValue(row.free, false)}
                                        </td>
                                        <td className="py-4 px-4 text-center bg-emerald-50/30">
                                            {renderValue(row.pro, true)}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

import React from "react";
