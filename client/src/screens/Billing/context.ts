import { createContext } from "react";
import { OrganizationDetails } from "../../utils/api_request/organization";

export interface BillingContextType {
    isLoading: boolean;
    isFetching: boolean;
    orgDetails: OrganizationDetails | null;
    isPro: boolean;
    activeMembers: number;
    memberLimit: number;
    usagePercent: number;
    billingInterval: "monthly" | "annual";
    setBillingInterval: (interval: "monthly" | "annual") => void;
    isUpgrading: boolean;
    handleUpgrade: () => Promise<void>;
    handleDirectTestUpgrade: () => Promise<void>;
    refreshOrgDetails: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType>({} as BillingContextType);

export default BillingContext;
