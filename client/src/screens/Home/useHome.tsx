import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { metricsApi } from "../../utils/api_request/metrics";
import { historyApi } from "../../utils/api_request/history";
import { categoriesApi } from "../../utils/api_request/categories";
import { teamsApi } from "../../utils/api_request/teams";
import reduce from "lodash/reduce";
import map from "lodash/map";

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

const useHome = () => {
    const { user, isLoading: isAuthLoading } = useUser();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoadingSubs, setIsLoadingSubs] = useState(true);
    const [showMine, setShowMine] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

    // Filter and UI State
    const [localSearch, setLocalSearch] = useState(() => readParam("q", ""));
    const [searchQuery, setSearchQuery] = useState(() => readParam("q", ""));
    const [filterCategory, setFilterCategory] = useState(() => readParam("category", "All Categories"));
    const [filterCycle, setFilterCycle] = useState(() => readParam("cycle", "All Cycles"));
    const [filterTeam, setFilterTeam] = useState(() => readParam("team", "all"));

    const [availableCategories, setAvailableCategories] = useState<any[]>([{ value: "All Categories", label: "All Categories" }]);
    const [availableTeams, setAvailableTeams] = useState<any[]>([{ value: "all", label: "All Teams" }]);

    const [spendTimeframe, setSpendTimeframe] = useState<number | "current" | "custom">(() => {
        const raw = readParam("timeframe", "current");
        if (raw === "current" || raw === "custom") return raw;
        const n = parseInt(raw);
        return isNaN(n) ? "current" : n;
    });
    const [customStart, setCustomStart] = useState(() => readParam("cs", ""));
    const [customEnd, setCustomEnd] = useState(() => readParam("ce", ""));
    const [dateStart, setDateStart] = useState(() => readParam("start", ""));
    const [dateEnd, setDateEnd] = useState(() => readParam("end", ""));

    const [historicalSpendTotal, setHistoricalSpendTotal] = useState(0);
    const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

    // Modal States
    const [subToArchive, setSubToArchive] = useState<any>(null);
    const [isRenewalsModalOpen, setIsRenewalsModalOpen] = useState(false);

    const fetchSubscriptions = useCallback(async () => {
        if (isAuthLoading) return;
        setIsLoadingSubs(true);
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
        setIsLoadingMetrics(true);
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

    // Sync all filters to URL
    useEffect(() => {
        syncParams(searchQuery, filterCategory, filterCycle, String(spendTimeframe), customStart, customEnd, dateStart, dateEnd);
    }, [searchQuery, filterCategory, filterCycle, spendTimeframe, customStart, customEnd, dateStart, dateEnd]);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 400);
        return () => clearTimeout(handler);
    }, [localSearch]);

    // Fetch supporting data (categories, teams)
    useEffect(() => {
        const fetchSupportingData = async () => {
            try {
                const [categories, teams] = await Promise.all([
                    categoriesApi.get_all(),
                    teamsApi.get_all()
                ]);

                const catMapped = map((categories || []), (c: any) => ({ value: c.name, label: c.name }));
                setAvailableCategories([{ value: "All Categories", label: "All Categories" }, ...catMapped]);

                const teamMapped = map((teams || []), (t: any) => ({ value: String(t.id), label: t.name }));
                setAvailableTeams([{ value: "all", label: "All Teams" }, ...teamMapped]);
            } catch (err) {
                console.error("Error fetching supporting data:", err);
            }
        };
        fetchSupportingData();
    }, []);

    // Fetch historical spend total
    useEffect(() => {
        if (spendTimeframe === "current") return;
        if (spendTimeframe === "custom" && !customStart && !customEnd) return;

        const fetchHistorical = async () => {
            setIsLoadingHistorical(true);
            try {
                const res = await historyApi.get_spends(spendTimeframe, customStart, customEnd);
                const total = reduce((res || []), (acc: number, curr: any) => acc + curr.spend, 0);
                setHistoricalSpendTotal(total);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingHistorical(false);
            }
        };
        fetchHistorical();
    }, [spendTimeframe, customStart, customEnd]);

    const filteredSubscriptions = showMine
        ? subscriptions.filter((s: any) =>
            s.owner_id === user?.id ||
            (s.assigned_users && s.assigned_users.some((a: any) => a.user_id === user?.id))
        )
        : subscriptions;

    return {
        user,
        subscriptions: filteredSubscriptions,
        isLoadingSubs,
        showMine, setShowMine,
        metrics,
        isLoadingMetrics,
        localSearch,
        setLocalSearch,
        searchQuery,
        filterCategory,
        setFilterCategory,
        filterCycle,
        setFilterCycle,
        filterTeam,
        setFilterTeam,
        availableCategories,
        availableTeams,
        spendTimeframe,
        setSpendTimeframe,
        customStart,
        setCustomStart,
        customEnd,
        setCustomEnd,
        dateStart,
        setDateStart,
        dateEnd,
        setDateEnd,
        historicalSpendTotal,
        isLoadingHistorical,
        subToArchive,
        setSubToArchive,
        isRenewalsModalOpen,
        setIsRenewalsModalOpen,
        refreshSubscriptions: () => { fetchSubscriptions(); fetchMetrics(); }
    };
};

export default useHome;
