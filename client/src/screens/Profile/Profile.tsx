import { useContext } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import ProfileContext from "./context";
import useProfile from "./useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileToolsList from "./components/ProfileToolsList";

const ProfileComp = () => {
    const { user, isAuthLoading, subscriptions, isLoading, totalCost, formatter } = useContext(ProfileContext);

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen bg-[#f0f0f5]">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></span>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header title="My Profile" />
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <ProfileHeader
                            user={user}
                            totalCost={totalCost}
                            subscriptionCount={subscriptions.length}
                            formatter={formatter}
                        />
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-800 mb-6 px-2">Assigned Software Stack</h2>
                            <ProfileToolsList subscriptions={subscriptions} isLoading={isLoading} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default function Profile() {
    const value = useProfile();
    return (
        <ProfileContext.Provider value={value}>
            <ProfileComp />
        </ProfileContext.Provider>
    );
}
