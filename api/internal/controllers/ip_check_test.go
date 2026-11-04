package controllers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"costop/internal/config"
	"costop/internal/models"

	"github.com/gin-gonic/gin"
)

func TestIPCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)
	config.AdminEmail = "admin@costop.test"
	t.Setenv("CLIENT_IP_HEADER", "")

	run := func(email string) *httptest.ResponseRecorder {
		r := gin.New()
		r.GET("/ip", func(c *gin.Context) { c.Set("user", models.User{Email: email}); IPCheck(c) })
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/ip", nil)
		req.RemoteAddr = "10.0.0.5:4321"
		req.Header.Set("CF-Connecting-IP", "49.36.1.2")
		req.Header.Set("X-Forwarded-For", "49.36.1.2, 172.70.9.9")
		r.ServeHTTP(w, req)
		return w
	}

	if w := run("someone@else.test"); w.Code != http.StatusForbidden {
		t.Fatalf("non-admin got %d, want 403", w.Code)
	}
	w := run("Admin@CostOp.test")
	if w.Code != http.StatusOK {
		t.Fatalf("admin got %d", w.Code)
	}
	var body struct {
		ConnectionIP string            `json:"connection_ip"`
		Headers      map[string]string `json:"headers"`
		Sees         string            `json:"rate_limiter_sees"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &body)
	if body.ConnectionIP != "10.0.0.5" || body.Headers["CF-Connecting-IP"] != "49.36.1.2" || body.Sees != "172.70.9.9" {
		t.Fatalf("unexpected body: %s", w.Body.String())
	}
}
