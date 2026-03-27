import React, { useContext } from "react";
import { motion } from "framer-motion";
import OnboardingContext from "./context";
import useOnboarding from "./useOnboarding";
import OnboardingHeader from "./components/OnboardingHeader";
import OnboardingForm from "./components/OnboardingForm";

const OnboardingComp = () => {
    const { 
        user, 
        teamName, 
        setTeamName, 
        designation, 
        setDesignation, 
        isSubmitting, 
        handleSubmit 
    } = useContext(OnboardingContext);

    return (
        <div className="min-h-screen bg-[#f0f0f5] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <OnboardingHeader userName={user?.name?.split(' ')[0]} />
                <OnboardingForm
                    teamName={teamName}
                    setTeamName={setTeamName}
                    designation={designation}
                    setDesignation={setDesignation}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                />
            </motion.div>
        </div>
    );
};

export default function Onboarding() {
    const value = useOnboarding();

    return (
        <OnboardingContext.Provider value={value}>
            <OnboardingComp />
        </OnboardingContext.Provider>
    );
}
