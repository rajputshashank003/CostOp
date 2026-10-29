import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
        <BrowserRouter>
            <AuthProvider>
                <CurrencyProvider>
                    <App />
                    <Analytics />
                </CurrencyProvider>
            </AuthProvider>
        </BrowserRouter>
    </GoogleOAuthProvider>
);
