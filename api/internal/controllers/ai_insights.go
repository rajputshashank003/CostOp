package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"costop/internal/cache"
	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"
	"costop/internal/services"

	"github.com/gin-gonic/gin"
)

// ── Public response types ────────────────────────────────────────────────────

// AIInsight is a single AI-generated cost-saving recommendation.
type AIInsight struct {
	Type                    string `json:"type"`
	Title                   string `json:"title"`
	Description             string `json:"description"`
	EstimatedMonthlySavings float64 `json:"estimated_monthly_savings"`
	Confidence              string `json:"confidence"`
	ActionLabel             string `json:"action_label"`
	SubscriptionIDs         []uint `json:"subscription_ids,omitempty"`
}

// AIInsightsResponse is the full payload returned to the client.
type AIInsightsResponse struct {
	Insights    []AIInsight `json:"insights"`
	GeneratedAt time.Time   `json:"generated_at"`
	Cached      bool        `json:"cached"`
}

// ── Internal types ───────────────────────────────────────────────────────────

// subContext is a compact subscription representation sent to the AI prompt.
type subContext struct {
	ID            uint     `json:"id"`
	Name          string   `json:"name"`
	Category      string   `json:"category"`
	BillingCycle  string   `json:"billing_cycle"`
	MonthlyCost   float64  `json:"monthly_cost"`
	SeatCount     int      `json:"seat_count"`
	AssignedSeats int      `json:"assigned_seats"`
	Teams         []string `json:"teams,omitempty"`
}

const aiInsightsCacheTTL = 6 * time.Hour
const geminiModel = "gemini-2.5-flash"

// ── Handlers ─────────────────────────────────────────────────────────────────

// GetAIInsights generates AI-powered cost optimization insights using Gemini.
// GET /api/insights/ai
func GetAIInsights(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	if config.GeminiAPIKey == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI insights not configured"})
		return
	}

	cacheKey := fmt.Sprintf("ai_insights:org:%d", user.OrgID)

	// Serve from cache when available
	if cached, ok := cache.AppCache.Get(cacheKey); ok {
		resp := cached.(AIInsightsResponse)
		resp.Cached = true
		c.JSON(http.StatusOK, resp)
		return
	}

	subs, err := buildSubscriptionContext(user.OrgID)
	if err != nil {
		log.Printf("[AI Insights] Failed to load subscription data for org %d: %v", user.OrgID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load subscription data"})
		return
	}
	if len(subs) == 0 {
		c.JSON(http.StatusOK, AIInsightsResponse{Insights: []AIInsight{}, GeneratedAt: time.Now()})
		return
	}

	currency := services.OrgCurrency(user.OrgID)
	insights, err := callGemini(subs, currency, true)
	if err != nil {
		log.Printf("[AI Insights] Gemini call with grounding failed for org %d: %v — retrying without grounding", user.OrgID, err)
		insights, err = callGemini(subs, currency, false)
		if err != nil {
			log.Printf("[AI Insights] Gemini call without grounding also failed for org %d: %v", user.OrgID, err)
			if strings.Contains(err.Error(), "rate limit") {
				c.JSON(http.StatusTooManyRequests, gin.H{"error": "AI rate limit reached — please try again in a minute"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "AI analysis failed, please try again later"})
			}
			return
		}
	}

	resp := AIInsightsResponse{
		Insights:    insights,
		GeneratedAt: time.Now(),
		Cached:      false,
	}

	cache.AppCache.Set(cacheKey, resp, aiInsightsCacheTTL)
	c.JSON(http.StatusOK, resp)
}

// RefreshAIInsights invalidates the AI cache for the org so the next GET regenerates.
// POST /api/insights/ai/refresh
func RefreshAIInsights(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	cacheKey := fmt.Sprintf("ai_insights:org:%d", user.OrgID)
	cache.AppCache.Invalidate(cacheKey)
	c.JSON(http.StatusOK, gin.H{"message": "Cache cleared — next request will regenerate insights"})
}

// ── Data gathering ────────────────────────────────────────────────────────────

