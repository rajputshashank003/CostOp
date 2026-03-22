import { CreditCard, Rocket, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginBranding() {
    return (
        <div className="hidden lg:block w-1/2 bg-emerald-50 border-r border-emerald-100 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            {/* Centered Content Column */}
            <div className="relative z-10 max-w-xl mx-auto w-full h-full flex flex-col justify-between py-12 px-8 xl:py-20 xl:px-12">

                {/* Logo Top Left */}
                <Link to="/" className="flex items-center gap-3 w-fit cursor-pointer hover:opacity-80 transition-opacity">
                    <CreditCard size={32} className="text-emerald-600" />
                    <span className="text-2xl font-extrabold tracking-tight text-emerald-950">CostOp</span>
                </Link>

                {/* Center Content */}
                <div className="w-full my-auto py-12">
                    <h1 className="text-5xl xl:text-[3.5rem] font-extrabold leading-[1.15] mb-6 text-emerald-950 tracking-tight">
                        Take control of your <br />
                        <span className="text-emerald-600">SaaS spend</span>.
                    </h1>
                    <p className="text-lg text-emerald-800/80 leading-relaxed mb-10 max-w-md">
                        Stop wasting budget on unused licenses, duplicate tools, and forgotten subscriptions.
                    </p>

                    <ul className="flex flex-col gap-6">
                        <li className="flex items-center gap-5 text-base font-semibold text-emerald-900">
                            <div className="text-emerald-600 bg-white shadow-sm p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            Unified visibility into all subscriptions
                        </li>
                        <li className="flex items-center gap-5 text-base font-semibold text-emerald-900">
                            <div className="text-emerald-600 bg-white shadow-sm p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                                <Rocket size={24} />
                            </div>
                            Automated alerts before you get billed
                        </li>
                        <li className="flex items-center gap-5 text-base font-semibold text-emerald-900">
                            <div className="text-emerald-600 bg-white shadow-sm p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                                <CreditCard size={24} />
                            </div>
                            Direct insights into potential savings
                        </li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="text-emerald-900/40 text-sm font-medium">
                    <p>© {new Date().getFullYear()} CostOp. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
