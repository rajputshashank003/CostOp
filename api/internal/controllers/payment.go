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

	amountPaise, interval, err := services.OrderAmountPaise(setting, orderInput.Interval)
	if err != nil {
		log.Printf("[RAZORPAY ERROR] Invalid plan pricing: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Plan pricing is misconfigured"})
		return
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
	// Without this record the payment can never be matched to the workspace, so don't start checkout
	if err := database.DB.Create(&orderRecord).Error; err != nil {
		log.Printf("[ORDER ERROR] Failed to record created order: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start checkout, please try again"})
		return
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

	if config.RazorpayKeySecret == "" {
		log.Println("[RAZORPAY ERROR] Missing RAZORPAY_KEY_SECRET in server environment during verification")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Payment gateway secret not configured on server"})
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

	// The order must have been created by this organization. A signed (order, payment) pair proves
	// a payment happened, not who paid, so without this check one payment could upgrade any workspace.
	var owned models.Order
	if err := database.DB.Where("razorpay_order_id = ? AND org_id = ?", input.RazorpayOrderID, org.ID).First(&owned).Error; err != nil {
		log.Printf("[RAZORPAY TAMPER] Org %d tried to verify order %s it did not create\n", org.ID, input.RazorpayOrderID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment does not belong to this workspace"})
		return
	}
	if owned.Status == "paid" && owned.RazorpayPaymentID != input.RazorpayPaymentID {
		c.JSON(http.StatusConflict, gin.H{"error": "This order has already been paid"})
		return
	}

	// Mark the order paid and extend Pro by one period, exactly once (the webhook may race us)
	applied, _, err := services.ApplyPaidOrder(owned.ID, input.RazorpayPaymentID)
	if err != nil {
		log.Printf("[RAZORPAY ERROR] Failed to apply order %s: %v\n", input.RazorpayOrderID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization plan"})
		return
	}

	// Dispatch rich payment confirmation email asynchronously (once per order)
	var payingUser models.User
	if applied && database.DB.First(&payingUser, userID).Error == nil && payingUser.Email != "" {
		go func(u models.User, payID string, cycle string, amt float64) {
			_ = services.SendPaymentSuccessEmail(u.Email, u.Name, "Pro", cycle, amt, payID)
		}(payingUser, input.RazorpayPaymentID, owned.Interval, owned.Amount)
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

	if config.RazorpayWebhookSecret == "" {
		log.Println("[RAZORPAY WEBHOOK ERROR] RAZORPAY_WEBHOOK_SECRET is not configured on server")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook secret not configured"})
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

	// Fallback: If notes are absent in webhook payload, resolve org_id from local order record
	if targetOrgID == 0 {
		lookupOrderID := event.Payload.Payment.Entity.OrderID
		if lookupOrderID == "" {
			lookupOrderID = event.Payload.Order.Entity.ID
		}
		if lookupOrderID != "" {
			var ord models.Order
			if err := database.DB.Where("razorpay_order_id = ?", lookupOrderID).First(&ord).Error; err == nil && ord.OrgID > 0 {
				targetOrgID = ord.OrgID
			}
		}
	}

	// Our own order record (created at checkout) is the source of truth for which workspace paid
	// and how much; payload notes alone are never enough to upgrade anyone.
	paymentOrderID := event.Payload.Payment.Entity.OrderID
	if paymentOrderID == "" {
		paymentOrderID = event.Payload.Order.Entity.ID
	}
	var localOrder models.Order
	hasLocalOrder := paymentOrderID != "" &&
		database.DB.Where("razorpay_order_id = ?", paymentOrderID).First(&localOrder).Error == nil

	switch event.Event {
	case "payment.captured", "order.paid":
		if !hasLocalOrder {
			log.Printf("[RAZORPAY WEBHOOK] %s for unknown order %q ignored\n", event.Event, paymentOrderID)
			break
		}
		expectedPaise := int64(math.Round(localOrder.Amount * 100))
		if paid := event.Payload.Payment.Entity.Amount; paid != expectedPaise {
			log.Printf("[RAZORPAY WEBHOOK] Amount mismatch for order %s: paid %d, expected %d paise; not upgrading\n", paymentOrderID, paid, expectedPaise)
			break
		}
		targetOrgID = localOrder.OrgID
		applied, _, err := services.ApplyPaidOrder(localOrder.ID, event.Payload.Payment.Entity.ID)
		if err != nil {
			log.Printf("[RAZORPAY WEBHOOK] Failed to apply order %s: %v\n", paymentOrderID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to apply payment"})
			return
		}
		// Only email when this event is what applied the order (not on replays or after the verify call)
		if !applied {
			break
		}
		log.Printf("[RAZORPAY WEBHOOK] Order %s applied: organization %d upgraded via %s\n", paymentOrderID, targetOrgID, event.Event)
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
		if userEmail != "" {
			go func(to, name, cycle string, amt float64, pid string) {
				_ = services.SendPaymentSuccessEmail(to, name, "Pro", cycle, amt, pid)
			}(userEmail, userName, localOrder.Interval, localOrder.Amount, event.Payload.Payment.Entity.ID)
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

		// Only the order this payment belongs to, and never one that has already been paid
		if hasLocalOrder {
			targetOrgID = localOrder.OrgID
			database.DB.Model(&models.Order{}).
				Where("id = ? AND status = 'created'", localOrder.ID).
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
	// Legacy backfill for real payments only: never fabricate a paid invoice for an admin-granted or manual upgrade
	if err := database.DB.First(&org, orgID).Error; err == nil && len(orders) == 0 && org.RazorpayPaymentID != "" &&
		!(org.RazorpayPaymentID == "pay_admin_granted" || org.RazorpayPaymentID == "pay_test_direct_upgrade") {
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
