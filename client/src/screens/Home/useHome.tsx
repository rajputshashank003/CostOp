import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { metricsApi } from "../../utils/api_request/metrics";
import { historyApi } from "../../utils/api_request/history";
import reduce from "lodash/reduce";

const readParam = (key: string, fallback: string): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || fallback;
};

const syncParams = (search: string, category: string, cycle: string, spendTimeframe: string, customStart: string, customEnd: string, dateStart: string, dateEnd: string) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "All Categories") params.set("category", category);
    if (cycle !== "All Cycles") params.set("cycle", cycle);
    if (spendTimeframe !== "current") params.set("timeframe", String(spendTimeframe));
    if (customStart) params.set("cs", customStart);
    if (customEnd) params.set("ce", customEnd);
    if (dateStart) params.set("start", dateStart);
    if (dateEnd) params.set("end", dateEnd);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
};

// Convert a "last N months" timeframe to ISO date strings
const timeframeToRange = (timeframe: number | "current" | "custom", customStart: string, customEnd: string): { start?: string; end?: string } => {
    if (timeframe === "current" || timeframe === "custom") {
        return { start: customStart || undefined, end: customEnd || undefined };
    }
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - (timeframe as number));
    return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
    };
};

const useHome = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoadingSubs, setIsLoadingSubs] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const { isLoading: isAuthLoading } = useUser();

    // Initialise from URL on first mount
    const [searchQuery, setSearchQuery] = useState(() => readParam("q", ""));
    const [filterCategory, setFilterCategory] = useState(() => readParam("category", "All Categories"));
    const [filterCycle, setFilterCycle] = useState(() => readParam("cycle", "All Cycles"));
    const [filterTeam, setFilterTeam] = useState(() => readParam("team", "all"));

    // Date range / spend widget (lifted here so it drives subscriptions fetch)
    const [spendTimeframe, setSpendTimeframe] = useState<number | "current" | "custom">(() => {
        const raw = readParam("timeframe", "current");
        if (raw === "current" || raw === "custom") return raw;
        const n = parseInt(raw);
        return isNaN(n) ? "current" : n;
    });
    const [customStart, setCustomStart] = useState(() => readParam("cs", ""));
    const [customEnd, setCustomEnd] = useState(() => readParam("ce", ""));

    // Separate date range for the subscription list (next_billing_date filter)
    const [dateStart, setDateStart] = useState(() => readParam("start", ""));
    const [dateEnd, setDateEnd] = useState(() => readParam("end", ""));

    // Derived historical spend total for the widget
    const [historicalSpendTotal, setHistoricalSpendTotal] = useState(0);
    const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

    // Sync all filters to URL
    useEffect(() => {
        syncParams(searchQuery, filterCategory, filterCycle, String(spendTimeframe), customStart, customEnd, dateStart, dateEnd);
    }, [searchQuery, filterCategory, filterCycle, spendTimeframe, customStart, customEnd, dateStart, dateEnd]);

    // Fetch historical spend total for the widget number (separate from list filter)
    useEffect(() => {
        if (spendTimeframe === "current") return;
        if (spendTimeframe === "custom" && !customStart && !customEnd) return;

        setIsLoadingHistorical(true);
        historyApi.get_spends(spendTimeframe, customStart, customEnd)
            .then((res: any) => {
                const total = reduce((res || []), (acc: number, curr: any) => acc + curr.spend, 0);
                setHistoricalSpendTotal(total);
            })
            .catch((err: any) => console.error(err))
            .finally(() => setIsLoadingHistorical(false));
    }, [spendTimeframe, customStart, customEnd]);

    const fetchSubscriptions = useCallback(async () => {
        if (isAuthLoading) return;

        try {
            const data = await subscriptionsApi.get_all({
                search: searchQuery,
                category: filterCategory,
                cycle: filterCycle,
                team_id: filterTeam,
                ...(dateStart ? { start: dateStart + "-01" } : {}),
                ...(dateEnd ? { end: dateEnd + "-01" } : {}),
            });
            setSubscriptions(Array.isArray(data) ? data : []);
        } catch (err) {
            setSubscriptions([]);
        } finally {
            setIsLoadingSubs(false);
        }
    }, [isAuthLoading, searchQuery, filterCategory, filterCycle, filterTeam, dateStart, dateEnd]);

    const fetchMetrics = useCallback(async () => {
        if (isAuthLoading) return;

        try {
            const data = await metricsApi.get_summary({
                search: searchQuery,
                category: filterCategory,
                cycle: filterCycle,
                team_id: filterTeam,
                ...(dateStart ? { start: dateStart + "-01" } : {}),
                ...(dateEnd ? { end: dateEnd + "-01" } : {}),
            });
            setMetrics(data);
        } catch (err) {
            setMetrics(null);
        } finally {
            setIsLoadingMetrics(false);
        }
    }, [isAuthLoading, searchQuery, filterCategory, filterCycle, filterTeam, dateStart, dateEnd]);

    useEffect(() => {
        fetchSubscriptions();
        fetchMetrics();
    }, [fetchSubscriptions, fetchMetrics]);

    return {
        subscriptions,
        isLoadingSubs,
        metrics,
        isLoadingMetrics,
        searchQuery, setSearchQuery,
        filterCategory, setFilterCategory,
        filterCycle, setFilterCycle,
        spendTimeframe, setSpendTimeframe,
        customStart, setCustomStart,
        customEnd, setCustomEnd,
        dateStart, setDateStart,
        dateEnd, setDateEnd,
        historicalSpendTotal,
        isLoadingHistorical,
        filterTeam, setFilterTeam,
        refreshSubscriptions: () => { fetchSubscriptions(); fetchMetrics(); }
    };
};

export default useHome;