// buildSubscriptionContext fetches all active subscriptions for the org in a single
// round-trip and enriches them with assignment counts and team names.
func buildSubscriptionContext(orgID uint) ([]subContext, error) {
	var subs []models.Subscription
	if err := database.DB.
		Where("org_id = ? AND status = 'active'", orgID).
		Find(&subs).Error; err != nil {
		return nil, err
	}
	if len(subs) == 0 {
		return nil, nil
	}

	subIDs := make([]uint, len(subs))
	for i, s := range subs {
		subIDs[i] = s.ID
	}

	// Bulk: assignment counts
	type countRow struct {
		SubscriptionID uint
		Count          int
	}
	var assignRows []countRow
	if err := database.DB.Model(&models.SubscriptionAssignment{}).
		Select("subscription_id, count(*) as count").
		Where("subscription_id IN ?", subIDs).
		Group("subscription_id").
		Find(&assignRows).Error; err != nil {
		return nil, fmt.Errorf("fetch assignment counts: %w", err)
	}

	assignMap := make(map[uint]int, len(assignRows))
	for _, r := range assignRows {
		assignMap[r.SubscriptionID] = r.Count
	}

	// Bulk: team names per subscription
	type stRow struct {
		SubscriptionID uint
		TeamName       string
	}
	var stRows []stRow
	if err := database.DB.Table("subscription_teams st").
		Select("st.subscription_id, t.name as team_name").
		Joins("JOIN teams t ON t.id = st.team_id").
		Where("st.subscription_id IN ?", subIDs).
		Find(&stRows).Error; err != nil {
		return nil, fmt.Errorf("fetch team names: %w", err)
	}

	teamMap := make(map[uint][]string)
	for _, r := range stRows {
		teamMap[r.SubscriptionID] = append(teamMap[r.SubscriptionID], r.TeamName)
	}

	// Build compact context
	result := make([]subContext, 0, len(subs))
	for _, s := range subs {
		monthly := s.Cost
		if s.BillingCycle == "Yearly" {
			monthly = s.Cost / 12.0
		}
		result = append(result, subContext{
			ID:            s.ID,
			Name:          s.Name,
			Category:      s.Category,
			BillingCycle:  s.BillingCycle,
			MonthlyCost:   monthly,
			SeatCount:     s.SeatCount,
			AssignedSeats: assignMap[s.ID],
			Teams:         teamMap[s.ID],
		})
	}
	return result, nil
}

// ── Gemini API integration ────────────────────────────────────────────────────

const systemPrompt = `You are a SaaS cost optimization expert. Analyze subscriptions and return 2-3 actionable cost-saving insights.

CRITICAL RULES:
1. Return ONLY valid JSON — no text outside it
2. "description" must be MAX 2 short sentences (under 120 characters total). Be direct: state the action and the saving. No explanations or reasoning.
3. Use real subscription names and IDs from the input
4. Rank by estimated_monthly_savings descending
5. estimated_monthly_savings must be realistic

Example good description: "Switch to annual billing at $17/mo (vs $20/mo). Saves $3/mo."
Example bad description: "You currently have two subscriptions, one for $20/month..." (TOO LONG)

JSON schema:
{
  "insights": [
    {
      "type": "billing_cycle|consolidation|alternative|downgrade|seat_optimization",
      "title": "Action title (≤50 chars)",
      "description": "Max 2 short sentences, under 120 chars total",
      "estimated_monthly_savings": 12.50,
      "confidence": "high|medium|low",
      "action_label": "CTA (≤20 chars)",
      "subscription_ids": [1, 2]
    }
  ]
}`

