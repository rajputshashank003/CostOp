import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { startRazorpayCheckout } from '../../utils/razorpay';
import { organizationApi } from '../../utils/api_request/organization';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpgradeSuccess?: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }: Props) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRazorpayUpgrade = async () => {
        setIsLoading(true);
        await startRazorpayCheckout({
            userEmail: user?.email,
            userName: user?.name,
            onSuccess: () => {
                setIsLoading(false);
                onClose();
                if (onUpgradeSuccess) onUpgradeSuccess();
                setTimeout(() => window.location.reload(), 800);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
        setIsLoading(false);
    };

    const handleInstantDemoUpgrade = async () => {
        setIsLoading(true);
        try {
            await organizationApi.upgrade();
            toast.success('Workspace upgraded to CostOp Pro successfully!');
            onClose();
            if (onUpgradeSuccess) onUpgradeSuccess();
            setTimeout(() => window.location.reload(), 800);
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to upgrade workspace.');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { title: '100 Active Team Members', desc: 'Expand your company roster up from 30 members' },
        { title: 'Executive Spend Reports (CSV & PDF)', desc: 'Board-ready monthly burn summaries and upcoming renewals' },
        { title: 'Slack Webhook Notifications', desc: 'Get real-time renewal warnings directly in your team channels' },
        { title: 'Priority Multi-Offset Alerts', desc: 'Custom renewal intervals before unwanted charges hit' },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 overflow-hidden z-10"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="upgrade-modal-title"
                >
                    {/* Decorative Top Accent Glow */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        aria-label="Close upgrade dialog"
                        className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                                <Zap size={12} className="fill-emerald-600" /> CostOp Pro
                            </div>
                            <h2 id="upgrade-modal-title" className="text-2xl font-black text-slate-900 tracking-tight">
                                Unlock Premium Power
                            </h2>
                        </div>
                    </div>

                    <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">
                        Scale your software management, automate team Slack alerts, and export leadership-ready spend reports.
                    </p>

                    {/* Pricing Highlight */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-baseline justify-between">
                        <div>
                            <span className="text-3xl font-black text-slate-900 tracking-tight">₹999</span>
                            <span className="text-slate-500 text-sm font-medium ml-1">/ month</span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                            ₹799/mo on yearly • Save 20%
                        </span>
                    </div>

                    {/* Feature List */}
                    <div className="space-y-3.5 mb-8">
                        {features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check size={13} strokeWidth={3} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{feat.title}</h4>
                                    <p className="text-xs text-slate-500">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRazorpayUpgrade}
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    <span>Pay with Razorpay (₹999)</span>
                                </>
                            )}
                        </button>

                        {/* Test / Instant Demo Activation option */}
                        <button
                            type="button"
                            onClick={handleInstantDemoUpgrade}
                            disabled={isLoading}
                            className="text-xs text-slate-500 hover:text-slate-700 font-semibold py-1.5 transition-colors cursor-pointer text-center"
                        >
                            ⚡ Or activate instant test mode (Skip checkout)
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
