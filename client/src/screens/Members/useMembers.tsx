import { useState, useEffect, useCallback } from "react";
import { membersApi } from "../../utils/api_request/members";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const useMembers = () => {
    const { isLoading: isAuthLoading } = useUser();
    const [members, setMembers] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");

    const fetchRoster = useCallback(() => {
        setIsLoading(true);
        membersApi.get_all()
            .then(data => {
                setMembers(data.members || []);
                setInvites(data.invites || []);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (!isAuthLoading) {
            fetchRoster();
        }
    }, [isAuthLoading, fetchRoster]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        setGeneratedLink("");
        try {
            const res = await membersApi.invite(inviteEmail);
            toast.success("Invitation created! You can copy the link.");
            if (res.invite_link) {
                setGeneratedLink(res.invite_link);
            }
            setInviteEmail("");
            fetchRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to send invitation.");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            await membersApi.revoke(id);
            toast.success("Invite revoked successfully");
            fetchRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to revoke invite.");
        }
    };

    return {
        members, setMembers,
        invites, setInvites,
        isLoading,
        inviteEmail, setInviteEmail,
        isInviting,
        generatedLink, setGeneratedLink,
        handleInvite,
        handleRevoke,
        fetchRoster
    };
};

export default useMembers;
