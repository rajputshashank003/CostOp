import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { organizationApi, OrganizationDetails } from "../../utils/api_request/organization";
import { startRazorpayCheckout } from "../../utils/razorpay";
import toast from "react-hot-toast";

export default function useBilling() {
    const { user, isLoading } = useUser();
    const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
    const [isUpgrading, setIsUpgrading] = useState(false);

    const isPro = orgDetails?.plan === "pro";
    const activeMembers = orgDetails?.active_members_count ?? 1;
    const memberLimit = orgDetails?.member_limit ?? 30;
    const usagePercent = Math.min(100, Math.round((activeMembers / memberLimit) * 100));

    const fetchOrgDetails = useCallback(async () => {
        try {
            const data = await organizationApi.get_details();
            setOrgDetails(data);
        } catch (err: any) {
            console.error("Failed to load organization billing details:", err);
            toast.error(err?.response?.data?.error || "Failed to load billing details");
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchOrgDetails();
    }, [fetchOrgDetails]);

    const handleUpgrade = async () => {
        toast("This feature is currently under maintenance. Please try again later.", {
            icon: "🔧",
            duration: 4000,
            style: {
                borderRadius: '16px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                fontSize: '13px',
                fontWeight: '600',
                padding: '12px 16px',
            },
        });
    };

    const handleDirectTestUpgrade = async () => {
        toast("This feature is currently under maintenance. Please try again later.", {
            icon: "🔧",
            duration: 4000,
            style: {
                borderRadius: '16px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                fontSize: '13px',
                fontWeight: '600',
                padding: '12px 16px',
            },
        });
    };

    return {
        isLoading,
        isFetching,
        orgDetails,
        isPro,
        activeMembers,
        memberLimit,
        usagePercent,
        billingInterval,
        setBillingInterval,
        isUpgrading,
        handleUpgrade,
        handleDirectTestUpgrade,
        refreshOrgDetails: fetchOrgDetails,
    };
}
