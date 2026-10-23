package controllers

import (
	"math"
	"net/http"
	"strings"

	"costop/internal/database"
	"costop/internal/models"

	"github.com/gin-gonic/gin"
)

// WebsiteAdminEmail defines the single authorized website admin allowed to manage platform plan pricing.
const WebsiteAdminEmail = "hariomshashank@gmail.com"

// GetPublicPricing returns the active plan pricing, discount percentage, and calculated yearly amounts.
// GET /api/payment/pricing
func GetPublicPricing(c *gin.Context) {
	var setting models.PlanSetting
	if err := database.DB.Where("plan_code = ? AND is_active = ?", "pro", true).First(&setting).Error; err != nil {
		// Fallback to safe default if row not yet seeded
		setting = models.PlanSetting{
			PlanCode:              "pro",
			PlanName:              "CostOp Pro",
			MonthlyPrice:          999.00,
			YearlyDiscountPercent: 20.00,
			Currency:              "INR",
			MaxMembers:            100,
			IsActive:              true,
		}
	}

	discountMultiplier := 1.0 - (setting.YearlyDiscountPercent / 100.0)
	yearlyMonthlyEquivalent := math.Round(setting.MonthlyPrice*discountMultiplier*100.0) / 100.0
	yearlyTotalPrice := math.Round(yearlyMonthlyEquivalent*12.0*100.0) / 100.0
	yearlyTotalSavings := math.Round((setting.MonthlyPrice*12.0-yearlyTotalPrice)*100.0) / 100.0

	c.JSON(http.StatusOK, gin.H{
		"plan_code":                 setting.PlanCode,
		"plan_name":                 setting.PlanName,
		"monthly_price":             setting.MonthlyPrice,
		"yearly_discount_percent":   setting.YearlyDiscountPercent,
		"yearly_monthly_equivalent": yearlyMonthlyEquivalent,
		"yearly_total_price":        yearlyTotalPrice,
		"yearly_total_savings":      yearlyTotalSavings,
		"currency":                  setting.Currency,
		"max_members":               setting.MaxMembers,
	})
}

// UpdatePlanSettings allows the website admin to update the monthly plan price and yearly discount percentage.
// PATCH /api/admin/plan-settings
func UpdatePlanSettings(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var caller models.User
	if err := database.DB.First(&caller, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	if strings.ToLower(strings.TrimSpace(caller.Email)) != strings.ToLower(WebsiteAdminEmail) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Access denied: Only website admin can modify plan pricing",
		})
		return
	}

	var input struct {
		MonthlyPrice          *float64 `json:"monthly_price" binding:"required"`
		YearlyDiscountPercent *float64 `json:"yearly_discount_percent" binding:"required"`
		PlanName              string   `json:"plan_name"`
		MaxMembers            *int     `json:"max_members"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload. 'monthly_price' and 'yearly_discount_percent' are required."})
		return
	}

	if *input.MonthlyPrice <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Monthly price must be greater than zero"})
		return
	}

	if *input.YearlyDiscountPercent < 0 || *input.YearlyDiscountPercent > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Yearly discount must be between 0% and 100%"})
		return
	}

	var setting models.PlanSetting
	if err := database.DB.Where("plan_code = ?", "pro").First(&setting).Error; err != nil {
		setting = models.PlanSetting{
			PlanCode:   "pro",
			PlanName:   "CostOp Pro",
			Currency:   "INR",
			MaxMembers: 100,
			IsActive:   true,
		}
	}

	setting.MonthlyPrice = math.Round(*input.MonthlyPrice*100.0) / 100.0
	setting.YearlyDiscountPercent = math.Round(*input.YearlyDiscountPercent*100.0) / 100.0
	if input.PlanName != "" {
		setting.PlanName = strings.TrimSpace(input.PlanName)
	}
	if input.MaxMembers != nil && *input.MaxMembers > 0 {
		setting.MaxMembers = *input.MaxMembers
	}

	if err := database.DB.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save plan settings"})
		return
	}

	discountMultiplier := 1.0 - (setting.YearlyDiscountPercent / 100.0)
	yearlyMonthlyEquivalent := math.Round(setting.MonthlyPrice*discountMultiplier*100.0) / 100.0
	yearlyTotalPrice := math.Round(yearlyMonthlyEquivalent*12.0*100.0) / 100.0
	yearlyTotalSavings := math.Round((setting.MonthlyPrice*12.0-yearlyTotalPrice)*100.0) / 100.0

	c.JSON(http.StatusOK, gin.H{
		"message":                   "Plan settings updated successfully",
		"plan_code":                 setting.PlanCode,
		"plan_name":                 setting.PlanName,
		"monthly_price":             setting.MonthlyPrice,
		"yearly_discount_percent":   setting.YearlyDiscountPercent,
		"yearly_monthly_equivalent": yearlyMonthlyEquivalent,
		"yearly_total_price":        yearlyTotalPrice,
		"yearly_total_savings":      yearlyTotalSavings,
		"currency":                  setting.Currency,
		"max_members":               setting.MaxMembers,
	})
}
