import { useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { CredentialResponse } from "@react-oauth/google";
import { authApi } from "../../utils/api_request/auth";
import { SESSION_STORAGE } from "../../utils/constants";
import { useEffect } from "react";

const useLogin = () => {
    const { login } = useUser();
    const location = useLocation();

    // Aggressively capture any ?token= from the URL the second this mounts so we don't lose it on redirects!
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlToken = searchParams.get('token');
        if (urlToken) {
            sessionStorage.setItem(SESSION_STORAGE.INVITE_TOKEN, urlToken);
        }
    }, [location.search]);

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

    return {
        handleGoogleSuccess
    };
};

export default useLogin;
