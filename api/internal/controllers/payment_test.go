package controllers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"testing"
)

func TestVerifyHMACSignature(t *testing.T) {
	secret := "test_secret_key_12345"
	orderID := "order_EKwxwAgItmmXdp"
	paymentID := "pay_29QQoUBi66xm2f"
	data := orderID + "|" + paymentID

	// Generate valid HMAC SHA256
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	validSignature := hex.EncodeToString(h.Sum(nil))

	// 1. Valid signature should pass
	if !verifyHMACSignature(data, validSignature, secret) {
		t.Errorf("Expected valid signature to verify successfully, but failed")
	}

	// 2. Tampered payment ID should fail
	tamperedData := orderID + "|" + "pay_TAMPERED_12345"
	if verifyHMACSignature(tamperedData, validSignature, secret) {
		t.Errorf("Expected tampered data to fail signature verification, but passed")
	}

	// 3. Tampered signature should fail
	fakeSignature := validSignature[:len(validSignature)-4] + "0000"
	if verifyHMACSignature(data, fakeSignature, secret) {
		t.Errorf("Expected fake signature to fail, but passed")
	}

	// 4. Wrong secret should fail
	wrongSecret := "another_wrong_secret"
	if verifyHMACSignature(data, validSignature, wrongSecret) {
		t.Errorf("Expected verification with wrong secret to fail, but passed")
	}
}

func TestWebhookSignatureVerification(t *testing.T) {
	webhookSecret := "costop_razorpay_secret_2026"
	rawPayload := `{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123"}}}}`

	h := hmac.New(sha256.New, []byte(webhookSecret))
	h.Write([]byte(rawPayload))
	validHeader := hex.EncodeToString(h.Sum(nil))

	if !verifyHMACSignature(rawPayload, validHeader, webhookSecret) {
		t.Errorf("Expected webhook raw body and header to match, but failed")
	}

	tamperedPayload := `{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_FORGED"}}}}`
	if verifyHMACSignature(tamperedPayload, validHeader, webhookSecret) {
		t.Errorf("Expected tampered webhook payload to fail, but passed")
	}
}
