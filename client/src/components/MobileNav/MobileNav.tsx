import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Receipt, History as HistoryIcon, Users, Settings, Menu, X } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion(Link as any);

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { logout } = useUser();
    const location = useLocation();

    // Prevent scrolling when the drawer is open
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showLogoutModal) setShowLogoutModal(false);
                else if (isOpen) setIsOpen(false);
            }
        };

        if (isOpen || showLogoutModal) {
            document.body.style.overflow = 'hidden';
            document.addEventListener("keydown", handleEsc);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, showLogoutModal]);

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Open mobile menu"
            >
                <Menu size={24} />
            </motion.button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/40 z-[100] backdrop-blur-[2px]"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-y-0 left-0 w-[280px] bg-white z-[110] shadow-2xl flex flex-col"
                    >
                        <div className="h-[76px] px-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
                            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                                    <Receipt size={28} className="text-emerald-600" />
                                </motion.div>
                                <span className="text-[22px] font-extrabold tracking-[-0.5px] text-slate-900">CostOp</span>
                            </Link>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ rotate: 90 }}
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
                            <MotionLink whileTap={{ scale: 0.98 }} onClick={() => setIsOpen(false)} to="/home" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors group ${location.pathname === '/home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <motion.div className="group-hover:scale-110 transition-transform"><LayoutDashboard size={20} /></motion.div>
                                Dashboard
                            </MotionLink>
                            <MotionLink whileTap={{ scale: 0.98 }} onClick={() => setIsOpen(false)} to="/history" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors group ${location.pathname === '/history' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <motion.div className="group-hover:scale-110 transition-transform"><HistoryIcon size={20} /></motion.div>
                                History
                            </MotionLink>
                            <MotionLink whileTap={{ scale: 0.98 }} onClick={() => setIsOpen(false)} to="/members" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors group ${location.pathname === '/members' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <motion.div className="group-hover:scale-110 transition-transform"><Users size={20} /></motion.div>
                                Members
                            </MotionLink>
                            <MotionLink whileTap={{ scale: 0.98 }} onClick={() => setIsOpen(false)} to="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors group">
                                <motion.div className="group-hover:rotate-45 transition-transform"><Settings size={20} /></motion.div>
                                Settings
                            </MotionLink>
                        </nav>

                        <div className="p-4 mt-auto border-t border-slate-100 flex-shrink-0">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ x: 4 }}
                                onClick={() => setShowLogoutModal(true)}
                                className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors group cursor-pointer"
                            >
                                <motion.div className="group-hover:-translate-x-1 group-hover:scale-110 transition-transform"><LogOut size={20} /></motion.div>
                                Sign Out
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Logout Confirmation Modal - Elevated above drawer */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowLogoutModal(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-white rounded-[2rem] p-8 max-w-[320px] w-full shadow-2xl relative"
                        >
                            <div className="w-16 h-16 rounded-[1.25rem] bg-red-100 flex items-center justify-center text-red-600 mb-6 mx-auto">
                                <LogOut size={32} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight text-center mb-3">Sign Out?</h2>
                            <p className="text-slate-500 font-medium text-center text-sm mb-8">
                                Are you sure you want to log out of your CostOp workspace?
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-3.5 px-2 font-bold rounded-xl text-slate-600 text-sm bg-slate-100 hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-100 outline-none cursor-pointer"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowLogoutModal(false); logout(); }}
                                    className="w-full py-3.5 px-2 font-bold rounded-xl text-white text-sm bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all focus:ring-4 focus:ring-red-100 outline-none cursor-pointer"
                                >
                                    Log Out
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
