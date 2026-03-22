import { motion } from "framer-motion";
import { PieChart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import LandingContext from "../context";
import map from "lodash/map";

export default function HeroSection() {
    const { isAuthenticated } = useContext(LandingContext);

    return (
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-32">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 text-center lg:text-left"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-6 border border-emerald-200">
                    ✨ The #1 SaaS Subscription Tracker
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-emerald-950 leading-[1.1] mb-6 tracking-tight">
                    Take control of your <br className="hidden md:block" />
                    <span className="text-emerald-600 relative">
                        SaaS spend.
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor"></path>
                        </svg>
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-emerald-900/70 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    Stop wasting budget on unused licenses, duplicate tools, and forgotten subscriptions. CostOp gives you absolute visibility so you can scale efficiently.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <Link to={isAuthenticated ? "/home" : "/login"}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-3 transition-colors w-full sm:w-auto justify-center cursor-pointer"
                        >
                            {isAuthenticated ? "Go to Dashboard" : "Start Tracking for Free"}
                            <ArrowRight size={20} />
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="flex-1 w-full relative"
            >
                {/* Decorative Background for Hero Image abstract logic */}
                <div className="absolute inset-0 bg-emerald-200 rounded-[3rem] rotate-3 scale-105 opacity-50 blur-xl"></div>
                <div className="relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-2xl z-10">
                    {/* Abstract Mockup inside the hero image */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</div>
                            <div className="text-4xl font-extrabold text-slate-900">$2,459.00<span className="text-lg text-slate-400">/mo</span></div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <PieChart size={28} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {map([
                            { n: "Figma Team", c: "$145.00", d: "Renews in 3 days", color: "bg-purple-100 text-purple-600" },
                            { n: "Slack Pro", c: "$89.50", d: "Renews in 12 days", color: "bg-amber-100 text-amber-600" },
                            { n: "Github Copilot", c: "$19.00", d: "Renews in 21 days", color: "bg-slate-100 text-slate-600" },
                        ], (item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${item.color}`}>
                                        {item.n.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{item.n}</div>
                                        <div className="text-xs font-semibold text-slate-500">{item.d}</div>
                                    </div>
                                </div>
                                <div className="font-bold text-slate-700">{item.c}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
