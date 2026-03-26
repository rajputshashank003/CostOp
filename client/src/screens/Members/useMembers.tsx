import { useState, useEffect, useCallback } from "react";
import { membersApi } from "../../utils/api_request/members";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const useMembers = () => {
    const { user, isLoading: isAuthLoading } = useUser();

    // Team state
    // Team state
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    // Filtering state
    const [searchQuery, setSearchQuery] = useState("");
    const [subscriptionFilter, setSubscriptionFilter] = useState("all");

    // Roster state
    const [members, setMembers] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDesignation, setInviteDesignation] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");

    // Load all teams the user belongs to
    useEffect(() => {
        if (isAuthLoading) return;
        membersApi.get_teams().then((data: any[]) => {
            setTeams(data || []);
            // Default to the user's current default_team_id
            if (data && data.length > 0 && user?.default_team_id) {
                const found = data.find((t: any) => t.id === user.default_team_id);
                setSelectedTeamId(found ? found.id : data[0].id);
            } else if (data?.length > 0) {
                setSelectedTeamId(data[0].id);
            }
        }).catch(console.error);
    }, [isAuthLoading, user]);

    // Fetch roster whenever selected team changes
    const fetchRoster = useCallback(() => {
        if (!selectedTeamId) return;
        setIsLoading(true);
        membersApi.get_by_team(selectedTeamId)
            .then((data: any) => {
                setMembers(data.members || []);
                setInvites(data.invites || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [selectedTeamId]);

    useEffect(() => {
        fetchRoster();
    }, [fetchRoster]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setIsInviting(true);
        setGeneratedLink("");
        try {
            const res = await membersApi.invite(inviteEmail, inviteDesignation, selectedTeamId ?? undefined);
            toast.success("Invitation created! You can copy the link.");
            if (res.invite_link) setGeneratedLink(res.invite_link);
            setInviteEmail("");
            setInviteDesignation("");
            fetchRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to send invitation.");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            await membersApi.revoke(id);
            toast.success("Invite revoked successfully");
            fetchRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to revoke invite.");
        }
    };

    const handleMoveToTeam = async (userId: number, newTeamId: number) => {
        if (!selectedTeamId) return;
        try {
            await membersApi.update_member_team(selectedTeamId, userId, newTeamId);
            toast.success("Member moved to new team");
            fetchRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to move member.");
        }
    };

    return {
        teams, selectedTeamId, setSelectedTeamId,
        members, invites,
        isLoading,
        inviteEmail, setInviteEmail,
        inviteDesignation, setInviteDesignation,
        isInviting,
        generatedLink, setGeneratedLink,
        handleInvite,
        handleRevoke,
        handleMoveToTeam,
        fetchRoster,
        searchQuery, setSearchQuery,
        subscriptionFilter, setSubscriptionFilter
    };
};

export default useMembers;
