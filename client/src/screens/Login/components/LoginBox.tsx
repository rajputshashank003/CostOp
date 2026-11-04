import { GoogleLogin } from "@react-oauth/google";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck, RefreshCw, ShieldCheck, User as UserIcon } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import LoginContext from "../context";
import LoggingInOverlay from "./LoggingInOverlay";

export default function LoginBox() {
    const {
        handleGoogleSuccess,
        loggingIn,
        authMode,
        setAuthMode,
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        isSubmitting,
        errorMessage,
        setErrorMessage,
        handleEmailSubmit,
        verificationSentEmail,
        isResending,
        handleResendVerification,
        resetVerificationSent,
    } = useContext(LoginContext);

    const isLogin = authMode === 'login';

    if (verificationSentEmail) {
        return (
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 sm:p-8 md:p-12 relative overflow-y-auto min-h-screen">
                <div className="w-full max-w-md p-6 sm:p-8 md:p-10 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 relative z-10 my-auto text-center animate-fadeIn">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                        <MailCheck size={36} className="sm:w-10 sm:h-10 stroke-[2.2]" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Check your email
                    </h2>

                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                        We&apos;ve sent a verification link to:
                        <br />
                        <span className="font-bold text-slate-900 break-all">{verificationSentEmail}</span>
                    </p>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left mb-6 space-y-2">
                        <p className="font-semibold text-slate-800">What to do next:</p>
                        <p className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                            <span>Click the <strong>Verify My Email</strong> button in the email we sent you.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                            <span>You will be automatically verified and redirected directly to your CostOp dashboard.</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handleResendVerification(verificationSentEmail)}
                            disabled={isResending}
                            className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-xs sm:text-sm"
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    <span>Sending new link...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} />
                                    <span>Resend verification link</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={resetVerificationSent}
                            className="w-full h-10 text-slate-600 hover:text-slate-900 font-semibold rounded-xl transition-colors text-xs sm:text-sm flex items-center justify-center cursor-pointer"
                        >
                            &larr; Back to Sign In
                        </button>
                    </div>

                    <p className="mt-6 text-[11px] text-slate-400">
                        Can&apos;t find it? Check your Spam or Junk folder.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {loggingIn && <LoggingInOverlay />}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 sm:p-8 md:p-12 relative overflow-y-auto min-h-screen">
                <div className="w-full max-w-md p-6 sm:p-8 md:p-10 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 relative z-10 my-auto">
                    {/* Header Icon & Title */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm border border-emerald-100/60">
                            <ShieldCheck size={30} className="sm:w-8 sm:h-8" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h2>
                        <p className="text-slate-500 mt-2 text-xs sm:text-sm leading-relaxed max-w-[320px] mx-auto">
                            {isLogin
                                ? "Sign in to track, manage, and optimize your business software costs."
                                : "Start tracking and cutting unused SaaS subscriptions in seconds."}
                        </p>
                    </div>

                    {/* Mode Segmented Tab Switcher */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs sm:text-sm font-semibold">
                        <button
                            type="button"
                            onClick={() => {
                                setAuthMode('login');
                                setErrorMessage('');
                            }}
                            className={`py-2 px-3 rounded-lg transition-all ${
                                isLogin
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAuthMode('signup');
                                setErrorMessage('');
                            }}
                            className={`py-2 px-3 rounded-lg transition-all ${
                                !isLogin
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Google OAuth (Primary / One-Click) */}
                    <div className="flex justify-center transition-transform hover:scale-[1.01] w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.log("Google Login Failed");
                            }}
                            theme="outline"
                            shape="pill"
                            size="large"
                            text={isLogin ? "continue_with" : "signup_with"}
                            width="100%"
                        />
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Error Alert Banner */}
                    {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn text-left">
                            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                            <span className="flex-1 font-medium">{errorMessage}</span>
                        </div>
                    )}

                    {/* Email / Password Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
                        {/* Name Field (Sign Up Only) */}
                        {!isLogin && (
                            <div>
                                <label
                                    htmlFor="costop-auth-name"
                                    className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                                >
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <UserIcon size={18} />
                                    </div>
                                    <input
                                        id="costop-auth-name"
                                        type="text"
                                        autoComplete="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Alex Johnson"
                                        required={!isLogin}
                                        disabled={isSubmitting}
                                        className="w-full h-11 sm:h-12 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:bg-slate-50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="costop-auth-email"
                                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                            >
                                Work Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="costop-auth-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full h-11 sm:h-12 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:bg-slate-50"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="costop-auth-password"
                                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>
                                {!isLogin && (
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Min. 8 characters
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="costop-auth-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 chars)"}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full h-11 sm:h-12 pl-10 pr-11 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:bg-slate-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button with Loader */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Terms & Privacy */}
                    <p className="mt-6 text-xs text-slate-400 text-center">
                        By continuing, you agree to CostOp&apos;s{" "}
                        <Link to="/terms" className="underline hover:text-slate-600 transition-colors">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="underline hover:text-slate-600 transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </>
    );
}
