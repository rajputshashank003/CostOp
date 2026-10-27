//go:build ignore

package main

import (
	"fmt"

	"costop/internal/config"
	"costop/internal/controllers"
	"costop/internal/database"
)

func main() {
	config.Load()
	database.Connect()

	fmt.Println("Ensuring demo user exists...")
	controllers.EnsureDemoUser()
	fmt.Println("Demo user check complete!")
}
