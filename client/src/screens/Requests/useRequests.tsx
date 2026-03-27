import { useState, useEffect, useCallback } from "react";
import { requestsApi } from "../../utils/api_request/requests";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const useRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await requestsApi.get_all(activeTab);
            setRequests(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    const handleApprove = (req: any) => {
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

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests, isLoading,
        activeTab, setActiveTab,
        handleApprove, handleReject,
    };
};

export default useRequests;
