package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Fixed-window, in-memory rate limiting. Good enough for a single API instance;
// a multi-instance deployment would move the counters to a shared store.

type window struct {
	count int
	reset time.Time
}

type limiter struct {
	mu   sync.Mutex
	hits map[string]*window
}

var rl = &limiter{hits: map[string]*window{}}

func (l *limiter) allow(key string, limit int, per time.Duration) (bool, time.Duration) {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()

	if len(l.hits) > 50000 { // drop expired windows so memory stays bounded
		for k, w := range l.hits {
			if now.After(w.reset) {
				delete(l.hits, k)
			}
		}
	}
	w, ok := l.hits[key]
	if !ok || now.After(w.reset) {
		w = &window{reset: now.Add(per)}
		l.hits[key] = w
	}
	w.count++
	return w.count <= limit, time.Until(w.reset)
}

// ClientIP identifies the caller for rate limiting.
//   - CLIENT_IP_HEADER (e.g. "CF-Connecting-IP" or "True-Client-IP"): use that header. Only set it
//     when the API is reachable solely through a proxy that overwrites the header.
//   - otherwise: the right-most X-Forwarded-For entry, which our own proxy appended and the
//     client can't forge (anything the client sends is prepended to the left).
func ClientIP(c *gin.Context) string {
	if h := clientIPHeader(); h != "" {
		if ip := strings.TrimSpace(c.GetHeader(h)); net.ParseIP(ip) != nil {
			return ip
		}
	}
	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if ip := strings.TrimSpace(parts[len(parts)-1]); net.ParseIP(ip) != nil {
			return ip
		}
	}
	host, _, err := net.SplitHostPort(c.Request.RemoteAddr)
	if err != nil {
		return c.Request.RemoteAddr
	}
	return host
}

var clientIPHeader = func() string { return strings.TrimSpace(os.Getenv("CLIENT_IP_HEADER")) }

// KeyByIP limits per client address.
func KeyByIP(c *gin.Context) string { return ClientIP(c) }

// KeyByUser limits per authenticated user (use after RequireAuth).
func KeyByUser(c *gin.Context) string {
	if id, ok := c.Get("userID"); ok {
		return fmt.Sprintf("user:%v", id)
	}
	return ClientIP(c)
}

// KeyByEmail limits per email address in the JSON body, so guesses against one
// account are capped no matter how many addresses the attacker uses.
func KeyByEmail(c *gin.Context) string {
	body, err := io.ReadAll(io.LimitReader(c.Request.Body, 1<<16))
	if err != nil {
		return ClientIP(c)
	}
	c.Request.Body = io.NopCloser(bytes.NewReader(body))
	var p struct {
		Email string `json:"email"`
	}
	if json.Unmarshal(body, &p) != nil || strings.TrimSpace(p.Email) == "" {
		return ClientIP(c)
	}
	return "email:" + strings.ToLower(strings.TrimSpace(p.Email))
}

// RateLimit allows `limit` requests per `per` for each key, then answers 429.
func RateLimit(name string, limit int, per time.Duration, key func(*gin.Context) string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ok, retry := rl.allow(name+"|"+key(c), limit, per)
		if !ok {
			c.Header("Retry-After", fmt.Sprintf("%d", int(retry.Seconds())+1))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Too many attempts. Please wait a moment and try again."})
			return
		}
		c.Next()
	}
}
