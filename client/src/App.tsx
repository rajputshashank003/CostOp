import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import History from "./screens/History/History";
import Members from "./screens/Members/Members";
import Landing from "./screens/Landing/Landing";
import Requests from "./screens/Requests/Requests";
import SubscriptionDetail from "./screens/SubscriptionDetail/SubscriptionDetail";
import AddSubscription from "./screens/AddSubscription/AddSubscription";
import Profile from "./screens/Profile/Profile";
import Onboarding from "./screens/Onboarding/Onboarding";
import Settings from "./screens/Settings/Settings";
import { Navigate } from "react-router-dom";
import { useUser } from "./hooks/useUser";
import "./index.css";

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
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
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
