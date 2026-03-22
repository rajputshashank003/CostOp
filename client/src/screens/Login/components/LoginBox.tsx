import { GoogleLogin } from "@react-oauth/google";
import { ShieldCheck } from "lucide-react";
import { useContext } from "react";
import LoginContext from "../context";

export default function LoginBox() {
    const { handleGoogleSuccess } = useContext(LoginContext);

    return (
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
    );
}
