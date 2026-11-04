package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// GetCategories fetches the shared categories plus the caller's organization's own.
func GetCategories(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	var categories []models.Category
	if err := database.DB.Where("org_id IN ?", []uint{0, user.OrgID}).Order("name asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// AddCategory creates a category visible only to the caller's organization.
func AddCategory(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	var body struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		return
	}

	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category name is required (max 50 characters)"})
		return
	}
	if user.OrgID == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Organization not found"})
		return
	}
	input := models.Category{Name: name, OrgID: user.OrgID}

	// Check if category already exists (shared or in this org)
	var existingCategory models.Category
	if err := database.DB.Where("name = ? AND org_id IN ?", name, []uint{0, user.OrgID}).First(&existingCategory).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Category already exists"})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	InvalidateCategoryCache(user.OrgID)
	c.JSON(http.StatusCreated, input)
}
