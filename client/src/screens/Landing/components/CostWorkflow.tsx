import { motion } from "framer-motion";
import { Search, Scissors, TrendingDown } from "lucide-react";

export default function CostWorkflow() {
    const steps = [
        {
            icon: <Search className="w-8 h-8 text-indigo-500" />,
            title: "1. Detect Waste",
            description: "CostOp instantly connects to your tech stack and scans for duplicate subscriptions, inactive users, and orphaned seats.",
            color: "border-indigo-100 hover:border-indigo-300",
            iconBg: "bg-indigo-100",
        },
        {
            icon: <Scissors className="w-8 h-8 text-amber-500" />,
            title: "2. Consolidate & Reclaim",
            description: "Reassign unused seats or consolidate multi-team shadow IT tools into single enterprise plans to maximize leverage.",
            color: "border-amber-100 hover:border-amber-300",
            iconBg: "bg-amber-100",
        },
        {
            icon: <TrendingDown className="w-8 h-8 text-emerald-500" />,
            title: "3. Save Immediately",
            description: "Watch your monthly burn rate drop and maintain perfectly optimized SaaS spending automatically.",
            color: "border-emerald-100 hover:border-emerald-300",
            iconBg: "bg-emerald-100",
        }
    ];

    return (
        <section className="py-24 relative z-10">
            <div className="text-center mb-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
                >
                    How we save you <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">Money</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
                >
                    A frictionless, automated workflow designed with engineering principles to reclaim your organization's lost capital.
                </motion.p>
            </div>

            <div className="relative">
                {/* Connecting Line background */}
                <div className="hidden md:block absolute top-[40px] left-[16%] w-[68%] h-1.5 bg-slate-200 -z-10 rounded-full" />

                {/* Animated progress line */}
                <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "68%" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="hidden md:block absolute top-[40px] left-[16%] h-1.5 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 -z-10 rounded-full origin-left"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.4 + 0.2, duration: 0.6, type: "spring" }}
                            className="relative group cursor-default"
                        >
                            <div className="flex flex-col items-center text-center">
                                {/* Icon container with ping animation */}
                                <div className="relative mb-8">
                                    <div className={`w-20 h-20 rounded-2xl ${step.iconBg} shadow-sm border-4 border-white flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2`}>
                                        {step.icon}
                                    </div>
                                    <div className={`absolute inset-0 rounded-2xl ${step.iconBg} animate-ping opacity-20`} style={{ animationDuration: '3s' }} />
                                </div>

                                {/* Card */}
                                <div className={`w-full bg-white rounded-3xl p-8 border-2 ${step.color} shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1`}>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium text-[15px]">{step.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
