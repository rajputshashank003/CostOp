package controllers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"

	"github.com/gin-gonic/gin"
)

// RazorpayOrderResponse maps the response from Razorpay Order API.
type RazorpayOrderResponse struct {
	ID        string                 `json:"id"`
	Entity    string                 `json:"entity"`
	Amount    int64                  `json:"amount"`
	Currency  string                 `json:"currency"`
	Receipt   string                 `json:"receipt"`
	Status    string                 `json:"status"`
	CreatedAt int64                  `json:"created_at"`
	Notes     map[string]interface{} `json:"notes"`
}

// verifyHMACSignature verifies HMAC SHA256 signature for Razorpay payments and webhooks.
func verifyHMACSignature(data, signature, secret string) bool {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

// CreateRazorpayOrder generates a checkout order on Razorpay for upgrading to Pro.
// POST /api/payment/create-order
func CreateRazorpayOrder(c *gin.Context) {
	if config.RazorpayKeyID == "" || config.RazorpayKeySecret == "" {
		log.Println("[RAZORPAY ERROR] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Payment gateway configuration is missing on server"})
		return
	}

	userID := c.MustGet("userID").(uint)

	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var orderInput struct {
		Interval string `json:"interval"` // "monthly" | "yearly" | "annual"
	}
	_ = c.ShouldBindJSON(&orderInput)

	// Fetch dynamic pricing from database
	var setting models.PlanSetting
	if err := database.DB.Where("plan_code = ? AND is_active = ?", "pro", true).First(&setting).Error; err != nil {
		setting = models.PlanSetting{MonthlyPrice: 999.00, YearlyDiscountPercent: 20.00}
	}

	var amountPaise int64
	interval := "monthly"
	if orderInput.Interval == "yearly" || orderInput.Interval == "annual" {
		discountMultiplier := 1.0 - (setting.YearlyDiscountPercent / 100.0)
		yearlyTotal := setting.MonthlyPrice * 12.0 * discountMultiplier
		amountPaise = int64(math.Round(yearlyTotal * 100.0))
		interval = "yearly"
	} else {
		amountPaise = int64(math.Round(setting.MonthlyPrice * 100.0))
	}

	currency := "INR"
	receipt := fmt.Sprintf("rcpt_org_%d_%d", org.ID, time.Now().Unix())

	orderPayload := map[string]interface{}{
		"amount":   amountPaise,
		"currency": currency,
		"receipt":  receipt,
		"notes": map[string]string{
			"org_id":   fmt.Sprintf("%d", org.ID),
			"user_id":  fmt.Sprintf("%d", userID),
			"plan":     "pro",
			"interval": interval,
		},
	}

	bodyBytes, err := json.Marshal(orderPayload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order payload"})
		return
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(bodyBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize order request"})
		return
	}

	req.SetBasicAuth(config.RazorpayKeyID, config.RazorpayKeySecret)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[RAZORPAY ERROR] Failed to call Razorpay order API: %v\n", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to payment gateway"})
		return
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil || resp.StatusCode >= 400 {
		log.Printf("[RAZORPAY ERROR] Order API returned error status %d: %s\n", resp.StatusCode, string(respBytes))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to generate Razorpay order"})
		return
	}

	var orderResp RazorpayOrderResponse
	if err := json.Unmarshal(respBytes, &orderResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse order response"})
		return
	}

	// Persist order record in created state
	orderRecord := models.Order{
		OrgID:           org.ID,
		UserID:          userID,
		RazorpayOrderID: orderResp.ID,
		Plan:            "pro",
		Interval:        interval,
		Amount:          float64(amountPaise) / 100.0,
		Currency:        currency,
		Status:          "created",
		Receipt:         receipt,
	}
	if err := database.DB.Create(&orderRecord).Error; err != nil {
		log.Printf("[ORDER ERROR] Failed to record created order: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"order_id": orderResp.ID,
		"amount":   orderResp.Amount,
		"currency": orderResp.Currency,
		"key_id":   config.RazorpayKeyID,
		"org_name": org.Name,
	})
}

