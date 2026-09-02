import { motion } from "framer-motion";
import { Receipt, ArrowLeft, ShieldCheck, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Header */}
            <header className="sticky top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                            <Receipt size={24} className="text-emerald-600" />
                        </motion.div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">CostOp</span>
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-600 mb-4">
                        <ShieldCheck size={28} />
                        <span className="text-sm font-bold uppercase tracking-wider">Legal & Compliance</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Terms and Conditions
                    </h1>
                    <p className="text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>

                    <div className="space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
                            <p>
                                Welcome to CostOp (&quot;Service&quot;, &quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). CostOp provides SaaS subscription management, software expense monitoring, and cost optimization tools.
                            </p>
                            <p className="mt-2">
                                By accessing or using our website and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
                            <p>
                                CostOp is a software-as-a-service (SaaS) expense management, subscription monitoring, and cost optimization platform. It allows businesses and individuals to track recurring software licenses, manage renewal timelines, analyze team seat utilization, and optimize overall software expenditure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Accounts & Security</h2>
                            <p>
                                When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding your account credentials and for any activities or actions under your account. You agree to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Subscriptions, Fees & Billing</h2>
                            <p>
                                Some parts of the Service may be billed on a subscription basis. You will be billed in advance on a recurring and periodic basis depending on the subscription plan you select. You may cancel your subscription renewal at any time through your account settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cancellation & Refund Policy</h2>
                            <p>
                                You can cancel your subscription at any time. Upon cancellation, your service access will continue until the end of your current billing period. Unless required by applicable law or explicitly stated in a promotion, fees paid are non-refundable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Acceptable Use</h2>
                            <p>
                                You agree not to use the Service for any unlawful purpose or in violation of any applicable regulations. You agree not to reverse engineer, decompile, or attempt to extract the source code of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Intellectual Property</h2>
                            <p>
                                The Service and its original content, features, and functionality are and will remain the exclusive property of CostOp and its licensors. CostOp trademarks and trade dress may not be used in connection with any product or service without prior written consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
                            <p>
                                In no event shall CostOp, its operators, or its suppliers be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
                            <p>
                                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Inquiries & Policies</h2>
                            <p className="mb-4">
                                For inquiries regarding our policies, privacy practices, and data handling details, please review our{" "}
                                <Link to="/privacy" className="text-emerald-600 font-semibold hover:underline">
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
