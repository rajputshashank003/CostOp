import { motion } from "framer-motion";
import { Receipt, Github, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingFooter() {
    return (
        <footer className="bg-emerald-950 text-emerald-50 py-16 border-t border-emerald-900">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <Link to="/" className="flex items-center gap-2 mb-4 w-fit cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0, 0)}>
                        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                            <Receipt size={28} className="text-emerald-400" />
                        </motion.div>
                        <span className="text-[22px] font-extrabold tracking-[-0.5px] text-white">CostOp</span>
                    </Link>
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
    );
}
