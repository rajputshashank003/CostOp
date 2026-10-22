import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Check, Copy, Receipt, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrderItem } from '../../../utils/api_request/payment';
import toast from 'react-hot-toast';

interface Props {
    order: OrderItem | null;
    userName?: string;
    userEmail?: string;
    orgName?: string;
    onClose: () => void;
}

export default function OrderReceiptModal({ order, userName = 'Customer', userEmail = '', orgName = 'CostOp Workspace', onClose }: Props) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (!order) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(label);
        toast.success(`Copied ${label} to clipboard!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Approximate GST 18% calculation for display
    const totalAmount = order.amount || 999;
    const baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
    const gstAmount = Math.round((totalAmount - baseAmount) * 100) / 100;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                            <Receipt size={18} className="text-emerald-600" />
                            <span>Tax Invoice & Order Receipt</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                            >
                                <Printer size={14} />
                                <span>Print / Save PDF</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-xl hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Close receipt"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Printable Receipt Body */}
                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Header: Brand & Status */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-slate-200">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                                        $
                                    </span>
                                    <span className="text-2xl font-black tracking-tight text-slate-900">CostOp</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">CostOp Technologies Inc. • FinOps Cloud</p>
                                <p className="text-[11px] text-slate-400">GSTIN: 29AABCU9603R1ZM • Bangalore, India</p>
                            </div>

                            <div className="sm:text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : order.status === 'failed'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {order.status === 'paid' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                    <span className="capitalize">{order.status === 'paid' ? 'Paid & Verified' : order.status}</span>
                                </span>
                                <p className="text-xs text-slate-500 font-semibold mt-2">Invoice #: {order.receipt || `RCPT-${order.id}`}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
                            </div>
                        </div>

                        {/* Customer & Billing Meta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To</p>
                                <p className="text-sm font-bold text-slate-900">{orgName}</p>
                                <p className="text-xs text-slate-600 font-medium">{userName}</p>
                                {userEmail && <p className="text-xs text-slate-500">{userEmail}</p>}
                            </div>

                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Method</p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                                    <ShieldCheck size={14} className="text-emerald-600" />
                                    <span>Razorpay 256-Bit SSL Payment</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Currency: {order.currency || 'INR'} (₹)</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                                        <th className="py-2 font-bold">Item Description</th>
                                        <th className="py-2 text-center font-bold">Billing Interval</th>
                                        <th className="py-2 text-right font-bold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    <tr>
                                        <td className="py-3">
                                            <p className="font-bold text-slate-900">CostOp Pro Plan Subscription</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Workspace upgrade with 100 team seats, executive PDF reports, and real-time Slack renewal alerts.
                                            </p>
                                        </td>
                                        <td className="py-3 text-center capitalize font-semibold text-slate-600">
                                            {order.interval || 'monthly'}
                                        </td>
                                        <td className="py-3 text-right font-bold text-slate-900 text-sm">
                                            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals & Tax Breakdown */}
                        <div className="border-t border-slate-200 pt-4 space-y-2">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Subtotal (Net Amount)</span>
                                <span>₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Integrated GST (18%)</span>
                                <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total Paid</span>
                                <span className="text-emerald-700">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* IDs & Audit Trail */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-medium">Razorpay Order ID:</span>
                                <div className="flex items-center gap-1.5">
                                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[11px]">
                                        {order.razorpay_order_id}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(order.razorpay_order_id, 'Order ID')}
                                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        title="Copy Order ID"
                                    >
                                        {copiedId === 'Order ID' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>

                            {order.razorpay_payment_id && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Razorpay Payment ID:</span>
                                    <div className="flex items-center gap-1.5">
                                        <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[11px]">
                                            {order.razorpay_payment_id}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(order.razorpay_payment_id!, 'Payment ID')}
                                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                            title="Copy Payment ID"
                                        >
                                            {copiedId === 'Payment ID' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {order.failure_reason && (
                                <div className="text-rose-600 text-xs font-semibold pt-1">
                                    Reason for failure: {order.failure_reason}
                                </div>
                            )}
                        </div>

                        {/* Footer Notes */}
                        <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
                            This is an electronically generated receipt for your CostOp Pro subscription. For billing queries, contact support@costop.io.
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
