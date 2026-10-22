import { TrendingUp, Sparkles } from 'lucide-react';
import { OrderItem } from '../../../utils/api_request/payment';

interface Props {
    orders: OrderItem[];
    currentPlan: string;
}

export default function OrdersMetrics({ orders, currentPlan }: Props) {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const isPro = currentPlan === 'pro';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Metric 1: Total Investment */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={22} />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">All-time workspace billing</p>
                </div>
            </div>

            {/* Metric 2: Active Plan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPro ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                    <Sparkles size={22} />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Tier</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 capitalize">
                        {isPro ? 'CostOp Pro' : 'Free Tier'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {isPro ? '100 Seats • All Features' : '30 Seats • Basic'}
                    </p>
                </div>
            </div>
        </div>
    );
}
