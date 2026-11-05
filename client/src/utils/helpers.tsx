import { Briefcase, Code, PenTool, Database, Monitor, Headphones, Zap, PieChart, Activity } from "lucide-react";

export const getCategoryIcon = (category: string, size: number = 14) => {
    if (!category) return <Briefcase size={size} />;
    const cat = category.toLowerCase();

    if (cat.includes("design") || cat.includes("creative")) return <PenTool size={size} />;
    if (cat.includes("engineer") || cat.includes("dev") || cat.includes("code")) return <Code size={size} />;
    if (cat.includes("data") || cat.includes("server") || cat.includes("db")) return <Database size={size} />;
    if (cat.includes("it") || cat.includes("system") || cat.includes("infra")) return <Monitor size={size} />;
    if (cat.includes("support") || cat.includes("service") || cat.includes("help")) return <Headphones size={size} />;
    if (cat.includes("market") || cat.includes("sales") || cat.includes("growth")) return <Zap size={size} />;
    if (cat.includes("finance") || cat.includes("account") || cat.includes("business")) return <PieChart size={size} />;
    if (cat.includes("manage") || cat.includes("product") || cat.includes("agile")) return <Activity size={size} />;

    return <Briefcase size={size} />;
};

// Amounts are never truncated, so long ones (₹ crores, many digits) step down a font size instead
// of overflowing their box. Pass the classes for normal, long and very long amounts.
export const amountSizeClass = (text: string, sizes: [string, string, string]) =>
    text.length > 14 ? sizes[2] : text.length > 10 ? sizes[1] : sizes[0];
