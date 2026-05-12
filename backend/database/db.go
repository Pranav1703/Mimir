package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

var DB *pgx.Conn

func InitDb() {
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
	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		log.Fatalln("Failed to connect to DB.\n",err)
	}

	if err :=conn.Ping(ctx); err != nil {
		log.Fatalln(err)
	}

	_, err = conn.Exec(ctx,"CREATE EXTENSION IF NOT EXISTS vector")
	if err != nil {
		log.Fatalf("Failed to create extension: %v\n", err)
	}
	log.Println("Successfully connected to DB")
	DB = conn
}

func CloseDb(db *pgx.Conn) {
	ctx, cancel := context.WithTimeout(context.Background(),3* time.Second)
	defer cancel()
	err := db.Close(ctx)
	if err!=nil {
		log.Printf("Warning: DB close error: %v\n", err)
	}
}