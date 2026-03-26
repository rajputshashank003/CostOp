import { useUser } from "../../hooks/useUser";
import Sidebar from "../../components/Sidebar/Sidebar";
import MembersSkeleton from "../../components/Skeleton/MembersSkeleton";
import MembersContext from "./context";
import useMembers from "./useMembers";
import MembersHeader from "./components/MembersHeader";
import InviteCard from "./components/InviteCard";
import MembersToolbar from "./components/MembersToolbar";
import MembersRoster from "./components/MembersRoster";
import { useContext } from "react";

const MembersComp = () => {
    const { isLoading: isAuthLoading } = useUser();
    const { isLoading } = useContext(MembersContext);

    if (isLoading || isAuthLoading) {
        return <MembersSkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <MembersHeader />

                <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
                    <InviteCard />
                    <MembersToolbar />
                    <MembersRoster />
                </div>
            </main>
        </div>
    );
};

export default function Members() {
    const membersState = useMembers();

    return (
        <MembersContext.Provider value={membersState}>
            <MembersComp />
        </MembersContext.Provider>
    );
}
