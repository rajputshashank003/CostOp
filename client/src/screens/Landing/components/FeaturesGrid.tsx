import { motion } from "framer-motion";
import { Rocket, ShieldCheck, PieChart } from "lucide-react";
import map from "lodash/map";

export default function FeaturesGrid() {
    return (
        <div className="py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 mb-4">Everything you need.</h2>
                <p className="text-emerald-800/70 text-lg max-w-2xl mx-auto font-medium">Built for teams and freelancers to ensure you never pay for an accidental subscription again.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {map([
                    {
                        icon: <ShieldCheck size={32} />,
                        title: "Unified Visibility",
                        desc: "Track every software tool and license across your entire organization from one single beautiful dashboard."
                    },
                    {
                        icon: <Rocket size={32} />,
                        title: "Automated Alerts",
                        desc: "Get notified days before your card gets charged. Say goodbye to surprise invoices and easily cancel unused tools."
                    },
                    {
                        icon: <PieChart size={32} />,
                        title: "Spend Analytics",
                        desc: "Visualize exactly where your budget is going with clear metrics, categories, and month-over-month trend tracking."
                    }
                ], (feat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300"
                    >
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            {feat.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
