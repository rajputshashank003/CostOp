/**
 * Determines whether a given user email has platform-level administrative privileges.
 * Configured dynamically via VITE_ADMIN_EMAIL in client environment.
 */
export const isWebsiteAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim() || "";
    if (!adminEmail) return false;
    return email.trim().toLowerCase() === adminEmail.toLowerCase();
};
