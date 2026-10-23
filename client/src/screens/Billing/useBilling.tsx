import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { organizationApi, OrganizationDetails } from "../../utils/api_request/organization";
import { paymentApi, PricingInfo } from "../../utils/api_request/payment";
import { startRazorpayCheckout } from "../../utils/razorpay";
import toast from "react-hot-toast";

export default function useBilling() {
    const { user, isLoading } = useUser();
    const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
    const [pricing, setPricing] = useState<PricingInfo | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
    const [isUpgrading, setIsUpgrading] = useState(false);

    const isPro = orgDetails?.plan === "pro";
    const activeMembers = orgDetails?.active_members_count ?? 1;
    const memberLimit = orgDetails?.member_limit ?? 30;
    const usagePercent = Math.min(100, Math.round((activeMembers / memberLimit) * 100));

    const fetchOrgDetails = useCallback(async () => {
        try {
            const [data, pricingData] = await Promise.all([
                organizationApi.get_details(),
                paymentApi.get_pricing().catch(() => null),
            ]);
            setOrgDetails(data);
            if (pricingData) setPricing(pricingData);
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
        if (isPro) {
            toast("Your workspace is already on the Pro plan!", { icon: "✨" });
            return;
        }

        setIsUpgrading(true);
        try {
            await startRazorpayCheckout({
                userEmail: user?.email,
                userName: user?.name,
                interval: billingInterval,
                onSuccess: () => {
                    setIsUpgrading(false);
                    fetchOrgDetails();
                },
                onError: () => {
                    setIsUpgrading(false);
                },
            });
        } catch (err: any) {
            setIsUpgrading(false);
            console.error("Checkout initiation failed:", err);
        }
    };

    return {
        isLoading,
        isFetching,
        orgDetails,
        pricing,
        isPro,
        activeMembers,
        memberLimit,
        usagePercent,
        billingInterval,
        setBillingInterval,
        isUpgrading,
        handleUpgrade,
        refreshOrgDetails: fetchOrgDetails,
    };
}
