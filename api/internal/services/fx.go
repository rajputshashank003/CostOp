package services

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"

	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"
)

// Amounts are stored in USD. Each organization picks a display currency and every
// user-facing amount is converted with a cached USD-based exchange rate.

const DefaultCurrency = "INR"

var SupportedCurrencies = map[string]bool{"USD": true, "INR": true}

type FXRates struct {
	Base      string             `json:"base"`
	Rates     map[string]float64 `json:"rates"`
	Source    string             `json:"source"` // "live" | "fallback"
	UpdatedAt time.Time          `json:"updated_at"`
}

const (
	fxTTL         = 12 * time.Hour
	fxRetryAfter  = 10 * time.Minute
	fxHTTPTimeout = 5 * time.Second
)

// Free, keyless USD-based rates; a var so tests can point it at a stub server
var fxSourceURL = "https://open.er-api.com/v6/latest/USD"

var (
	fxMu     sync.Mutex
	fxCache  *FXRates
	fxExpiry time.Time
)

// GetFXRates returns USD-based rates, refreshing from the live source every 12h.
// On failure it keeps the last good rates, or uses the configured fallback.
func GetFXRates() FXRates {
	fxMu.Lock()
	defer fxMu.Unlock()

	if fxCache != nil && time.Now().Before(fxExpiry) {
		return *fxCache
	}

	inr, err := fetchUSDINR()
	if err != nil {
		log.Printf("[FX] live rate fetch failed: %v\n", err)
		if fxCache == nil || fxCache.Source == "fallback" {
			fxCache = &FXRates{Base: "USD", Rates: map[string]float64{"USD": 1, "INR": config.FXUSDINRFallback}, Source: "fallback", UpdatedAt: time.Now()}
		}
		fxExpiry = time.Now().Add(fxRetryAfter)
		return *fxCache
	}

	fxCache = &FXRates{Base: "USD", Rates: map[string]float64{"USD": 1, "INR": inr}, Source: "live", UpdatedAt: time.Now()}
	fxExpiry = time.Now().Add(fxTTL)
	return *fxCache
}

func fetchUSDINR() (float64, error) {
	client := &http.Client{Timeout: fxHTTPTimeout}
	resp, err := client.Get(fxSourceURL)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("status %d", resp.StatusCode)
	}

	var body struct {
		Result string             `json:"result"`
		Rates  map[string]float64 `json:"rates"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return 0, err
	}
	inr := body.Rates["INR"]
	// Sanity bounds so a bad payload can never wildly distort every amount in the app
	if body.Result != "success" || inr < 40 || inr > 200 {
		return 0, fmt.Errorf("unexpected payload (result=%q, INR=%v)", body.Result, inr)
	}
	return inr, nil
}

// NormalizeCurrency returns a supported currency code, defaulting to DefaultCurrency.
func NormalizeCurrency(code string) string {
	code = strings.ToUpper(strings.TrimSpace(code))
	if SupportedCurrencies[code] {
		return code
	}
	return DefaultCurrency
}

// OrgCurrency returns the display currency for an organization.
func OrgCurrency(orgID uint) string {
	var org models.Organization
	if orgID == 0 || database.DB.Select("currency").First(&org, orgID).Error != nil {
		return DefaultCurrency
	}
	return NormalizeCurrency(org.Currency)
}

// ConvertUSD converts a stored USD amount into the given currency.
func ConvertUSD(usd float64, currency string) float64 {
	rate, ok := GetFXRates().Rates[NormalizeCurrency(currency)]
	if !ok {
		return usd
	}
	return usd * rate
}

// FormatMoney converts a stored USD amount and formats it, e.g. "$12.50" or "₹1,04,550.00".
func FormatMoney(usd float64, currency string) string {
	currency = NormalizeCurrency(currency)
	amount := ConvertUSD(usd, currency)
	if currency == "INR" {
		return "₹" + groupDigits(amount, true)
	}
	return "$" + groupDigits(amount, false)
}

// groupDigits formats with two decimals and thousands separators (Indian lakh grouping when indian=true).
func groupDigits(v float64, indian bool) string {
	neg := v < 0
	s := fmt.Sprintf("%.2f", math.Abs(v))
	intPart, frac := s[:len(s)-3], s[len(s)-3:]

	var out string
	if indian && len(intPart) > 3 {
		out = intPart[len(intPart)-3:]
		rest := intPart[:len(intPart)-3]
		for len(rest) > 2 {
			out = rest[len(rest)-2:] + "," + out
			rest = rest[:len(rest)-2]
		}
		out = rest + "," + out
	} else {
		for len(intPart) > 3 {
			out = "," + intPart[len(intPart)-3:] + out
			intPart = intPart[:len(intPart)-3]
		}
		out = intPart + out
	}
	if neg {
		out = "-" + out
	}
	return out + frac
}
