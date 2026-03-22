import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { CreditCard, Rocket, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { authApi } from "../../utils/api_request/auth";
import { SESSION_STORAGE } from "../../utils/constants";

const Login = () => {
    const { login } = useUser();
    const location = useLocation();

    // Aggressively capture any ?token= from the URL the second this mounts so we don't lose it on redirects!
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
        sessionStorage.setItem(SESSION_STORAGE.INVITE_TOKEN, urlToken);
    }

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (credentialResponse.credential) {
                // Read from our rock-solid session storage in case the URL bar wiped it!
                const inviteToken = sessionStorage.getItem(SESSION_STORAGE.INVITE_TOKEN) || undefined;

                const data = await authApi.verify_google_token(credentialResponse.credential, inviteToken);

                // Process Login successfully!
                login(data.token, data.user);

                // Wipe token after it has been safely deployed!
                sessionStorage.removeItem(SESSION_STORAGE.INVITE_TOKEN);
            }
        } catch (err) {
            // Global error mapping is handled natively by utils/api_request/utils.ts
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Branding and Features */}
            <div className="hidden lg:block w-1/2 bg-emerald-50 border-r border-emerald-100 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                {/* Centered Content Column */}
                <div className="relative z-10 max-w-xl mx-auto w-full h-full flex flex-col justify-between py-12 px-8 xl:py-20 xl:px-12">

                    {/* Logo Top Left */}
                    <div className="flex items-center gap-3">
                        <CreditCard size={32} className="text-emerald-600" />
                        <span className="text-2xl font-extrabold tracking-tight text-emerald-950">CostOp</span>
                    </div>

                    {/* Center Content */}
                    <div className="w-full my-auto py-12">
                        <h1 className="text-5xl xl:text-[3.5rem] font-extrabold leading-[1.15] mb-6 text-emerald-950 tracking-tight">
                            Take control of your <br />
                            <span className="text-emerald-600">SaaS spend</span>.
                        </h1>
                        <p className="text-lg text-emerald-800/80 leading-relaxed mb-10 max-w-md">
                            Stop wasting budget on unused licenses, duplicate tools, and forgotten subscriptions.
                        </p>

                        <ul className="flex flex-col gap-6">
                            <li className="flex items-center gap-5 text-base font-semibold text-emerald-900">
                                <div className="text-emerald-600 bg-white shadow-sm p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                                    <ShieldCheck size={24} />
                                </div>
                                Unified visibility into all subscriptions
                            </li>
                            <li className="flex items-center gap-5 text-base font-semibold text-emerald-900">
                                <div className="text-emerald-600 bg-white shadow-sm p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                                    <Rocket size={24} />
                                </div>
                                Automated alerts before you get billed
                            </li>
                            <li className="flex items-center gap-5 text-base font-semibold text-emerald-900">
                                <div className="text-emerald-600 bg-white shadow-sm p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                                    <CreditCard size={24} />
                                </div>
                                Direct insights into potential savings
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="text-emerald-900/40 text-sm font-medium">
                        <p>© {new Date().getFullYear()} CostOp. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Box */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 relative overflow-hidden">
                <div className="w-full max-w-md p-10 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-[280px] mx-auto">
                        Sign in to track, manage, and optimize your business software costs.
                    </p>

                    <div className="flex justify-center transition-transform hover:scale-[1.02]">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.log("Login Failed");
                            }}
                            theme="outline"
                            shape="pill"
                            size="large"
                            text="continue_with"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
