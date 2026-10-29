import { DollarSign, IndianRupee, LucideProps } from "lucide-react";
import { useMoney } from "@/hooks/useMoney";

// Money icon that follows the workspace currency
export default function CurrencyIcon(props: LucideProps) {
    const { currency } = useMoney();
    return currency === "INR" ? <IndianRupee {...props} /> : <DollarSign {...props} />;
}
