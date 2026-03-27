import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { usersApi } from "../../utils/api_request/users";
import toast from "react-hot-toast";
import React from "react";

const useOnboarding = () => {
    const { user, updateOnboardingStatus } = useUser();
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState("");
    const [designation, setDesignation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName || !designation) {
            toast.error("Please fill in both fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await usersApi.onboard({ team_name: teamName, designation });

            updateOnboardingStatus(res?.is_admin === true);
            toast.success("Welcome aboard!");
            navigate("/home");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to complete onboarding");
            setIsSubmitting(false);
        }
    };

    return {
        user,
        teamName,
        setTeamName,
        designation,
        setDesignation,
        isSubmitting,
        handleSubmit,
    };
};

export default useOnboarding;
