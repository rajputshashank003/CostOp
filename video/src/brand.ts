import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
    weights: ["500", "600", "700", "800", "900"],
    subsets: ["latin"],
});

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Same palette the client uses (Tailwind emerald + slate)
export const C = {
    emerald50: "#ecfdf5",
    emerald100: "#d1fae5",
    emerald200: "#a7f3d0",
    emerald300: "#6ee7b7",
    emerald500: "#10b981",
    emerald600: "#059669",
    emerald700: "#047857",
    emerald950: "#022c22",
    slate900: "#0f172a",
    rose100: "#ffe4e6",
    rose500: "#f43f5e",
};

// Same formatter as DashboardMetrics
export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
