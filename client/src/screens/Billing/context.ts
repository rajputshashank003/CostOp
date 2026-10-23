import { createContext } from "react";
import { OrganizationDetails } from "../../utils/api_request/organization";
import { PricingInfo } from "../../utils/api_request/payment";

export interface BillingContextType {
    isLoading: boolean;
    isFetching: boolean;
    orgDetails: OrganizationDetails | null;
    pricing: PricingInfo | null;
    isPro: boolean;
    activeMembers: number;
    memberLimit: number;
    usagePercent: number;
    billingInterval: "monthly" | "annual";
    setBillingInterval: (interval: "monthly" | "annual") => void;
    isUpgrading: boolean;
    handleUpgrade: () => Promise<void>;
    refreshOrgDetails: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType>({} as BillingContextType);

export default BillingContext;
