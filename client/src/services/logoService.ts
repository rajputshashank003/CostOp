import toLower from "lodash/toLower";
import trim from "lodash/trim";
import includes from "lodash/includes";

export const COMPANY_DOMAINS: Record<string, string> = {
    // --- Communication & Collaboration ---
    zoom: "zoom.us",
    slack: "slack.com",
    teams: "microsoft.com",
    discord: "discord.com",
    loom: "loom.com",
    whereby: "whereby.com",
    twist: "twist.com",
    mattermost: "mattermost.com",
    telegram: "telegram.org",
    whatsapp: "whatsapp.com",
    intercom: "intercom.com",
    crisp: "crisp.chat",
    drift: "drift.com",
    front: "front.com",
    helpscout: "helpscout.com",

    // --- AI Tools & Models ---
    openai: "openai.com",
    chatgpt: "openai.com",
    gemini: "gemini.google.com",
    claude: "anthropic.com",
    anthropic: "anthropic.com",
    cursor: "cursor.sh",
    perplexity: "perplexity.ai",
    mistral: "mistral.ai",
    midjourney: "midjourney.com",
    runway: "runwayml.com",
    elevenlabs: "elevenlabs.io",
    synthesia: "synthesia.io",
    jasper: "jasper.ai",
    writesonic: "writesonic.com",
    copy: "copy.ai",
    notion: "notion.so",
    gamma: "gamma.app",
    pika: "pika.art",
    kling: "klingai.com",
    suno: "suno.com",
    heygen: "heygen.com",
    udio: "udio.com",
    cohere: "cohere.com",
    replicate: "replicate.com",
    together: "together.ai",
    groq: "groq.com",

    // --- Design & Creative ---
    figma: "figma.com",
    canva: "canva.com",
    canvas: "canva.com", /* typo fallback */
    adobe: "adobe.com",
    framer: "framer.com",
    sketch: "sketch.com",
    invision: "invisionapp.com",
    zeplin: "zeplin.io",
    miro: "miro.com",
    lucidchart: "lucidchart.com",
    whimsical: "whimsical.com",
    penpot: "penpot.app",
    spline: "spline.design",

    // --- Dev Tools & Infrastructure ---
    github: "github.com",
    gitlab: "gitlab.com",
    bitbucket: "bitbucket.org",
    vercel: "vercel.com",
    netlify: "netlify.com",
    railway: "railway.app",
    render: "render.com",
    heroku: "heroku.com",
    digitalocean: "digitalocean.com",
    cloudflare: "cloudflare.com",
    supabase: "supabase.com",
    firebase: "firebase.google.com",
    planetscale: "planetscale.com",
    neon: "neon.tech",
    turso: "turso.tech",
    upstash: "upstash.com",
    sentry: "sentry.io",
    datadog: "datadoghq.com",
    newrelic: "newrelic.com",
    logrocket: "logrocket.com",
    postman: "postman.com",
    insomnia: "insomnia.rest",
    linear: "linear.app",
    jira: "atlassian.com",
    atlassian: "atlassian.com",
    shortcut: "shortcut.com",
    height: "height.app",

    // --- Cloud Providers ---
    aws: "amazon.com",
    amazon: "amazon.com",
    gcp: "cloud.google.com",
    google: "google.com",
    azure: "azure.microsoft.com",
    microsoft: "microsoft.com",
    ibm: "ibm.com",
    oracle: "oracle.com",

    // --- Project Management & Productivity ---
    asana: "asana.com",
    trello: "trello.com",
    monday: "monday.com",
    clickup: "clickup.com",
    basecamp: "basecamp.com",
    todoist: "todoist.com",
    airtable: "airtable.com",
    coda: "coda.io",
    obsidian: "obsidian.md",
    craft: "craft.do",
    bear: "bear.app",

    // --- Analytics & Marketing ---
    segment: "segment.com",
    amplitude: "amplitude.com",
    mixpanel: "mixpanel.com",
    posthog: "posthog.com",
    hotjar: "hotjar.com",
    heap: "heap.io",
    chartmogul: "chartmogul.com",
    hubspot: "hubspot.com",
    mailchimp: "mailchimp.com",
    convertkit: "convertkit.com",
    beehiiv: "beehiiv.com",
    sendgrid: "sendgrid.com",
    resend: "resend.com",
    postmark: "postmarkapp.com",
    brevo: "brevo.com",

    // --- Payments & Finance ---
    stripe: "stripe.com",
    paddle: "paddle.com",
    lemon: "lemonsqueezy.com",
    lemonsqueezy: "lemonsqueezy.com",
    paypal: "paypal.com",
    wise: "wise.com",
    mercury: "mercury.com",
    brex: "brex.com",
    deel: "letsdeel.com",
    rippling: "rippling.com",

    // --- HR & People ---
    gusto: "gusto.com",
    bamboohr: "bamboohr.com",
    workday: "workday.com",
    greenhouse: "greenhouse.io",
    lever: "lever.co",
    lattice: "lattice.com",

    // --- Security ---
    onepassword: "1password.com",
    "1password": "1password.com",
    lastpass: "lastpass.com",
    bitwarden: "bitwarden.com",
    dashlane: "dashlane.com",
    okta: "okta.com",
    auth0: "auth0.com",
    cloudflareaccess: "cloudflare.com",

    // --- Storage & File Management ---
    dropbox: "dropbox.com",
    googledrive: "drive.google.com",
    box: "box.com",
    onedrive: "microsoft.com",

    // --- CRM & Sales ---
    salesforce: "salesforce.com",
    pipedrive: "pipedrive.com",
    freshsales: "freshworks.com",
    freshdesk: "freshworks.com",
    freshworks: "freshworks.com",
    zendesk: "zendesk.com",
    closeio: "close.com",

    // --- Social & Content ---
    buffer: "buffer.com",
    hootsuite: "hootsuite.com",
    later: "later.com",
    sprout: "sproutsocial.com",

    // --- Video & Learning ---
    vimeo: "vimeo.com",
    wistia: "wistia.com",
    teachable: "teachable.com",
    podia: "podia.com",
    kajabi: "kajabi.com",
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
