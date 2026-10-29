import {
    ArrowRightLeft,
    Users,
    ArrowDownToLine,
    Lightbulb,
    TrendingDown,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AITypeConfig {
    icon: LucideIcon;
    gradient: string;
    badge: string;
}

export const AI_TYPE_CONFIG: Record<string, AITypeConfig> = {
    billing_cycle: { icon: ArrowRightLeft, gradient: "from-emerald-500 to-teal-600", badge: "Billing" },
    consolidation: { icon: Users, gradient: "from-violet-500 to-purple-600", badge: "Consolidate" },
    seat_optimization: { icon: ArrowDownToLine, gradient: "from-amber-500 to-orange-600", badge: "Seats" },
    alternative: { icon: Zap, gradient: "from-sky-500 to-blue-600", badge: "Switch" },
    downgrade: { icon: TrendingDown, gradient: "from-rose-500 to-pink-600", badge: "Downgrade" },
};

export const AI_DEFAULT_CONFIG: AITypeConfig = {
    icon: Lightbulb,
    gradient: "from-emerald-500 to-teal-600",
    badge: "Tip",
};
