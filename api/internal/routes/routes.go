package routes

import (
	"costop/internal/controllers"
	"costop/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all endpoints for the CostOp API.
func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Health Check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// ── Authentication ────────────────────────────────────────────────────
		auth := api.Group("/auth")
		{
			auth.POST("/google", controllers.VerifyGoogleToken)
		}

		// ── Teams ─────────────────────────────────────────────────────────────
		teams := api.Group("/teams")
		teams.Use(middleware.RequireAuth())
		{
			teams.GET("", controllers.GetMyTeams)                          // all teams for current user
			teams.GET("/all", controllers.GetAllTeams)                     // all teams in workspace (for dropdowns)
			teams.GET("/:id", controllers.GetTeamByID)                     // get a single team (with settings)
			teams.POST("", controllers.CreateTeam)                         // create a new team
			teams.GET("/:id/members", controllers.GetMembersByTeam)        // members of a specific team
			teams.PATCH("/:id/members/:uid", controllers.UpdateMemberTeam) // admin: move member to another team
			teams.PATCH("/:id/settings", controllers.UpdateTeamSettings)   // admin: update settings / team name
		}

		// ── Members (default-team scoped convenience endpoints) ───────────────
		members := api.Group("/members")
		members.Use(middleware.RequireAuth())
		{
			members.GET("", controllers.GetTeamMembers)
			members.POST("/invite", controllers.InviteMember)
			members.DELETE("/invite/:id", controllers.RevokeInvite)
		}

		// ── Subscriptions ─────────────────────────────────────────────────────
		subscriptions := api.Group("/subscriptions")
		subscriptions.Use(middleware.RequireAuth())
		{
			subscriptions.GET("", controllers.GetSubscriptions)
			subscriptions.GET("/:id", controllers.GetSubscriptionByID)
			subscriptions.POST("", controllers.AddSubscription)
			subscriptions.DELETE("/:id", controllers.DeleteSubscription)
			subscriptions.PATCH("/:id/archive", controllers.ArchiveSubscription)
			subscriptions.PATCH("/:id/restore", controllers.RestoreSubscription)
			// Seat management
			subscriptions.GET("/:id/seats", controllers.GetSeats)
			subscriptions.POST("/:id/assign", controllers.AssignSeat)
			subscriptions.DELETE("/:id/assign/:uid", controllers.UnassignSeat)
			// Team access management
			subscriptions.POST("/:id/teams", controllers.GrantTeamAccess)
			subscriptions.DELETE("/:id/teams/:tid", controllers.RevokeTeamAccess)
		}

		// ── Users (Profile) ───────────────────────────────────────────────────
		users := api.Group("/users")
		users.Use(middleware.RequireAuth())
		{
			users.GET("/profile/subscriptions", controllers.GetProfileSubscriptions)
			users.GET("/:id/profile", controllers.GetUserProfile)
			users.PATCH("/onboard", controllers.OnboardUser)
		}

		// ── Subscription Requests (member → admin approval) ───────────────────
		requests := api.Group("/requests")
		requests.Use(middleware.RequireAuth())
		{
			requests.GET("", controllers.GetRequests)
			requests.POST("", controllers.CreateRequest)
			requests.PATCH("/:id/approve", controllers.ApproveRequest)
			requests.PATCH("/:id/reject", controllers.RejectRequest)
		}

		// ── Metrics ───────────────────────────────────────────────────────────
		metrics := api.Group("/metrics")
		metrics.Use(middleware.RequireAuth())
		{
			metrics.GET("", controllers.GetMetrics)
		}

		// ── Categories ────────────────────────────────────────────────────────
		categories := api.Group("/categories")
		categories.Use(middleware.RequireAuth())
		{
			categories.GET("", controllers.GetCategories)
			categories.POST("", controllers.AddCategory)
		}

		// ── History / Analytics ───────────────────────────────────────────────
		history := api.Group("/history")
		history.Use(middleware.RequireAuth())
		{
			history.GET("/spends", controllers.GetHistoricalSpends)
			history.GET("/department-spends", controllers.GetDepartmentSpendHistory)
		}
	}
}
