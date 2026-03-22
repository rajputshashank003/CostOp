package controllers

import (
	"costop/internal/database"
	"costop/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetCategories fetches all available categories.
func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := database.DB.Order("name asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// AddCategory creates a new category.
func AddCategory(c *gin.Context) {
	var input models.Category
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category name is required"})
		return
	}

	// Check if category already exists
	var existingCategory models.Category
	if err := database.DB.Where("name = ?", input.Name).First(&existingCategory).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Category already exists"})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, input)
}
