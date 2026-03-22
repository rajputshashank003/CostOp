import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import History from "./screens/History/History";
import Members from "./screens/Members/Members";
import Landing from "./screens/Landing/Landing";
import "./index.css";

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/members" element={<Members />} />
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
