package controllers

import (
	"net"
	"net/http"
	"os"
	"strings"

	"costop/internal/middleware"
	"costop/internal/models"

	"github.com/gin-gonic/gin"
)

// IPCheck shows which request headers carry the caller's real IP, so CLIENT_IP_HEADER can be
// set correctly behind Render/Cloudflare. Website admin only; it reveals nothing but the
// admin's own request.
// GET /api/admin/ip-check
func IPCheck(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	if !IsWebsiteAdmin(user.Email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Website admin privileges required"})
		return
	}

	connIP, _, err := net.SplitHostPort(c.Request.RemoteAddr)
	if err != nil {
		connIP = c.Request.RemoteAddr
	}
	headers := gin.H{}
	for _, h := range []string{"CF-Connecting-IP", "True-Client-IP", "X-Real-IP", "X-Forwarded-For"} {
		headers[h] = c.GetHeader(h)
	}

	c.JSON(http.StatusOK, gin.H{
		"connection_ip":            connIP,
		"headers":                  headers,
		"client_ip_header_setting": strings.TrimSpace(os.Getenv("CLIENT_IP_HEADER")),
		"rate_limiter_sees":        middleware.ClientIP(c),
		"how_to_read":              "Compare with your real public IP (search 'what is my IP'). Set CLIENT_IP_HEADER to the header that shows it; 'rate_limiter_sees' should then match your real IP.",
	})
}
