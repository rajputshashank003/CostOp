import toLower from "lodash/toLower";
import trim from "lodash/trim";
import includes from "lodash/includes";

export const COMPANY_DOMAINS: Record<string, string> = {
    zoom: "zoom.us",
    slack: "slack.com",
    teams: "microsoft.com",
    figma: "figma.com",
    canva: "canva.com",
    canvas: "canva.com", /* typo fallback */
    aws: "amazon.com",
    amazon: "amazon.com",
    github: "github.com",
    vercel: "vercel.com",
    notion: "notion.so",
    adobe: "adobe.com",
    linear: "linear.app",
    google: "google.com",
    chatgpt: "openai.com",
    openai: "openai.com",
    stripe: "stripe.com",
    asana: "asana.com",
    jira: "atlassian.com",
    atlassian: "atlassian.com",
    mailchimp: "mailchimp.com"
};

export function getLogoUrl(name: string): string | null {
    if (!name) return null;

    // Using Lodash for string manipulation as per industry standard rules
    const cleanName = trim(toLower(name));

    for (const [key, domain] of Object.entries(COMPANY_DOMAINS)) {
        if (includes(cleanName, key)) {
            return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
        }
    }
    return null;
}
