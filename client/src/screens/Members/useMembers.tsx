import { useState, useEffect, useCallback } from "react";
import { membersApi } from "../../utils/api_request/members";
import { teamsApi } from "../../utils/api_request/teams";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const useMembers = () => {
    const { user, isLoading: isAuthLoading } = useUser();

    // Team state — null means "All Teams"
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    // Filtering state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [subscriptionFilter, setSubscriptionFilter] = useState("all");

    // Roster state
    const [members, setMembers] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allowMemberInvites, setAllowMemberInvites] = useState(true);

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDesignation, setInviteDesignation] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");

    // Fetch roster whenever selected team OR filters change
    const fetchRoster = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = selectedTeamId === null
                ? await membersApi.get_all(debouncedSearchQuery, subscriptionFilter)
                : await membersApi.get_by_team(selectedTeamId, debouncedSearchQuery, subscriptionFilter);
            setMembers(data.members || []);
            setInvites(data.invites || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedTeamId, debouncedSearchQuery, subscriptionFilter]);

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

    useEffect(() => {
        fetchRoster();
    }, [fetchRoster]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Load all teams the user belongs to
    useEffect(() => {
        if (isAuthLoading) return;
        const fetchTeams = async () => {
            try {
                const data = await membersApi.get_teams();
                setTeams(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeams();
    }, [isAuthLoading, user]);

    // Fetch team settings when the selected team changes
    useEffect(() => {
        if (!selectedTeamId) return;
        const fetchTeamSettings = async () => {
            try {
                const team = await teamsApi.get_by_id(selectedTeamId);
                setAllowMemberInvites(team.allow_member_invites ?? true);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeamSettings();
    }, [selectedTeamId]);


    return {
        teams,
        selectedTeamId,
        setSelectedTeamId,
        members,
        invites,
        isLoading,
        allowMemberInvites,
        inviteEmail,
        setInviteEmail,
        inviteDesignation,
        setInviteDesignation,
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
