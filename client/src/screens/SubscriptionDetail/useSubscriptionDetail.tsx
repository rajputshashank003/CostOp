import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subscriptionsApi } from "../../utils/api_request/subscriptions";
import toUpper from "lodash/toUpper";
import head from "lodash/head";

const useSubscriptionDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    const sub = data?.subscription;
    const initial = sub?.name ? toUpper(head(sub.name) as string) : "?";
    const seatPercent = data?.seat_count > 0 ? Math.round((data.occupied_seats / data.seat_count) * 100) : 0;

    let nextBilling = "TBD";
    if (sub?.is_auto_pay === false) {
        nextBilling = "One Time";
    } else if (sub?.next_billing_date) {
        nextBilling = new Date(sub.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const res = await subscriptionsApi.get_by_id(id);
                setData(res);
            } catch {
                navigate("/home");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const refreshData = useCallback(async () => {
        if (!id) return;
        try {
            const res = await subscriptionsApi.get_by_id(id);
            setData(res);
        } catch { }
    }, [id]);

    return {
        data,
        isLoading,
        imgError,
        setImgError,
        formatter,
        sub,
        initial,
        seatPercent,
        nextBilling,
        navigate,
        refreshData,
    };
};

export default useSubscriptionDetail;
