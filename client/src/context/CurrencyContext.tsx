import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../hooks/useUser";
import { fxApi } from "../utils/api_request/fx";
import { organizationApi } from "../utils/api_request/organization";

// Amounts come from the API in USD. The workspace picks a display currency and
// everything shown to the user is converted with the server's cached USD rate.

export type CurrencyCode = "INR" | "USD";
export const DEFAULT_CURRENCY: CurrencyCode = "INR";
const FALLBACK_RATES: Record<CurrencyCode, number> = { USD: 1, INR: 95 }; // matches the API's FX_USD_INR_FALLBACK default

// Drop-in replacement for Intl.NumberFormat that converts from USD first
export interface MoneyFormatter {
    format: (usd: number) => string;
}

export const CURRENCY_META: Record<CurrencyCode, { symbol: string; locale: string; label: string }> = {
    INR: { symbol: "₹", locale: "en-IN", label: "Indian Rupee" },
    USD: { symbol: "$", locale: "en-US", label: "US Dollar" },
};

interface CurrencyContextType {
    currency: CurrencyCode;
    symbol: string;
    rate: number; // 1 USD in the display currency
    rateSource: "live" | "fallback";
    rateUpdatedAt: string | null;
    rates: Record<CurrencyCode, number>;
    formatter: MoneyFormatter; // 2 decimals
    wholeFormatter: MoneyFormatter; // no decimals, for charts and big totals
    fromUSD: (usd: number) => number;
    toUSD: (amount: number) => number;
    setCurrency: (c: CurrencyCode) => void;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const makeFormatter = (currency: CurrencyCode, rate: number, digits?: number): MoneyFormatter => {
    const nf = new Intl.NumberFormat(CURRENCY_META[currency].locale, {
        style: "currency",
        currency,
        ...(digits !== undefined && { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    });
    return { format: (usd: number) => nf.format((usd || 0) * rate) };
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useUser();
    const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
    const [rateSource, setRateSource] = useState<"live" | "fallback">("fallback");
    const [rateUpdatedAt, setRateUpdatedAt] = useState<string | null>(null);

    useEffect(() => {
        fxApi
            .get_rates()
            .then((r) => {
                if (r?.rates?.INR) {
                    setRates({ USD: 1, INR: r.rates.INR });
                    setRateSource(r.source);
                    setRateUpdatedAt(r.updated_at);
                }
            })
            .catch(() => {});
    }, []);

    const loadWorkspaceCurrency = useCallback(() => {
        if (!isAuthenticated) {
            setCurrency(DEFAULT_CURRENCY);
            return;
        }
        organizationApi
            .get_details()
            .then((org) => setCurrency(org?.currency === "USD" ? "USD" : "INR"))
            .catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => {
        loadWorkspaceCurrency();
    }, [loadWorkspaceCurrency]);

    const value = useMemo<CurrencyContextType>(() => {
        const rate = rates[currency];
        return {
            currency,
            symbol: CURRENCY_META[currency].symbol,
            rate,
            rateSource,
            rateUpdatedAt,
            rates,
            formatter: makeFormatter(currency, rate),
            wholeFormatter: makeFormatter(currency, rate, 0),
            fromUSD: (usd) => (usd || 0) * rate,
            toUSD: (amount) => (amount || 0) / rate,
            setCurrency,
        };
    }, [currency, rates, rateSource, rateUpdatedAt]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
