import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, CreditCard, MailCheck, MailX, RefreshCw } from "lucide-react";
import { authApi } from "../../utils/api_request/auth";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

type VerificationStatus = "verifying" | "success" | "error";

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useUser();

    const [status, setStatus] = useState<VerificationStatus>("verifying");
    const [errorMessage, setErrorMessage] = useState("");
    const [userName, setUserName] = useState("");
    const [countdown, setCountdown] = useState(3);
    const [resendEmail, setResendEmail] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setErrorMessage("No verification token was provided in the link.");
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await authApi.verify_email(token);
                setStatus("success");
                setUserName(res.user?.name || "");

                // Automatically authenticate the user into state & localStorage
                if (res.token && res.user) {
                    login(res.token, res.user, res.is_admin ?? false);
                }
            } catch (err: any) {
                setStatus("error");
                const msg = err?.response?.data?.error || "This verification link is invalid or has expired.";
                setErrorMessage(msg);
                if (err?.response?.data?.email) {
                    setResendEmail(err.response.data.email);
                }
            }
        };

        verifyToken();
    }, [location.search, login]);

    // Handle auto-redirect countdown on success
    useEffect(() => {
        if (status !== "success") return;

        if (countdown <= 0) {
            navigate("/home");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [status, countdown, navigate]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = resendEmail.trim();
        if (!cleanEmail) {
            toast.error("Please enter your email address.");
            return;
        }

        try {
            setIsResending(true);
            const res = await authApi.resend_verification(cleanEmail);
            toast.success(res?.message || "New verification link sent! Please check your inbox.");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to resend verification link.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 md:p-12 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-50/80 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

            {/* Top Navigation Brand */}
            <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <CreditCard size={22} />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">CostOp</span>
                </Link>

                <Link
                    to="/login"
                    className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Sign In &rarr;
                </Link>
            </div>

            {/* Centered Verification Card */}
            <div className="w-full max-w-md mx-auto my-auto relative z-10 py-8">
                <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 sm:p-10 text-center">
                    {/* ── State 1: Verifying / Loading ─────────────────── */}
                    {status === "verifying" && (
                        <div className="py-6">
                            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                    <MailCheck size={28} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                                Verifying your email
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                                Please wait a moment while we validate your activation token...
                            </p>
                        </div>
                    )}

                    {/* ── State 2: Success ────────────────────────────── */}
                    {status === "success" && (
                        <div className="py-4 animate-fadeIn">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={40} className="stroke-[2.2]" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                Email Verified! 🎉
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-[320px] mx-auto">
                                {userName ? `Welcome aboard, ${userName}! ` : "Welcome to CostOp! "}
                                Your email address is confirmed and your workspace is fully activated.
                            </p>

                            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-800 font-medium mb-6">
                                Redirecting to your dashboard in <span className="font-bold font-mono">{countdown}s</span>...
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/home")}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    )}

                    {/* ── State 3: Error / Expired ────────────────────── */}
                    {status === "error" && (
                        <div className="py-2 animate-fadeIn">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                                <MailX size={38} className="stroke-[2.2]" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                Link Expired or Invalid
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-[320px] mx-auto">
                                {errorMessage || "This email verification link is no longer valid or has already been used."}
                            </p>

                            {/* Resend Form */}
                            <form onSubmit={handleResend} className="space-y-3 text-left mb-6">
                                <label
                                    htmlFor="resend-email"
                                    className="block text-xs font-semibold text-slate-700"
                                >
                                    Need a new link? Enter your email:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="resend-email"
                                        type="email"
                                        required
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="flex-1 h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isResending}
                                        className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                    >
                                        {isResending ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            "Resend"
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="border-t border-slate-100 pt-5 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
                                <Link to="/login" className="hover:text-slate-800 transition-colors">
                                    &larr; Return to Sign In
                                </Link>
                                <span>&bull;</span>
                                <a href="mailto:help@costop.in" className="hover:text-emerald-700 transition-colors">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 text-center text-xs text-slate-400 py-4">
                &copy; {new Date().getFullYear()} CostOp Inc. All rights reserved.
            </div>
        </div>
    );
}
