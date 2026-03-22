import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import { categoriesApi } from "../../utils/api_request/categories";
import map from "lodash/map";

const useHistory = () => {
    const { isLoading: isAuthLoading } = useUser();
    const [archived, setArchived] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All Categories");
    const [filterCycle, setFilterCycle] = useState("All Cycles");
    const [localSearch, setLocalSearch] = useState("");
    const [availableCategories, setAvailableCategories] = useState<any[]>([{ value: "All Categories", label: "All Categories" }]);

    useEffect(() => {
        categoriesApi.get_all().then((res: any) => {
            const mapped = map((res || []), (c: any) => ({ value: c.name, label: c.name }));
            setAvailableCategories([{ value: "All Categories", label: "All Categories" }, ...mapped]);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 400);
        return () => clearTimeout(handler);
    }, [localSearch]);

    const fetchArchived = useCallback(async () => {
        if (isAuthLoading) return;
        setIsLoading(true);
        try {
            const data = await subscriptionsApi.get_all({
                status: "archived",
                search: searchQuery,
                category: filterCategory,
                cycle: filterCycle
            });
            setArchived(data || []);
        } catch (err) {
            setArchived([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthLoading, searchQuery, filterCategory, filterCycle]);

    useEffect(() => {
        fetchArchived();
    }, [fetchArchived]);

    return {
        archived,
        isLoading,
        searchQuery, setSearchQuery,
        filterCategory, setFilterCategory,
        filterCycle, setFilterCycle,
        localSearch, setLocalSearch,
        availableCategories,
        refreshArchived: fetchArchived
    };
};

export default useHistory;
