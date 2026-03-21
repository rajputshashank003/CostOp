import { useState, useEffect } from "react";
import { LayoutDashboard, Settings, LogOut, Receipt, History as HistoryIcon, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion(Link as any);

export default function Sidebar() {
    const { logout } = useUser();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        if (!showLogoutModal) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowLogoutModal(false);
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [showLogoutModal]);

    return (
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                        <Receipt size={28} className="text-emerald-600" />
                    </motion.div>
                    <span className="text-[22px] font-extrabold tracking-[-0.5px] text-slate-900">CostOp</span>
                </div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
                <MotionLink whileTap={{ scale: 0.98 }} to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${location.pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <motion.div className="group-hover:scale-110 transition-transform"><LayoutDashboard size={20} /></motion.div>
                    Dashboard
                </MotionLink>
                <MotionLink whileTap={{ scale: 0.98 }} to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${location.pathname === '/history' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <motion.div className="group-hover:scale-110 transition-transform"><HistoryIcon size={20} /></motion.div>
                    History
                </MotionLink>
                <MotionLink whileTap={{ scale: 0.98 }} to="/members" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${location.pathname === '/members' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <motion.div className="group-hover:scale-110 transition-transform"><Users size={20} /></motion.div>
                    Members
                </MotionLink>
                <MotionLink whileTap={{ scale: 0.98 }} to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors group">
                    <motion.div className="group-hover:rotate-45 transition-transform"><Settings size={20} /></motion.div>
                    Settings
                </MotionLink>
            </nav>

            <div className="p-4 mt-auto border-t border-slate-100">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ x: 4 }}
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors group cursor-pointer"
                >
                    <motion.div className="group-hover:-translate-x-1 group-hover:scale-110 transition-transform"><LogOut size={20} /></motion.div>
                    Sign Out
                </motion.button>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowLogoutModal(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative"
                        >
                            <div className="w-16 h-16 rounded-[1.25rem] bg-red-100 flex items-center justify-center text-red-600 mb-6 mx-auto">
                                <LogOut size={32} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center mb-3">Sign Out?</h2>
                            <p className="text-slate-500 font-medium text-center mb-8">
                                Are you sure you want to log out of your CostOp workspace?
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-3.5 px-4 font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-100 outline-none cursor-pointer"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={logout}
                                    className="w-full py-3.5 px-4 font-bold rounded-xl text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all focus:ring-4 focus:ring-red-100 outline-none cursor-pointer"
                                >
                                    Yes, Log Out
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    );
}
