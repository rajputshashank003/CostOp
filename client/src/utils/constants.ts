export const LOCAL_STORAGE = {
    TOKEN: "costop_token",
    USER: "costop_user",
};

export const SESSION_STORAGE = {
    INVITE_TOKEN: "costop_invite_token",
};

export const SUBSCRIPTION_OPTIONS = {
    PLAN_TYPES: ["Individual", "Team", "Organization"],
    BILLING_CYCLES: ["Monthly", "Yearly", "One Time"],
};

export const METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH",
};

export type HttpMethod = typeof METHODS[keyof typeof METHODS];