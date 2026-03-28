import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../../hooks/useUser";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { categoriesApi } from "../../utils/api_request/categories";
import { teamsApi } from "../../utils/api_request/teams";
import { historyApi } from "../../utils/api_request/history";
import map from "lodash/map";

const useHistory = () => {
    const { user, isLoading: isAuthLoading } = useUser();
    const [archived, setArchived] = useState<any[]>([]);
    const [historyMode, setHistoryMode] = useState<"all" | "archived">("all");

    // isInitialLoading gates the full-page skeleton (first load only)
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    // isRefetching is a lightweight flag for subsequent filter/search refetches
    const [isRefetching, setIsRefetching] = useState(false);

    const hasFetchedOnce = useRef(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All Categories");
    const [filterCycle, setFilterCycle] = useState("All Cycles");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [localSearch, setLocalSearch] = useState("");
    const [filterTeam, setFilterTeam] = useState("all");

    // Supporting Data State
    const [availableCategories, setAvailableCategories] = useState<any[]>([{ value: "All Categories", label: "All Categories" }]);
    const [availableTeams, setAvailableTeams] = useState<any[]>([{ value: "all", label: "All Teams" }]);

    // Historical Chart Data State
    const [spendData, setSpendData] = useState<any[]>([]);
    const [isLoadingSpends, setIsLoadingSpends] = useState(false);
    const [spendsMonths, setSpendsMonths] = useState<number | "custom">(6);
    const [spendsCustomStart, setSpendsCustomStart] = useState<string>("");
    const [spendsCustomEnd, setSpendsCustomEnd] = useState<string>("");

    // Dept Chart Data State
    const [deptSpendData, setDeptSpendData] = useState<any[]>([]);
    const [isLoadingDeptSpends, setIsLoadingDeptSpends] = useState(false);

    // Debounce local search input → searchQuery
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

    const fetchArchived = useCallback(async () => {
        if (isAuthLoading) return;

        if (!hasFetchedOnce.current) {
            setIsInitialLoading(true);
        } else {
            setIsRefetching(true);
        }

        try {
            const data = await subscriptionsApi.get_all({
                status: "archived",
                search: searchQuery,
                category: filterCategory,
                cycle: filterCycle,
                team_id: filterTeam,
                ...(dateStart ? { start: dateStart + "-01" } : {}),
                ...(dateEnd ? { end: dateEnd + "-01" } : {}),
            });
            setArchived(Array.isArray(data) ? data : []);
        } catch (err) {
            setArchived([]);
        } finally {
            hasFetchedOnce.current = true;
            setIsInitialLoading(false);
            setIsRefetching(false);
        }
    }, [isAuthLoading, searchQuery, filterCategory, filterCycle, filterTeam, dateStart, dateEnd]);

    // Historical Spends Fetcher
    useEffect(() => {
        if (spendsMonths === "custom" && !spendsCustomStart && !spendsCustomEnd) return;

        const fetchSpends = async () => {
            setIsLoadingSpends(true);
            try {
                const res = await historyApi.get_spends(
                    spendsMonths,
                    spendsCustomStart,
                    spendsCustomEnd,
                    filterTeam,
                    historyMode === "all" ? undefined : "archived"
                );
                setSpendData(res || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingSpends(false);
            }
        };
        fetchSpends();
    }, [spendsMonths, spendsCustomStart, spendsCustomEnd, filterTeam, historyMode]);

    // Dept Spends Fetcher
    useEffect(() => {
        const fetchDeptSpends = async () => {
            setIsLoadingDeptSpends(true);
            try {
                const res = await historyApi.get_department_spends(
                    filterTeam,
                    historyMode === "all" ? undefined : "archived"
                );
                setDeptSpendData(res || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingDeptSpends(false);
            }
        };
        fetchDeptSpends();
    }, [filterTeam, historyMode]);

    useEffect(() => {
        fetchArchived();
    }, [fetchArchived]);

    return {
        user,
        archived,
        isLoading: isInitialLoading,
        isRefetching,
        historyMode,
        setHistoryMode,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        filterCycle,
        setFilterCycle,
        dateStart,
        setDateStart,
        dateEnd,
        setDateEnd,
        localSearch,
        setLocalSearch,
        filterTeam,
        setFilterTeam,
        availableCategories,
        availableTeams,
        spendData,
        isLoadingSpends,
        spendsMonths,
        setSpendsMonths,
        spendsCustomStart,
        setSpendsCustomStart,
        spendsCustomEnd,
        setSpendsCustomEnd,
        deptSpendData,
        isLoadingDeptSpends,
        refreshArchived: fetchArchived
    };
};

export default useHistory;
