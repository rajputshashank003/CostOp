package services

import (
	"errors"
	"log"
	"math"
	"time"

	"costop/internal/database"
	"costop/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Paid plans are one-off Razorpay orders: each paid order buys one billing period of Pro.
// An order is applied exactly once (verify endpoint and webhooks may both report it), and
// expired periods are swept back to the free plan.

var ErrAmountTooLow = errors.New("plan amount is below the payment gateway minimum")

// OrderAmountPaise is the server-side price for one Pro period. The client never sends an amount.
func OrderAmountPaise(setting models.PlanSetting, interval string) (int64, string, error) {
	price := setting.MonthlyPrice
	normalized := "monthly"
	if interval == "yearly" || interval == "annual" {
		discount := math.Min(math.Max(setting.YearlyDiscountPercent, 0), 90)
		price = setting.MonthlyPrice * 12.0 * (1.0 - discount/100.0)
		normalized = "yearly"
	}
	paise := int64(math.Round(price * 100.0))
	if paise < 100 { // Razorpay's minimum is ₹1
		return 0, normalized, ErrAmountTooLow
	}
	return paise, normalized, nil
}

// PeriodEnd returns when a period bought at `from` ends.
func PeriodEnd(from time.Time, interval string) time.Time {
	if interval == "yearly" {
		return from.AddDate(1, 0, 0)
	}
	return from.AddDate(0, 1, 0)
}

// ApplyPaidOrder marks the order paid and extends the org's Pro period, atomically and only once.
// It returns applied=false when the order had already been applied (a replay or a duplicate event).
func ApplyPaidOrder(orderID uint, paymentID string) (applied bool, org models.Organization, err error) {
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&order, orderID).Error; err != nil {
			return err
		}
		if order.Status == "paid" {
			return nil
		}
		if err := tx.Model(&order).Updates(map[string]interface{}{"status": "paid", "razorpay_payment_id": paymentID}).Error; err != nil {
			return err
		}

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&org, order.OrgID).Error; err != nil {
			return err
		}
		now := time.Now()
		lifetime := org.Plan == "pro" && org.PlanExpiresAt == nil // admin-granted or legacy: keep as is
		updates := map[string]interface{}{"plan": "pro", "razorpay_payment_id": paymentID}
		if !lifetime {
			start := now
			if org.Plan == "pro" && org.PlanExpiresAt != nil && org.PlanExpiresAt.After(now) {
				start = *org.PlanExpiresAt // renewing early stacks onto the current period
			}
			end := PeriodEnd(start, order.Interval)
			updates["plan_expires_at"] = end
			org.PlanExpiresAt = &end
		}
		if err := tx.Model(&org).Updates(updates).Error; err != nil {
			return err
		}
		org.Plan = "pro"
		applied = true
		return nil
	})
	return applied, org, err
}

// ExpireLapsedPlans moves organizations whose paid period has ended back to the free plan.
func ExpireLapsedPlans() int64 {
	res := database.DB.Model(&models.Organization{}).
		Where("plan = ? AND plan_expires_at IS NOT NULL AND plan_expires_at < ?", "pro", time.Now()).
		Update("plan", "free")
	if res.Error != nil {
		log.Printf("[BILLING] expiry sweep failed: %v\n", res.Error)
		return 0
	}
	if res.RowsAffected > 0 {
		log.Printf("[BILLING] %d organization(s) moved to free after their Pro period ended\n", res.RowsAffected)
	}
	return res.RowsAffected
}

// StartPlanExpirySweeper runs ExpireLapsedPlans now and then every interval.
func StartPlanExpirySweeper(every time.Duration) {
	ExpireLapsedPlans()
	go func() {
		t := time.NewTicker(every)
		defer t.Stop()
		for range t.C {
			ExpireLapsedPlans()
		}
	}()
}
