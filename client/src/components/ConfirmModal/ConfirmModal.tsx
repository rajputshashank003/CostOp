import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    /** Whether the modal is visible */
    open: boolean;
    /** Called when user cancels or clicks outside */
    onClose: () => void;
    /** Called when user confirms the action */
    onConfirm: () => void;
    /** Title displayed in the modal */
    title: string;
    /** Description text below the title */
    description: string;
    /** Text for the confirm button (default: "Yes, Remove") */
    confirmLabel?: string;
    /** Whether the confirm action is in progress */
    loading?: boolean;
    /** Icon override — defaults to AlertTriangle */
    icon?: React.ReactNode;
}

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Yes, Remove",
    loading = false,
    icon,
}: ConfirmModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
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
                            {icon || <AlertTriangle size={32} />}
                        </div>

                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center mb-3">
                            {title}
                        </h2>
                        <p className="text-slate-500 font-medium text-center mb-8">
                            {description}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                disabled={loading}
                                className="w-full py-3.5 px-4 font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-100 outline-none cursor-pointer"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onConfirm}
                                disabled={loading}
                                className="w-full py-3.5 px-4 font-bold rounded-xl text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all focus:ring-4 focus:ring-red-100 outline-none cursor-pointer disabled:opacity-50"
                            >
                                {loading ? "Removing…" : confirmLabel}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
