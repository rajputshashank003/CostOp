import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
    question: string;
    answer: string;
}

const FAQS: FaqItem[] = [
    {
        question: "Do pending invitations count towards the 30 active member limit?",
        answer: "No. Quotas are strictly calculated on active, accepted workspace users. You can send pending invitations freely without consuming seat limits until the invited members actually join.",
    },
    {
        question: "What happens when our workspace hits 30 active members on Free?",
        answer: "When your team reaches 30 active members, existing members will continue having full access. However, new invites cannot be accepted until an admin upgrades to the Pro tier (unlocking up to 100 members) or frees up inactive seats.",
    },
    {
        question: "How does the Razorpay payment checkout process work?",
        answer: "Clicking 'Upgrade to Pro' launches a secured Razorpay checkout modal supporting UPI (Google Pay, PhonePe, Paytm), Credit Cards, Debit Cards, and Net Banking. Once the transaction completes, our server verifies HMAC SHA-256 signatures and activates your Pro tier immediately.",
    },
    {
        question: "How do Slack Webhook notifications work in the Pro tier?",
        answer: "Once upgraded, navigate to Organization Settings where you can paste any Slack Incoming Webhook URL. CostOp dispatches formatted Block Kit alerts 7, 2, and 1 day before subscriptions renew, keeping your entire finance and IT team informed.",
    },
    {
        question: "What formats are included in the Executive Monthly Spend Reports?",
        answer: "Pro workspaces can export monthly spend summaries as branded executive PDFs (complete with KPI cards and department distributions) or RFC-4180 CSV tables for Excel/Google Sheets, directly from the Dashboard and History toolbars.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, absolutely. There are no long-term contracts. You can cancel your subscription at any time, and you'll retain Pro access until the conclusion of your current billing period.",
    },
];

export default function BillingFaq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleIndex = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section aria-label="Frequently Asked Questions" className="bg-white rounded-[2rem] border border-slate-200 shadow-xs p-5 sm:p-8 mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HelpCircle size={20} />
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Frequently Asked Questions
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Everything you need to know about CostOp plans, limits, and billing
                    </p>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {FAQS.map((faq, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div key={idx} className="py-4">
                            <button
                                type="button"
                                onClick={() => toggleIndex(idx)}
                                className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none group"
                            >
                                <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-7 h-7 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center flex-shrink-0"
                                >
                                    <ChevronDown size={16} />
                                </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-xs sm:text-sm text-slate-600 font-medium pt-3 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
