package main

import (
	"costop/internal/config"
	"costop/internal/database"
	"costop/internal/models"
	"fmt"
)

func main() {
	config.Load()
	database.Connect()

	var users []models.User
	database.DB.Find(&users)
	fmt.Printf("USERS: %+v\n", users)

	var teams []models.Team
	database.DB.Find(&teams)
	fmt.Printf("TEAMS: %+v\n", teams)

	var members []models.TeamMember
	database.DB.Find(&members)
	fmt.Printf("MEMBERS: %+v\n", members)
}
