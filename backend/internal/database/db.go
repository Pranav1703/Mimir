package database

import (
	"context"
	"fmt"
	"log"
	"Briefly/internal/utils"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func InitDb() *pgxpool.Pool{
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbURL := utils.GetEnv("DB_URL")
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
	err = pool.Ping(ctx)
	if err!=nil {
		log.Fatal(err)
	}

	err = applySchema(pool, "./internal/database/schema.sql")
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("Successfully connected to DB pool and applied schema file")
	return pool   
}

func applySchema(pool *pgxpool.Pool, filePath string) error{
	schema, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("unable to read schema file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second)
	defer cancel()

	_, err = pool.Exec(ctx, string(schema))
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}
	return nil
}