import { useNavigate } from 'react-router-dom';
import { Receipt, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrdersEmptyState() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center max-w-xl mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
                <Receipt size={32} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                No Purchases Yet
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6 max-w-md mx-auto">
                Your workspace is currently enjoying CostOp on the Free tier. When you upgrade to CostOp Pro, your invoices, tax receipts, and payment records will be securely archived here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/billing')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                    <Sparkles size={16} />
                    <span>Explore Pro Plans</span>
                    <ArrowRight size={16} />
                </motion.button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>100% Secure payments via Razorpay • GST Invoices provided</span>
            </div>
        </div>
    );
}