// callGemini sends the subscription context to Gemini 2.0 Flash and parses the
// structured JSON response. When useGrounding is true, Google Search is enabled
// so Gemini can verify real-time pricing.
func callGemini(subs []subContext, currency string, useGrounding bool) ([]AIInsight, error) {
	var totalMonthly float64
	for _, s := range subs {
		totalMonthly += s.MonthlyCost
	}

	subsJSON, err := json.MarshalIndent(subs, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("marshal subscription context: %w", err)
	}

	searchInstruction := ""
	if useGrounding {
		searchInstruction = "\n\nSearch the web to verify current pricing, annual discounts, and seat-tier pricing for each tool."
	}

	currencyInstruction := ""
	if currency != "USD" {
		currencyInstruction = fmt.Sprintf(
			"\n\nAll costs above are in USD. In \"title\" and \"description\", write money in %s (1 USD = %.2f %s, e.g. %s), but keep \"estimated_monthly_savings\" as a USD number.",
			currency, services.ConvertUSD(1, currency), currency, services.FormatMoney(20, currency),
		)
	}

	userMsg := fmt.Sprintf(
		`Analyze this company's SaaS portfolio and return 2-3 cost-saving insights as JSON.

Total monthly spend: $%.2f/month (USD) across %d active subscriptions.

Subscriptions (use the "id" field in subscription_ids; monthly_cost is in USD):
%s%s%s

Return ONLY the JSON object.`,
		totalMonthly, len(subs), string(subsJSON), searchInstruction, currencyInstruction,
	)

	genConfig := map[string]interface{}{
		"temperature":       0.2,
		"max_output_tokens": 2048,
		"response_mime_type": "application/json",
		"thinking_config": map[string]interface{}{
			"thinking_budget": 0,
		},
	}

	body := map[string]interface{}{
		"system_instruction": map[string]interface{}{
			"parts": []map[string]string{{"text": systemPrompt}},
		},
		"contents": []map[string]interface{}{
			{"role": "user", "parts": []map[string]string{{"text": userMsg}}},
		},
		"generation_config": genConfig,
	}

	if useGrounding {
		body["tools"] = []map[string]interface{}{
			{"google_search": map[string]interface{}{}},
		}
		// response_mime_type is not supported with Google Search tool
		delete(genConfig, "response_mime_type")
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	// The key goes in a header, never the URL: Go puts the full URL into network error messages
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", geminiModel)

	log.Printf("[AI Insights] Calling Gemini (grounding=%v, subs=%d, spend=$%.2f)", useGrounding, len(subs), totalMonthly)

	client := &http.Client{Timeout: 60 * time.Second}
	httpReq, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-goog-api-key", config.GeminiAPIKey)
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("gemini request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("[AI Insights] Gemini API returned %d: %s", resp.StatusCode, string(respBytes))
		if resp.StatusCode == http.StatusTooManyRequests {
			return nil, fmt.Errorf("gemini rate limit exceeded — please try again in a minute")
		}
		return nil, fmt.Errorf("gemini API %d: %s", resp.StatusCode, string(respBytes))
	}

	// Parse flexible response structure
	var gemResp map[string]interface{}
	if err := json.Unmarshal(respBytes, &gemResp); err != nil {
		return nil, fmt.Errorf("unmarshal gemini response: %w", err)
	}

	rawText := extractTextFromGeminiResponse(gemResp)
	if rawText == "" {
		log.Printf("[AI Insights] No text found in Gemini response: %s", string(respBytes))
		return nil, fmt.Errorf("no text content in gemini response")
	}

	log.Printf("[AI Insights] Gemini raw text: %.500s", rawText)

	jsonStr := extractJSONObject(rawText)

	var parsed struct {
		Insights []AIInsight `json:"insights"`
	}
	if err := json.Unmarshal([]byte(jsonStr), &parsed); err != nil {
		return nil, fmt.Errorf("parse insights JSON: %w\nraw: %s", err, rawText)
	}

	insights := parsed.Insights
	if len(insights) > 3 {
		insights = insights[:3]
	}
	log.Printf("[AI Insights] Successfully parsed %d insights", len(insights))
	return insights, nil
}

// extractTextFromGeminiResponse walks the untyped Gemini JSON response and
// concatenates all text parts from the first candidate.
func extractTextFromGeminiResponse(resp map[string]interface{}) string {
	candidates, ok := resp["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return ""
	}
	candidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return ""
	}
	content, ok := candidate["content"].(map[string]interface{})
	if !ok {
		return ""
	}
	parts, ok := content["parts"].([]interface{})
	if !ok {
		return ""
	}

	var sb strings.Builder
	for _, p := range parts {
		part, ok := p.(map[string]interface{})
		if !ok {
			continue
		}
		if text, ok := part["text"].(string); ok && text != "" {
			sb.WriteString(text)
		}
	}
	return sb.String()
}

// extractJSONObject pulls the first complete JSON object out of a string that may
// contain markdown fences or preamble text.
func extractJSONObject(s string) string {
	s = strings.TrimSpace(s)

	// Strip markdown code fences
	if idx := strings.Index(s, "```json"); idx != -1 {
		s = s[idx+7:]
		if end := strings.Index(s, "```"); end != -1 {
			s = s[:end]
		}
	} else if idx := strings.Index(s, "```"); idx != -1 {
		s = s[idx+3:]
		if end := strings.Index(s, "```"); end != -1 {
			s = s[:end]
		}
	}

	s = strings.TrimSpace(s)

	// Find outer braces
	start := strings.Index(s, "{")
	end := strings.LastIndex(s, "}")
	if start != -1 && end > start {
		return s[start : end+1]
	}
	return s
}
