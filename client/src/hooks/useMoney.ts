import { useContext } from "react";
import { CurrencyContext } from "../context/CurrencyContext";

export const useMoney = () => {
    const context = useContext(CurrencyContext);

    if (context === undefined) {
        throw new Error("useMoney must be used within a CurrencyProvider");
    }

    return context;
};
