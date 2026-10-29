package controllers

import (
	"net/http"

	"costop/internal/services"

	"github.com/gin-gonic/gin"
)

// GetFXRates returns the cached USD-based exchange rates used for display conversion.
// GET /api/fx/rates
func GetFXRates(c *gin.Context) {
	c.JSON(http.StatusOK, services.GetFXRates())
}
