import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FormHeaderProps {
    isRequestMode: boolean;
    originRequest: any | null;
}

const FormHeader = ({ isRequestMode, originRequest }: FormHeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
                <button onClick={() => navigate(-1)} className="p-2 mt-1.5 bg-white text-slate-500 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-all border border-slate-200">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        {isRequestMode ? "Request a Subscription" : originRequest ? "Approve Subscription" : "Add Subscription"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {isRequestMode ? "Fill in details and submit for admin approval." : "Link a new tool to track cost and manage seat assignments."}
                    </p>
                </div>
            </div>
            {originRequest && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 hidden sm:block">
                    Fulfilling Request from {originRequest.requester_name || "Team Member"}
                </div>
            )}
            {isRequestMode && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 hidden sm:block">
                    Pending admin review
                </div>
            )}
        </div>
    );
};

export default FormHeader;