// VerifyRazorpayPayment verifies the payment signature sent by the frontend Razorpay checkout.
// POST /api/payment/verify
func VerifyRazorpayPayment(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var input struct {
		RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
		RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
		RazorpaySignature string `json:"razorpay_signature" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required payment verification fields"})
		return
	}

	// Signature verification: HMAC-SHA256(order_id + "|" + payment_id, secret)
	payloadToSign := input.RazorpayOrderID + "|" + input.RazorpayPaymentID
	if !verifyHMACSignature(payloadToSign, input.RazorpaySignature, config.RazorpayKeySecret) {
		log.Printf("[RAZORPAY TAMPER] Invalid signature received for order %s and payment %s\n", input.RazorpayOrderID, input.RazorpayPaymentID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment signature verification failed"})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	// Upgrade workspace to Pro
	org.Plan = "pro"
	org.RazorpayPaymentID = input.RazorpayPaymentID
	if err := database.DB.Save(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization plan"})
		return
	}

	// Mark order as paid
	database.DB.Model(&models.Order{}).
		Where("razorpay_order_id = ? OR (org_id = ? AND status = 'created')", input.RazorpayOrderID, org.ID).
		Updates(map[string]interface{}{
			"status":              "paid",
			"razorpay_payment_id": input.RazorpayPaymentID,
		})

	// Fetch order details for exact amount and interval
	var order models.Order
	paidAmount := 999.00
	paidInterval := "monthly"
	if err := database.DB.Where("razorpay_order_id = ?", input.RazorpayOrderID).First(&order).Error; err == nil {
		if order.Amount > 0 {
			paidAmount = order.Amount
		}
		if order.Interval != "" {
			paidInterval = order.Interval
		}
	}

	// Dispatch rich payment confirmation email asynchronously
	var payingUser models.User
	if err := database.DB.First(&payingUser, userID).Error; err == nil && payingUser.Email != "" {
		go func(u models.User, payID string, cycle string, amt float64) {
			_ = services.SendPaymentSuccessEmail(u.Email, u.Name, "Pro", cycle, amt, payID)
		}(payingUser, input.RazorpayPaymentID, paidInterval, paidAmount)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment verified successfully! Welcome to CostOp Pro.",
		"plan":    "pro",
	})
}

// RazorpayWebhookEvent represents the inbound webhook JSON from Razorpay.
type RazorpayWebhookEvent struct {
	Event   string `json:"event"`
	Payload struct {
		Payment struct {
			Entity struct {
				ID               string            `json:"id"`
				Amount           int64             `json:"amount"`
				Status           string            `json:"status"`
				OrderID          string            `json:"order_id"`
				Email            string            `json:"email"`
				Contact          string            `json:"contact"`
				ErrorDescription string            `json:"error_description"`
				ErrorReason      string            `json:"error_reason"`
				Notes            map[string]string `json:"notes"`
			} `json:"entity"`
		} `json:"payment"`
		Order struct {
			Entity struct {
				ID    string            `json:"id"`
				Notes map[string]string `json:"notes"`
			} `json:"entity"`
		} `json:"order"`
		Subscription struct {
			Entity struct {
				ID     string            `json:"id"`
				Status string            `json:"status"`
				Notes  map[string]string `json:"notes"`
			} `json:"entity"`
		} `json:"subscription"`
	} `json:"payload"`
}

// HandleRazorpayWebhook processes inbound asynchronous webhooks from Razorpay.
// POST /api/payment/webhook
func HandleRazorpayWebhook(c *gin.Context) {
	signature := c.GetHeader("X-Razorpay-Signature")
	if signature == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing webhook signature"})
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read webhook body"})
		return
	}

	// Verify signature using webhook secret
	if !verifyHMACSignature(string(bodyBytes), signature, config.RazorpayWebhookSecret) {
		log.Printf("[RAZORPAY WEBHOOK ERROR] Invalid webhook signature\n")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
		return
	}

	var event RazorpayWebhookEvent
	if err := json.Unmarshal(bodyBytes, &event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse webhook JSON"})
		return
	}

	log.Printf("[RAZORPAY WEBHOOK] Processing event: %s\n", event.Event)

	// Extract org_id from notes if present
	var targetOrgID uint
	extractOrgID := func(notes map[string]string) uint {
		if idStr, ok := notes["org_id"]; ok {
			if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
				return uint(id)
			}
		}
		return 0
	}

	targetOrgID = extractOrgID(event.Payload.Payment.Entity.Notes)
	if targetOrgID == 0 {
		targetOrgID = extractOrgID(event.Payload.Order.Entity.Notes)
	}
	if targetOrgID == 0 {
		targetOrgID = extractOrgID(event.Payload.Subscription.Entity.Notes)
	}

	switch event.Event {
	case "payment.captured", "order.paid":
		if targetOrgID > 0 {
			database.DB.Model(&models.Organization{}).Where("id = ?", targetOrgID).Updates(map[string]interface{}{
				"plan":                "pro",
				"razorpay_payment_id": event.Payload.Payment.Entity.ID,
			})
			log.Printf("[RAZORPAY WEBHOOK] Upgraded organization %d to pro via %s\n", targetOrgID, event.Event)

			// Check if the order was already marked as paid (e.g. by VerifyRazorpayPayment from frontend)
			var existingOrder models.Order
			alreadyPaid := false
			orderLookup := database.DB.Where("razorpay_order_id = ? OR razorpay_payment_id = ?",
				event.Payload.Payment.Entity.OrderID, event.Payload.Payment.Entity.ID).First(&existingOrder)
			if orderLookup.Error == nil && existingOrder.Status == "paid" {
				alreadyPaid = true
			}

			// Mark order as paid
			database.DB.Model(&models.Order{}).
				Where("razorpay_order_id = ? OR razorpay_payment_id = ? OR (org_id = ? AND status = 'created')",
					event.Payload.Payment.Entity.OrderID, event.Payload.Payment.Entity.ID, targetOrgID).
				Updates(map[string]interface{}{
					"status":              "paid",
					"razorpay_payment_id": event.Payload.Payment.Entity.ID,
				})

			// Only send confirmation email if order was not already marked paid by frontend checkout handler
			if !alreadyPaid {
				userEmail := event.Payload.Payment.Entity.Email
				userName := "Valued Member"
				var org models.Organization
				if err := database.DB.First(&org, targetOrgID).Error; err == nil {
					var owner models.User
					if err := database.DB.First(&owner, org.OwnerID).Error; err == nil {
						if userEmail == "" {
							userEmail = owner.Email
						}
						if owner.Name != "" {
							userName = owner.Name
						}
					}
				}
				amount := float64(event.Payload.Payment.Entity.Amount) / 100.0
				if amount <= 0 {
					amount = 999.00
				}
				interval := event.Payload.Payment.Entity.Notes["interval"]
				if interval == "" {
					interval = "monthly"
				}
				if userEmail != "" {
					go func(to, name, cycle string, amt float64, pid string) {
						_ = services.SendPaymentSuccessEmail(to, name, "Pro", cycle, amt, pid)
					}(userEmail, userName, interval, amount, event.Payload.Payment.Entity.ID)
				}
			}
		}

	case "subscription.activated", "subscription.charged":
		if targetOrgID > 0 {
			database.DB.Model(&models.Organization{}).Where("id = ?", targetOrgID).Updates(map[string]interface{}{
				"plan":            "pro",
				"razorpay_sub_id": event.Payload.Subscription.Entity.ID,
			})
			log.Printf("[RAZORPAY WEBHOOK] Active pro status confirmed for organization %d via %s\n", targetOrgID, event.Event)
		}

	case "subscription.cancelled", "subscription.halted":
		if targetOrgID > 0 {
			database.DB.Model(&models.Organization{}).Where("id = ?", targetOrgID).Update("plan", "free")
			log.Printf("[RAZORPAY WEBHOOK] Downgraded organization %d to free via %s\n", targetOrgID, event.Event)
		}

	case "payment.failed":
		log.Printf("[RAZORPAY WEBHOOK] Payment failed for org %d (PaymentID: %s)\n", targetOrgID, event.Payload.Payment.Entity.ID)

		if targetOrgID > 0 {
			database.DB.Model(&models.Order{}).
				Where("razorpay_order_id = ? OR (org_id = ? AND status = 'created')",
					event.Payload.Payment.Entity.OrderID, targetOrgID).
				Updates(map[string]interface{}{
					"status":         "failed",
					"failure_reason": event.Payload.Payment.Entity.ErrorDescription,
				})
		}

		userEmail := event.Payload.Payment.Entity.Email
		userName := "Customer"
		if targetOrgID > 0 {
			var org models.Organization
			if err := database.DB.First(&org, targetOrgID).Error; err == nil {
				var owner models.User
				if err := database.DB.First(&owner, org.OwnerID).Error; err == nil {
					if userEmail == "" {
						userEmail = owner.Email
					}
					if owner.Name != "" {
						userName = owner.Name
					}
				}
			}
		}
		amount := float64(event.Payload.Payment.Entity.Amount) / 100.0
		if amount <= 0 {
			amount = 999.00
		}
		failureReason := event.Payload.Payment.Entity.ErrorDescription
		if failureReason == "" {
			failureReason = event.Payload.Payment.Entity.ErrorReason
		}
		if failureReason == "" {
			failureReason = "Transaction declined by bank or timed out"
		}
		if userEmail != "" {
			go func(to, name, r string, amt float64) {
				_ = services.SendPaymentFailedEmail(to, name, "Pro", amt, r)
			}(userEmail, userName, failureReason, amount)
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetUserOrders returns all purchase orders and invoices for the user's workspace.
// GET /api/payment/orders
func GetUserOrders(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	orgID, err := resolveOrgID(userID)
	if err != nil || orgID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var orders []models.Order
	if err := database.DB.Where("org_id = ?", orgID).Order("created_at desc").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Backfill initial order if org has existing RazorpayPaymentID but no row in orders table
	var org models.Organization
	if err := database.DB.First(&org, orgID).Error; err == nil && len(orders) == 0 && org.RazorpayPaymentID != "" {
		backfill := models.Order{
			OrgID:             org.ID,
			UserID:            userID,
			RazorpayOrderID:   "ord_rec_" + org.RazorpayPaymentID,
			RazorpayPaymentID: org.RazorpayPaymentID,
			Plan:              org.Plan,
			Interval:          "monthly",
			Amount:            999.00,
			Currency:          "INR",
			Status:            "paid",
			Receipt:           fmt.Sprintf("rcpt_org_%d_1", org.ID),
			CreatedAt:         org.UpdatedAt,
		}
		_ = database.DB.Create(&backfill).Error
		orders = append(orders, backfill)
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"total":  len(orders),
	})
}
