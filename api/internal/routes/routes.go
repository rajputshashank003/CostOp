package routes

import (
	"costop/internal/controllers"
	"costop/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all the endpoints for the API
func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Health Check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Authentication Routes
		auth := api.Group("/auth")
		{
			auth.POST("/google", controllers.VerifyGoogleToken)
		}

		// Protected Routes
		metrics := api.Group("/metrics")
		metrics.Use(middleware.RequireAuth())
		{
			metrics.GET("", controllers.GetMetrics)
		}

		subscriptions := api.Group("/subscriptions")
		subscriptions.Use(middleware.RequireAuth())
		{
			subscriptions.GET("", controllers.GetSubscriptions)
			subscriptions.POST("", controllers.AddSubscription)
			subscriptions.DELETE("/:id", controllers.DeleteSubscription)
		}

		members := api.Group("/members")
		members.Use(middleware.RequireAuth())
		{
			members.GET("", controllers.GetTeamMembers)
			members.POST("/invite", controllers.InviteMember)
			members.DELETE("/invite/:id", controllers.RevokeInvite)
		}
	}
}
