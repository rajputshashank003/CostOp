import { useState, useEffect } from "react";
import { Archive } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { motion } from "framer-motion";

interface Props {
    subId: number;
    subName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ArchiveConfirmationModal({ subId, subName, onClose, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleArchive = async () => {
        setIsLoading(true);
        try {
            await subscriptionsApi.archive(subId);
            toast.success(`${subName} archived`);
            onSuccess();
        } catch {
            toast.error("Failed to archive subscription");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm flex flex-col p-6"
            >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100">
                    <Archive size={28} className="text-emerald-500" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-2.5">Archive Subscription</h2>
                <p className="text-[14px] text-slate-500 leading-relaxed mb-8">
                    Move <strong className="text-slate-700">{subName}</strong> to your archived history? You can still view it under the History tab.
                </p>

                <div className="flex items-center gap-3 w-full">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm text-sm cursor-pointer"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleArchive}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 transition-all shadow-md hover:shadow-lg text-sm flex justify-center items-center cursor-pointer"
                    >
                        {isLoading
                            ? <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                            : "Yes, archive"
                        }
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
