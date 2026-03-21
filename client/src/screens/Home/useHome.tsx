import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { metricsApi } from "../../utils/api_request/metrics";

const useHome = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoadingSubs, setIsLoadingSubs] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const { isLoading: isAuthLoading } = useUser();

    const fetchSubscriptions = useCallback(async () => {
        if (isAuthLoading) return;

        try {
            const data = await subscriptionsApi.get_all();
            setSubscriptions(Array.isArray(data) ? data : []);
        } catch (err) {
            setSubscriptions([]);
            // Toast logging and 401 unauth session clearing is handled globally by api_request/utils.ts
        } finally {
            setIsLoadingSubs(false);
        }
    }, [isAuthLoading]);

    const fetchMetrics = useCallback(async () => {
        if (isAuthLoading) return;

        try {
            const data = await metricsApi.get_summary();
            setMetrics(data);
        } catch (err) {
            setMetrics(null);
        } finally {
            setIsLoadingMetrics(false);
        }
    }, [isAuthLoading]);

    useEffect(() => {
        fetchSubscriptions();
        fetchMetrics();
    }, [fetchSubscriptions, fetchMetrics]);

    return {
        subscriptions,
        isLoadingSubs,
        metrics,
        isLoadingMetrics,
        refreshSubscriptions: () => { fetchSubscriptions(); fetchMetrics(); }
    };
};

export default useHome;
