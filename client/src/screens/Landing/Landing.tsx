import { motion } from "framer-motion";
import { CreditCard, Rocket, ShieldCheck, PieChart, ArrowRight, Github, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Landing() {
    const authContext = useContext(AuthContext);
    const isAuthenticated = authContext?.isAuthenticated;

    return (
        <div className="min-h-screen bg-emerald-50 text-slate-900 overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-emerald-600/20 shadow-lg">
                            <CreditCard size={24} />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-emerald-950">CostOp</span>
                    </div>
                    <nav>
                        {isAuthenticated ? (
                            <Link to="/home" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md">
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-emerald-900 font-semibold hover:text-emerald-600 transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/login" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hidden sm:block">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Hero Section */}
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
                                {[
                                    { n: "Figma Team", c: "$145.00", d: "Renews in 3 days", color: "bg-purple-100 text-purple-600" },
                                    { n: "Slack Pro", c: "$89.50", d: "Renews in 12 days", color: "bg-amber-100 text-amber-600" },
                                    { n: "Github Copilot", c: "$19.00", d: "Renews in 21 days", color: "bg-slate-100 text-slate-600" },
                                ].map((item, i) => (
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

                {/* Features Grid */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 mb-4">Everything you need.</h2>
                        <p className="text-emerald-800/70 text-lg max-w-2xl mx-auto font-medium">Built for teams and freelancers to ensure you never pay for an accidental subscription again.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
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
                        ].map((feat, i) => (
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
            </main>

            {/* Footer */}
            <footer className="bg-emerald-950 text-emerald-50 py-16 border-t border-emerald-900">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard size={24} className="text-emerald-400" />
                            <span className="text-2xl font-extrabold tracking-tight text-white">CostOp</span>
                        </div>
                        <p className="text-emerald-300 font-medium max-w-sm mb-6">
                            Take absolute control of your SaaS infrastructure. Track, optimize, and save big on software spend.
                        </p>
                    </div>

                    <div className="flex flex-col md:items-end justify-center">
                        <div className="text-emerald-400 font-bold mb-4 uppercase tracking-widest text-sm">Created By</div>
                        <div className="text-xl font-bold text-white mb-6">Shashank Rajput</div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/rajputshashank003/"
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-full bg-emerald-900/50 hover:bg-emerald-800 flex items-center justify-center text-emerald-300 hover:text-white transition-all border border-emerald-800"
                            >
                                <Github size={22} />
                            </a>
                            <a
                                href="https://rajputshashank.is-a.dev/"
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-full bg-emerald-900/50 hover:bg-emerald-800 flex items-center justify-center text-emerald-300 hover:text-white transition-all border border-emerald-800"
                            >
                                <Globe size={22} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row items-center justify-between text-emerald-600 text-sm font-semibold">
                    <div>© {new Date().getFullYear()} CostOp. All rights reserved.</div>
                    <div className="mt-4 md:mt-0">Designed & Developed by Shashank Rajput</div>
                </div>
            </footer>
        </div>
    );
}
