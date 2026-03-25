import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../../hooks/useUser";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { categoriesApi } from "../../utils/api_request/categories";
import map from "lodash/map";

const useHistory = () => {
    const { isLoading: isAuthLoading } = useUser();
    const [archived, setArchived] = useState<any[]>([]);

    // isInitialLoading gates the full-page skeleton (first load only)
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    // isRefetching is a lightweight flag for subsequent filter/search refetches
    const [isRefetching, setIsRefetching] = useState(false);

    const hasFetchedOnce = useRef(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All Categories");
    const [filterCycle, setFilterCycle] = useState("All Cycles");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [localSearch, setLocalSearch] = useState("");
    const [availableCategories, setAvailableCategories] = useState<any[]>([{ value: "All Categories", label: "All Categories" }]);

    useEffect(() => {
        categoriesApi.get_all().then((res: any) => {
            const mapped = map((res || []), (c: any) => ({ value: c.name, label: c.name }));
            setAvailableCategories([{ value: "All Categories", label: "All Categories" }, ...mapped]);
        }).catch(console.error);
    }, []);

    // Debounce local search input → searchQuery
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 400);
        return () => clearTimeout(handler);
    }, [localSearch]);

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
    }, [isAuthLoading, searchQuery, filterCategory, filterCycle, dateStart, dateEnd]);

    useEffect(() => {
        fetchArchived();
    }, [fetchArchived]);

    return {
        archived,
        isLoading: isInitialLoading,
        isRefetching,
        searchQuery, setSearchQuery,
        filterCategory, setFilterCategory,
        filterCycle, setFilterCycle,
        dateStart, setDateStart,
        dateEnd, setDateEnd,
        localSearch, setLocalSearch,
        availableCategories,
        refreshArchived: fetchArchived
    };
};

export default useHistory;
