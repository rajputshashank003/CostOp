package services

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"costop/internal/config"
)

func TestGroupDigits(t *testing.T) {
	cases := []struct {
		v      float64
		indian bool
		want   string
	}{
		{0, true, "0.00"},
		{999.5, true, "999.50"},
		{1000, true, "1,000.00"},
		{104550, true, "1,04,550.00"},
		{12345678.9, true, "1,23,45,678.90"},
		{1000, false, "1,000.00"},
		{1234567.891, false, "1,234,567.89"},
		{-1500, false, "-1,500.00"},
	}
	for _, c := range cases {
		if got := groupDigits(c.v, c.indian); got != c.want {
			t.Errorf("groupDigits(%v, %v) = %q, want %q", c.v, c.indian, got, c.want)
		}
	}
}

func TestNormalizeCurrency(t *testing.T) {
	for in, want := range map[string]string{"usd": "USD", " INR ": "INR", "EUR": DefaultCurrency, "": DefaultCurrency} {
		if got := NormalizeCurrency(in); got != want {
			t.Errorf("NormalizeCurrency(%q) = %q, want %q", in, got, want)
		}
	}
}

func withFXSource(t *testing.T, status int, body string) {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(status)
		w.Write([]byte(body))
	}))
	prevURL := fxSourceURL
	fxSourceURL = srv.URL
	fxMu.Lock()
	fxCache, fxExpiry = nil, time.Time{}
	fxMu.Unlock()
	t.Cleanup(func() {
		srv.Close()
		fxSourceURL = prevURL
		fxCache, fxExpiry = nil, time.Time{}
	})
}

func TestGetFXRatesLive(t *testing.T) {
	withFXSource(t, http.StatusOK, `{"result":"success","rates":{"USD":1,"INR":85.5}}`)
	r := GetFXRates()
	if r.Source != "live" || r.Rates["INR"] != 85.5 {
		t.Fatalf("want live 85.5, got %+v", r)
	}
	if got := FormatMoney(1000, "INR"); got != "₹85,500.00" {
		t.Errorf("FormatMoney INR = %q", got)
	}
	if got := FormatMoney(1000, "USD"); got != "$1,000.00" {
		t.Errorf("FormatMoney USD = %q", got)
	}
}

func TestGetFXRatesFallsBack(t *testing.T) {
	config.FXUSDINRFallback = 88
	for name, tc := range map[string]struct {
		status int
		body   string
	}{
		"server error":   {http.StatusInternalServerError, ``},
		"absurd rate":    {http.StatusOK, `{"result":"success","rates":{"INR":0.01}}`},
		"api error flag": {http.StatusOK, `{"result":"error"}`},
	} {
		t.Run(name, func(t *testing.T) {
			withFXSource(t, tc.status, tc.body)
			r := GetFXRates()
			if r.Source != "fallback" || r.Rates["INR"] != 88 {
				t.Fatalf("want fallback 88, got %+v", r)
			}
		})
	}
}
