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
