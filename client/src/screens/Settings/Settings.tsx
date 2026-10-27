import React, { useContext } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import SettingsContext from "./context";
import useSettings from "./useSettings";
import SettingsHeader from "./components/SettingsHeader";
import WorkspaceProfileCard from "./components/WorkspaceProfileCard";
import SecurityCard from "./components/SecurityCard";
import BillingCard from "./components/BillingCard";
import SlackIntegrationCard from "./components/SlackIntegrationCard";
import SettingsSkeleton from "../../components/Skeleton/SettingsSkeleton";

const SettingsComp = () => {
    const {
        isLoading, isFetching,
        teamName, setTeamName,
        allowInvites, setAllowInvites,
        slackWebhookUrl, setSlackWebhookUrl,
        orgDetails, isPro,
        isSaving, handleSave,
        refreshOrgDetails,
    } = useContext(SettingsContext);

    if (isLoading || isFetching) {
        return <SettingsSkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <SettingsHeader />
                <div className="p-4 sm:p-8 max-w-4xl w-full mx-auto">
                    <BillingCard orgDetails={orgDetails} onUpgradeSuccess={refreshOrgDetails} />
                    <WorkspaceProfileCard teamName={teamName} setTeamName={setTeamName} />
                    <SlackIntegrationCard isPro={isPro} webhookUrl={slackWebhookUrl} setWebhookUrl={setSlackWebhookUrl} />
                    <SecurityCard allowInvites={allowInvites} setAllowInvites={setAllowInvites} />
                    <div className="flex justify-end pb-8">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-8 py-3.5 rounded-xl text-white font-extrabold text-[15px] transition-all shadow-lg flex items-center gap-2 ${isSaving ? 'bg-emerald-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/25 cursor-pointer'}`}
                        >
                            {isSaving ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Save Preferences'
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default function Settings() {
    const value = useSettings();
    return (
        <SettingsContext.Provider value={value}>
            <SettingsComp />
        </SettingsContext.Provider>
    );
}
