import { useState, useEffect, useCallback } from "react";
import { requestsApi } from "../../utils/api_request/requests";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const useRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const fetchRequests = useCallback(() => {
        setIsLoading(true);
        requestsApi.get_all(activeTab)
            .then((data: any) => setRequests(data || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [activeTab]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = (req: any) => {
        // Redirect admin to the full form to fill in remaining details (start date, seats, etc.)
        navigate("/add-subscription", { state: { request: req } });
    };

    const handleReject = async (id: number) => {
        try {
            await requestsApi.reject(id);
            toast.success("Request rejected.");
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to reject.");
        }
    };

    return {
        requests, isLoading,
        activeTab, setActiveTab,
        handleApprove, handleReject,
    };
};

export default useRequests;
