import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { usersApi } from "@/utils/api_request/users";
import { membersApi } from "@/utils/api_request/members";
import { teamsApi } from "@/utils/api_request/teams";
import toast from "react-hot-toast";
import reduce from "lodash/reduce";
import size from "lodash/size";
import map from "lodash/map";

const useProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { user: authUser, isLoading: isAuthLoading } = useUser();

    const isOwnProfile = !id || (authUser && Number(id) === authUser.id);

    const [profileUser, setProfileUser] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const totalCost = useMemo(() => reduce(subscriptions, (sum, sub) => {
        let unitCost = sub.cost;
        if (sub.pricing_model === "per_seat" && sub.seat_count > 0) {
            unitCost = sub.cost / sub.seat_count;
        }
        return sum + unitCost;
    }, 0), [subscriptions]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    useEffect(() => {
        if (isAuthLoading) return;

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                if (isOwnProfile) {
                    // Fetch own profile data
                    const subs = await usersApi.get_profile_subscriptions();
                    setProfileUser(authUser);
                    setTeams([]);
                    setSubscriptions(subs || []);
                } else {
                    // Fetch another user's profile
                    const res = await usersApi.get_user_profile(Number(id));
                    setProfileUser(res.user);
                    setTeams(res.teams || []);
                    setSubscriptions(res.subscriptions || []);
                }

                // Fetch all teams for the move dropdown if the viewer is an admin
                if (authUser?.is_admin) {
                    const allData = await teamsApi.get_all();
                    setAllTeams(allData || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [isAuthLoading, id, isOwnProfile, authUser]);

    const fetchProfileData = useCallback(async () => {
        try {
            if (isOwnProfile) {
                const subs = await usersApi.get_profile_subscriptions();
                setProfileUser(authUser);
                setTeams([]);
                setSubscriptions(subs || []);
            } else {
                const res = await usersApi.get_user_profile(Number(id));
                setProfileUser(res.user);
                setTeams(res.teams || []);
                setSubscriptions(res.subscriptions || []);
            }
        } catch (err) {
            console.error(err);
        }
    }, [id, isOwnProfile, authUser]);

    const handleMoveToTeam = async (userId: number, currentTeamId: number, newTeamId: number) => {
        try {
            await membersApi.update_member_team(currentTeamId, userId, newTeamId);
            toast.success("Member moved to new team");
            fetchProfileData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to move member.");
        }
    };

    const handleCreateTeam = async (name: string) => {
        try {
            await teamsApi.create(name);
            const allData = await teamsApi.get_all();
            setAllTeams(allData || []);
            toast.success(`Team "${name}" created`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to create team.");
        }
    };

    return {
        user: profileUser,
        teams,
        isOwnProfile,
        isAuthLoading,
        subscriptions,
        isLoading,
        totalCost,
        formatter,
        allTeams,
        handleMoveToTeam,
        handleCreateTeam,
    };
};

export default useProfile;
