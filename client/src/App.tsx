import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUser } from "./hooks/useUser";
import "./index.css";

const Home = lazy(() => import("./screens/Home/Home"));
const Login = lazy(() => import("./screens/Login/Login"));
const History = lazy(() => import("./screens/History/History"));
const Members = lazy(() => import("./screens/Members/Members"));
const Landing = lazy(() => import("./screens/Landing/Landing"));
const Requests = lazy(() => import("./screens/Requests/Requests"));
const SubscriptionDetail = lazy(() => import("./screens/SubscriptionDetail/SubscriptionDetail"));
const AddSubscription = lazy(() => import("./screens/AddSubscription/AddSubscription"));
const Profile = lazy(() => import("./screens/Profile/Profile"));
const Onboarding = lazy(() => import("./screens/Onboarding/Onboarding"));
const Settings = lazy(() => import("./screens/Settings/Settings"));
const Billing = lazy(() => import("./screens/Billing/Billing"));
const Orders = lazy(() => import("./screens/Orders/Orders"));
const Terms = lazy(() => import("./screens/Terms/Terms"));
const Privacy = lazy(() => import("./screens/Privacy/Privacy"));
const VerifyEmail = lazy(() => import("./screens/VerifyEmail/VerifyEmail"));

const SuspenseFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f0f5]">
        <span className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></span>
    </div>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, isLoading } = useUser();

    if (isLoading) return null;

    // Non-onboarded organic signups MUST be redirected to onboarding
    if (user && !user.is_onboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
};

function App() {
    return (
        <>
            <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Landing />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/terms-and-conditions" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/privacy-policy" element={<Privacy />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                    <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
                    <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
                    <Route path="/subscription/:id" element={<ProtectedRoute><SubscriptionDetail /></ProtectedRoute>} />
                    <Route path="/add-subscription" element={<ProtectedRoute><AddSubscription /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                </Routes>
            </Suspense>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "#ffffff",
                        color: "#0f172a",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                        borderRadius: "14px",
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "12px 16px",
                    },
                    success: {
                        iconTheme: {
                            primary: "#059669",
                            secondary: "#ffffff",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "#ef4444",
                            secondary: "#ffffff",
                        },
                    },
                }}
            />
        </>
    );
}

export default App;
