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
                </Routes>
            </Suspense>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "var(--surface-1)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow)",
                    },
                }}
            />
        </>
    );
}

export default App;
