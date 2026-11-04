package services

import (
	"testing"
	"time"

	"costop/internal/models"
)

func TestOrderAmountPaise(t *testing.T) {
	s := models.PlanSetting{MonthlyPrice: 999, YearlyDiscountPercent: 20}
	cases := []struct {
		interval string
		want     int64
		norm     string
	}{
		{"monthly", 99900, "monthly"},
		{"", 99900, "monthly"},
		{"weekly", 99900, "monthly"}, // unknown intervals never get the yearly discount
		{"yearly", 959040, "yearly"},
		{"annual", 959040, "yearly"},
	}
	for _, c := range cases {
		got, norm, err := OrderAmountPaise(s, c.interval)
		if err != nil || got != c.want || norm != c.norm {
			t.Errorf("OrderAmountPaise(%q) = %d,%q,%v want %d,%q", c.interval, got, norm, err, c.want, c.norm)
		}
	}
	// a 100% discount (or a zero price) must not produce a free order
	if _, _, err := OrderAmountPaise(models.PlanSetting{MonthlyPrice: 999, YearlyDiscountPercent: 100}, "yearly"); err != nil {
		t.Errorf("discount should be capped, not zero the price: %v", err)
	}
	if _, _, err := OrderAmountPaise(models.PlanSetting{MonthlyPrice: 0}, "monthly"); err != ErrAmountTooLow {
		t.Errorf("zero price must be rejected, got %v", err)
	}
}

func TestPeriodEnd(t *testing.T) {
	from := time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC)
	if got := PeriodEnd(from, "monthly"); !got.Equal(time.Date(2026, 2, 15, 0, 0, 0, 0, time.UTC)) {
		t.Errorf("monthly end = %v", got)
	}
	if got := PeriodEnd(from, "yearly"); !got.Equal(time.Date(2027, 1, 15, 0, 0, 0, 0, time.UTC)) {
		t.Errorf("yearly end = %v", got)
	}
}
