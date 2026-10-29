import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import { teamsApi } from "../../utils/api_request/teams";
import { organizationApi, OrganizationDetails } from "../../utils/api_request/organization";
import toast from "react-hot-toast";
import { CurrencyCode, DEFAULT_CURRENCY } from "../../context/CurrencyContext";
import { useMoney } from "../../hooks/useMoney";

const useSettings = () => {
    const { user, isLoading } = useUser();

    const [teamName, setTeamName] = useState("");
    const [allowInvites, setAllowInvites] = useState(true);
    const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
    const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
    const { setCurrency: applyWorkspaceCurrency } = useMoney();
    const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const isPro = orgDetails?.plan === "pro";

    const fetchOrgAndTeam = useCallback(async () => {
        if (!user?.default_team_id) return;
        try {
            const [team, org] = await Promise.all([
                teamsApi.get_by_id(user.default_team_id),
                organizationApi.get_details(),
            ]);
            setTeamName(team.name || "");
            setAllowInvites(team.allow_member_invites ?? true);
            setOrgDetails(org);
            setSlackWebhookUrl(org.slack_webhook_url || "");
            setCurrency(org.currency === "USD" ? "USD" : "INR");
        } catch (err) {
            console.error("Failed to load settings:", err);
        } finally {
            setIsFetching(false);
        }
    }, [user?.default_team_id]);

    useEffect(() => {
        fetchOrgAndTeam();
    }, [fetchOrgAndTeam]);

    const handleSave = async () => {
        if (!teamName) return;
        setIsSaving(true);
        try {
            const promises: Promise<any>[] = [
                teamsApi.update_settings({
                    teamId: user?.default_team_id!,
                    name: teamName,
                    allow_member_invites: allowInvites,
                }),
            ];

            // One org update so concurrent saves can't overwrite each other's fields
            const orgUpdate: { slack_webhook_url?: string; currency?: CurrencyCode } = {};
            if (isPro) {
                orgUpdate.slack_webhook_url = slackWebhookUrl;
            }
            // Only send the currency when it changed, so members who can't edit org settings can still save
            const currencyChanged = currency !== (orgDetails?.currency ?? DEFAULT_CURRENCY);
            if (currencyChanged) {
                orgUpdate.currency = currency;
            }
            if (Object.keys(orgUpdate).length > 0) {
                promises.push(organizationApi.update_settings(orgUpdate));
            }

            await Promise.all(promises);
            if (currencyChanged) applyWorkspaceCurrency(currency);
            toast.success("Workspace preferences updated!");
            fetchOrgAndTeam();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isFetching,
        teamName,
        setTeamName,
        allowInvites,
        setAllowInvites,
        slackWebhookUrl,
        setSlackWebhookUrl,
        currency,
        setCurrency,
        orgDetails,
        isPro,
        isSaving,
        handleSave,
        refreshOrgDetails: fetchOrgAndTeam,
    };
};

export default useSettings;

