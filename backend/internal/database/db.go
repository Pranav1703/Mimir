package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func InitDb() *pgxpool.Pool{
	err := godotenv.Load()
  	if err != nil {
  	  log.Fatal("Error loading .env file")
  	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is not set")
	}
    config, err := pgxpool.ParseConfig(dbURL)
    if err != nil { 
		log.Fatal(err)
	}
    
	config.MaxConns = 10
    config.MinConns = 2
    config.MaxConnLifetime = 1 * time.Hour
    config.HealthCheckPeriod = 30 * time.Second
    
	pool, err := pgxpool.NewWithConfig(ctx, config)
    if err != nil { 
		log.Fatal(err)
	}
	log.Println("Successfully connected to DB pool")
	return pool   
}