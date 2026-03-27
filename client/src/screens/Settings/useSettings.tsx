import { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { teamsApi } from "../../utils/api_request/teams";
import toast from "react-hot-toast";

const useSettings = () => {
    const { user, isLoading } = useUser();

    const [teamName, setTeamName] = useState("");
    const [allowInvites, setAllowInvites] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const handleSave = async () => {
        if (!teamName) return;
        setIsSaving(true);
        try {
            await teamsApi.update_settings({
                teamId: user?.default_team_id!,
                name: teamName,
                allow_member_invites: allowInvites,
            });
            toast.success("Workspace settings updated!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!user?.default_team_id) return;
        const fetchTeam = async () => {
            try {
                const team = await teamsApi.get_by_id(user.default_team_id);
                setTeamName(team.name || "");
                setAllowInvites(team.allow_member_invites ?? true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchTeam();
    }, [user?.default_team_id]);


    return {
        isLoading,
        isFetching,
        teamName,
        setTeamName,
        allowInvites,
        setAllowInvites,
        isSaving,
        handleSave,
    };
};

export default useSettings;
