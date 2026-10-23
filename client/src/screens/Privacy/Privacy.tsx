import { motion } from "framer-motion";
import { Receipt, ArrowLeft, Shield, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
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
                        <Shield size={28} />
                        <span className="text-sm font-bold uppercase tracking-wider">Privacy & Protection</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>

                    <div className="space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction & Data Controller</h2>
                            <p>
                                At CostOp (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we respect your privacy and are committed to protecting your personal data. CostOp is owned and operated by <strong>SHASHANK RAJPUT</strong>.
                            </p>
                            <p className="mt-2">
                                This Privacy Policy informs you about how we handle your personal data, your privacy rights, and how the law protects you when you visit our website or use our SaaS software expense management platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                            <p>We may collect, use, and store different kinds of data including:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                                <li><strong>Identity & Contact Data:</strong> Name, email address, profile picture (via Google OAuth authentication).</li>
                                <li><strong>Application & Subscription Data:</strong> Software subscription details, spending logs, renewal dates, and team member assignments that you enter into the platform.</li>
                                <li><strong>Technical & Usage Data:</strong> IP addresses, browser types, session activity, and system diagnostics to ensure service reliability and security.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
                            <p>We use your data solely for legitimate business and operational purposes:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                                <li>To provide, maintain, and personalize the CostOp SaaS dashboard.</li>
                                <li>To compute cost analytics, detect duplicate licenses, and calculate software spend savings.</li>
                                <li>To send important service notifications, renewal reminders, and account alerts.</li>
                                <li>To comply with legal, statutory, and regulatory obligations.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security & Storage</h2>
                            <p>
                                We employ appropriate technical and organizational measures to safeguard your personal data against accidental loss, unauthorized access, alteration, or disclosure. All data transmissions are encrypted using standard SSL/TLS encryption.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Sharing & Third Parties</h2>
                            <p>
                                We do not sell or rent your personal data to third parties. We may share data only with trusted service providers necessary to operate our service (such as cloud hosting and database providers, OAuth providers, and payment processors) under strict confidentiality agreements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights</h2>
                            <p>
                                Depending on applicable data protection laws, you have the right to request access to, correction of, or deletion of your personal data stored within CostOp. You may exercise these rights at any time by contacting us.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact & Privacy Inquiries</h2>
                            <p className="mb-4">
                                If you have any questions or concerns regarding this Privacy Policy or our data handling practices, please reach out to us:
                            </p>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-emerald-600" />
                                    <span><strong>Legal Entity / Operator:</strong> SHASHANK RAJPUT</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-emerald-600" />
                                    <span>
                                        <strong>Email:</strong>{" "}
                                        <a href="mailto:support@costop.in" className="text-emerald-600 hover:underline">
                                            support@costop.in
                                        </a>
                                    </span>
                                </div>
                                <div className="text-slate-500 pt-1">
                                    <strong>Product / Platform:</strong> CostOp
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
