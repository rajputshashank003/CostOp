import { motion } from "framer-motion";
import { Receipt, Plus } from "lucide-react";
import { useUser } from "../../../hooks/useUser";

interface Props {
    onAddClick: () => void;
}

export default function HomeEmptyState({ onAddClick }: Props) {
    const { user } = useUser();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center mt-[-40px]"
        >
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <Receipt size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 mb-3 tracking-[-0.5px]">No subscriptions tracked</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-600 mb-8 leading-[1.6] px-4">
                Gain visibility into your software spend immediately. Add your first tool to completely track upcoming costs and renewals.
            </p>
            {user?.is_admin && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddClick}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200 cursor-pointer"
                >
                    <Plus size={22} />
                    Track First Subscription
                </motion.button>
            )}
        </motion.div>
    );
}
