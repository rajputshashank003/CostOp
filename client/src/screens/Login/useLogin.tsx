import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { CredentialResponse } from "@react-oauth/google";
import { authApi } from "../../utils/api_request/auth";
import { SESSION_STORAGE } from "../../utils/constants";
import { useEffect } from "react";

const useLogin = () => {
    const { login, user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (credentialResponse.credential) {
                const inviteToken = sessionStorage.getItem(SESSION_STORAGE.INVITE_TOKEN) || undefined;
                const data = await authApi.verify_google_token(credentialResponse.credential, inviteToken);
                // Process Login successfully!
                login(data.token, data.user, data.is_admin ?? false);
                // Wipe token after it has been safely deployed!
                sessionStorage.removeItem(SESSION_STORAGE.INVITE_TOKEN);
            }
        } catch (err) {
            // Global error mapping is handled natively by utils/api_request/utils.ts
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
    }, [location.search, user]);

    return {
        handleGoogleSuccess
    };
};

export default useLogin;
