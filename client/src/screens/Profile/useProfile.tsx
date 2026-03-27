import { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { usersApi } from "../../utils/api_request/users";
import reduce from "lodash/reduce";

const useProfile = () => {
    const { user, isLoading: isAuthLoading } = useUser();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const totalCost = reduce(subscriptions, (sum, sub) => {
        let unitCost = sub.cost;
        if (sub.pricing_model === "per_seat" && sub.seat_count > 0) {
            unitCost = sub.cost / sub.seat_count;
        }
        return sum + unitCost;
    }, 0);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    useEffect(() => {
        if (isAuthLoading) return;
        const fetchSubscriptions = async () => {
            try {
                const res = await usersApi.get_profile_subscriptions();
                setSubscriptions(res || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubscriptions();
    }, [isAuthLoading]);

    return {
        user,
        isAuthLoading,
        subscriptions,
        isLoading,
        totalCost,
        formatter,
    };
};

export default useProfile;
