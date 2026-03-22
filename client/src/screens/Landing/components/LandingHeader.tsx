import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import LandingContext from "../context";

export default function LandingHeader() {
    const { isAuthenticated } = useContext(LandingContext);

    return (
        <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0, 0)}>
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                        <Receipt size={28} className="text-emerald-600" />
                    </motion.div>
                    <span className="text-[22px] font-extrabold tracking-[-0.5px] text-slate-900">CostOp</span>
                </Link>
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
    );
}
