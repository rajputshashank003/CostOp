import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { CredentialResponse } from "@react-oauth/google";
import { authApi } from "../../utils/api_request/auth";
import { SESSION_STORAGE } from "../../utils/constants";
import { useEffect, useState } from "react";

const useLogin = () => {
    const { login, user } = useUser();
    const [loggingIn, setLoggingIn] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (credentialResponse.credential) {
                setLoggingIn(true);
                const inviteToken = sessionStorage.getItem(SESSION_STORAGE.INVITE_TOKEN) || undefined;
                const data = await authApi.verify_google_token(credentialResponse.credential, inviteToken);
                // Process Login successfully!
                login(data.token, data.user, data.is_admin ?? false);
                // Wipe token after it has been safely deployed!
                sessionStorage.removeItem(SESSION_STORAGE.INVITE_TOKEN);
            }
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.error || "Google authentication failed");
        } finally {
            setLoggingIn(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();
        const cleanName = name.trim();

        if (!cleanEmail || !cleanPassword) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        if (authMode === 'signup' && !cleanName) {
            setErrorMessage("Please enter your full name.");
            return;
        }

        if (authMode === 'signup' && cleanPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        try {
            setIsSubmitting(true);
            const inviteToken = sessionStorage.getItem(SESSION_STORAGE.INVITE_TOKEN) || undefined;
            let data;
            if (authMode === 'signup') {
                data = await authApi.signup_with_email(cleanName, cleanEmail, cleanPassword, inviteToken);
            } else {
                data = await authApi.login_with_email(cleanEmail, cleanPassword);
            }

            login(data.token, data.user, data.is_admin ?? false);
            sessionStorage.removeItem(SESSION_STORAGE.INVITE_TOKEN);
        } catch (err: any) {
            const msg = err?.response?.data?.error || (authMode === 'signup' ? "Failed to create account. Please try again." : "Invalid email or password.");
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if ( user ) {
            navigate('/home');
            return;
        }
        const searchParams = new URLSearchParams(location.search);
        const urlToken = searchParams.get('token');
        if (urlToken) {
            sessionStorage.setItem(SESSION_STORAGE.INVITE_TOKEN, urlToken);
        }
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setAuthMode('signup');
        }
    }, [location.search, user]);

    return {
        handleGoogleSuccess,
        loggingIn,
        setLoggingIn,
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
    };
};

export default useLogin;
