package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
)

var DB *pgx.Conn

func initDb(){
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

