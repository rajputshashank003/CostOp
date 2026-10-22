import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import OrdersHeader from './components/OrdersHeader';
import OrdersMetrics from './components/OrdersMetrics';
import OrdersEmptyState from './components/OrdersEmptyState';
import OrderReceiptModal from './components/OrderReceiptModal';
import { paymentApi, OrderItem } from '../../utils/api_request/payment';
import { organizationApi } from '../../utils/api_request/organization';
import { useUser } from '../../hooks/useUser';
import { Search, RotateCw, FileText, CheckCircle2, AlertCircle, Clock, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Orders() {
    const { user } = useUser();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [orgName, setOrgName] = useState('CostOp Workspace');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'other'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadOrdersData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ordersRes, orgRes] = await Promise.all([
                paymentApi.get_orders().catch(() => ({ orders: [], total: 0 })),
                organizationApi.get_details().catch(() => null),
            ]);

            setOrders(ordersRes?.orders || []);
            if (orgRes?.plan) setCurrentPlan(orgRes.plan);
            if (orgRes?.name) setOrgName(orgRes.name);
        } catch (err) {
            console.error('Failed to load orders:', err);
            toast.error('Unable to load purchase history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrdersData();
    }, [loadOrdersData]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(label);
        toast.success(`Copied ${label}!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter orders by search & status
    const filteredOrders = orders.filter((order) => {
        // Status filter
        if (statusFilter === 'paid' && order.status !== 'paid') return false;
        if (statusFilter === 'other' && order.status === 'paid') return false;

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const orderIdMatch = order.razorpay_order_id?.toLowerCase().includes(q);
            const payIdMatch = order.razorpay_payment_id?.toLowerCase().includes(q);
            const planMatch = order.plan?.toLowerCase().includes(q);
            const receiptMatch = order.receipt?.toLowerCase().includes(q);
            if (!orderIdMatch && !payIdMatch && !planMatch && !receiptMatch) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <OrdersHeader />

                <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
                    {/* Top Metric Cards */}
                    <OrdersMetrics orders={orders} currentPlan={currentPlan} />

                    {/* Filter, Search & Refresh Toolbar */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {/* Status Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl flex-shrink-0">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                All Orders ({orders.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('paid')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    statusFilter === 'paid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Completed ({orders.filter(o => o.status === 'paid').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('other')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    statusFilter === 'other' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Pending/Other ({orders.filter(o => o.status !== 'paid').length})
                            </button>
                        </div>

                        {/* Search & Refresh Actions */}
                        <div className="flex items-center gap-2 flex-1 sm:justify-end">
                            <div className="relative w-full sm:w-64">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search order or payment ID..."
                                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <button
                                onClick={loadOrdersData}
                                disabled={isLoading}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex-shrink-0"
                                title="Refresh order history"
                            >
                                <RotateCw size={16} className={isLoading ? 'animate-spin text-emerald-600' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Content Section: Loading, Empty, or Table */}
                    {isLoading ? (
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
                            <span className="w-9 h-9 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin inline-block mb-3" />
                            <p className="text-xs font-bold text-slate-500">Loading purchase records & invoices...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <OrdersEmptyState />
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-xs">
                            <p className="text-sm font-bold text-slate-700">No matching orders found</p>
                            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                                                <th className="py-3.5 px-4 whitespace-nowrap">Plan & Tier</th>
                                                <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                                                <th className="py-3.5 px-4 whitespace-nowrap">Payment ID</th>
                                                <th className="py-3.5 px-4 whitespace-nowrap">Amount</th>
                                                <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                                                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                                                <th className="py-3.5 px-4 text-right whitespace-nowrap">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                                            {filteredOrders.map((order) => {
                                                const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                });

                                                return (
                                                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                                            <div className="font-bold text-slate-900 capitalize flex items-center gap-1.5 whitespace-nowrap">
                                                                <span className="whitespace-nowrap">CostOp {order.plan || 'Pro'}</span>
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase whitespace-nowrap">
                                                                    {order.interval || 'monthly'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] text-slate-400 whitespace-nowrap block">100 Seats Quota</span>
                                                        </td>

                                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                                <code className="text-[11px] font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70 whitespace-nowrap">
                                                                    {order.razorpay_order_id ? `${order.razorpay_order_id.slice(0, 14)}...` : '-'}
                                                                </code>
                                                                {order.razorpay_order_id && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(order.razorpay_order_id, `ord_${order.id}`)}
                                                                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                                                                        title="Copy Order ID"
                                                                    >
                                                                        {copiedId === `ord_${order.id}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                                <code className="text-[11px] font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70 whitespace-nowrap">
                                                                    {order.razorpay_payment_id ? `${order.razorpay_payment_id.slice(0, 14)}...` : 'Pending'}
                                                                </code>
                                                                {order.razorpay_payment_id && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(order.razorpay_payment_id!, `pay_${order.id}`)}
                                                                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                                                                        title="Copy Payment ID"
                                                                    >
                                                                        {copiedId === `pay_${order.id}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm whitespace-nowrap">
                                                            ₹{Number(order.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>

                                                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                                                            {dateStr}
                                                        </td>

                                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                                                                order.status === 'paid'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : order.status === 'failed'
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {order.status === 'paid' && <CheckCircle2 size={12} className="shrink-0" />}
                                                                {order.status === 'failed' && <AlertCircle size={12} className="shrink-0" />}
                                                                {order.status === 'created' && <Clock size={12} className="shrink-0" />}
                                                                <span className="capitalize">{order.status === 'paid' ? 'Paid' : order.status}</span>
                                                            </span>
                                                        </td>

                                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                            <motion.button
                                                                whileTap={{ scale: 0.95 }}
                                                                whileHover={{ scale: 1.02 }}
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                                                            >
                                                                <FileText size={13} className="text-emerald-600 shrink-0" />
                                                                <span>Invoice</span>
                                                            </motion.button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card Layout */}
                            <div className="md:hidden grid grid-cols-1 gap-3">
                                {filteredOrders.map((order) => {
                                    const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    });

                                    return (
                                        <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">CostOp {order.plan || 'Pro'}</p>
                                                    <p className="text-xs text-slate-400 capitalize">{order.interval || 'monthly'} billing • {dateStr}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                    order.status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : order.status === 'failed'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    <span className="capitalize">{order.status === 'paid' ? 'Paid' : order.status}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                                                <span className="text-xs text-slate-500 font-medium">Total Amount:</span>
                                                <span className="text-base font-black text-slate-900">
                                                    ₹{Number(order.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                            >
                                                <FileText size={14} className="text-emerald-600" />
                                                <span>View Invoice & Tax Receipt</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Tax Invoice & Receipt Details Modal */}
            {selectedOrder && (
                <OrderReceiptModal
                    order={selectedOrder}
                    userName={user?.name}
                    userEmail={user?.email}
                    orgName={orgName}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
