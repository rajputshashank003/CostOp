import { useState, useEffect, useCallback } from "react";
import { requestsApi } from "../../utils/api_request/requests";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const useRequests = () => {
    const { isLoading: isAuthLoading } = useUser();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    // Request form state
    const [form, setForm] = useState({
        name: "",
        category: "",
        plan_type: "Team",
        billing_cycle: "Monthly",
        scope: "team",
        cost: "",
        seat_count: "1",
        justification: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRequests = useCallback(() => {
        setIsLoading(true);
        requestsApi.get_all(activeTab)
            .then((data: any) => setRequests(data || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [activeTab]);

    useEffect(() => {
        if (!isAuthLoading) fetchRequests();
    }, [isAuthLoading, fetchRequests]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        setIsSubmitting(true);
        try {
            await requestsApi.create({
                name: form.name,
                category: form.category,
                plan_type: form.plan_type,
                billing_cycle: form.billing_cycle,
                scope: form.scope,
                cost: parseFloat(form.cost) || 0,
                seat_count: parseInt(form.seat_count) || 1,
                justification: form.justification,
            });
            toast.success("Request submitted! Waiting for admin approval.");
            setForm({ name: "", category: "", plan_type: "Team", billing_cycle: "Monthly", scope: "team", cost: "", seat_count: "1", justification: "" });
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await requestsApi.approve(id);
            toast.success("Request approved! Subscription created.");
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to approve.");
        }
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
        form, setForm,
        isSubmitting,
        handleSubmit,
        handleApprove,
        handleReject,
    };
};

export default useRequests;
