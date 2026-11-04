package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"costop/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Tokens that fail these checks are rejected before any database lookup.
func TestRequireAuthRejectsBadTokens(t *testing.T) {
	gin.SetMode(gin.TestMode)
	config.JWTSecret = "unit-test-secret-0123456789abcdef0123456789"
	r := gin.New()
	r.GET("/x", RequireAuth(), func(c *gin.Context) { c.Status(http.StatusOK) })

	sign := func(m jwt.SigningMethod, claims jwt.MapClaims, key interface{}) string {
		s, err := jwt.NewWithClaims(m, claims).SignedString(key)
		if err != nil {
			t.Fatal(err)
		}
		return s
	}
	secret := []byte(config.JWTSecret)
	cases := map[string]string{
		"no expiry":       sign(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": 1}, secret),
		"expired":         sign(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": 1, "exp": time.Now().Add(-time.Hour).Unix()}, secret),
		"wrong secret":    sign(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": 1, "exp": time.Now().Add(time.Hour).Unix()}, []byte("another-secret-0123456789abcdef012345")),
		"HS512 not HS256": sign(jwt.SigningMethodHS512, jwt.MapClaims{"user_id": 1, "exp": time.Now().Add(time.Hour).Unix()}, secret),
		"alg none":        sign(jwt.SigningMethodNone, jwt.MapClaims{"user_id": 1, "exp": time.Now().Add(time.Hour).Unix()}, jwt.UnsafeAllowNoneSignatureType),
	}
	for name, tok := range cases {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/x", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		r.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("%s: got %d, want 401", name, w.Code)
		}
	}
}
