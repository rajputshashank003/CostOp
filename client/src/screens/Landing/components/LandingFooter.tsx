import { motion } from "framer-motion";
import { Receipt, Globe } from "lucide-react";
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
                    <div className="flex items-center gap-6 text-sm font-medium text-emerald-300">
                        <Link to="/terms" className="hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                            Terms & Conditions
                        </Link>
                        <Link to="/privacy" className="hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row items-center justify-between text-emerald-600 text-xs font-medium gap-4">
                <div>© {new Date().getFullYear()} CostOp. All rights reserved.</div>
                <div className="flex items-center gap-4">
                    <Link to="/terms" className="hover:text-emerald-400 transition-colors" onClick={() => window.scrollTo(0, 0)}>Terms & Conditions</Link>
                    <span>•</span>
                    <Link to="/privacy" className="hover:text-emerald-400 transition-colors" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
}
