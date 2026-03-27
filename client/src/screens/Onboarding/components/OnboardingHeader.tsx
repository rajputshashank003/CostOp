import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface OnboardingHeaderProps {
    userName?: string;
}

const OnboardingHeader = ({ userName }: OnboardingHeaderProps) => {
    return (
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/20 shadow-lg"
            >
                <Building2 size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-white mb-2 relative z-10">Let's set up your workspace</h1>
            <p className="text-emerald-50 font-medium relative z-10 text-sm">
                Welcome {userName || "aboard"}! Tell us a bit about you and your organization to get started.
            </p>
        </div>
    );
};

export default OnboardingHeader;
