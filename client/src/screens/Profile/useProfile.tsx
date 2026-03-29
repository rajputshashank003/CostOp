import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { usersApi } from "@/utils/api_request/users";
import reduce from "lodash/reduce";
import size from "lodash/size";
import map from "lodash/map";

const useProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { user: authUser, isLoading: isAuthLoading } = useUser();

    const isOwnProfile = !id || (authUser && Number(id) === authUser.id);

    const [profileUser, setProfileUser] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
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
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [isAuthLoading, id]);

    return {
        user: profileUser,
        teams,
        isOwnProfile,
        isAuthLoading,
        subscriptions,
        isLoading,
        totalCost,
        formatter,
    };
};

export default useProfile;
