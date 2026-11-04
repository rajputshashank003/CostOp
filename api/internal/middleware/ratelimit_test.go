package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestRateLimitBlocksAfterLimit(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/x", RateLimit("test", 3, time.Minute, KeyByIP), func(c *gin.Context) { c.Status(http.StatusOK) })

	codes := []int{}
	for i := 0; i < 5; i++ {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/x", nil)
		req.RemoteAddr = "203.0.113.7:1234"
		r.ServeHTTP(w, req)
		codes = append(codes, w.Code)
	}
	want := []int{200, 200, 200, 429, 429}
	for i := range want {
		if codes[i] != want[i] {
			t.Fatalf("codes = %v, want %v", codes, want)
		}
	}
}

func TestClientIPIgnoresSpoofedForwardedFor(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	// the client sent "1.2.3.4"; our proxy appended the real address on the right
	c.Request.Header.Set("X-Forwarded-For", "1.2.3.4, 198.51.100.9")
	if got := ClientIP(c); got != "198.51.100.9" {
		t.Fatalf("ClientIP = %q, want the proxy-appended address", got)
	}
}

func TestClientIPConfiguredHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	prev := clientIPHeader
	clientIPHeader = func() string { return "CF-Connecting-IP" }
	defer func() { clientIPHeader = prev }()

	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	c.Request.Header.Set("CF-Connecting-IP", "192.0.2.44")
	c.Request.Header.Set("X-Forwarded-For", "192.0.2.44, 198.51.100.9")
	if got := ClientIP(c); got != "192.0.2.44" {
		t.Fatalf("ClientIP = %q, want the configured header's address", got)
	}
}
