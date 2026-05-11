package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

var DB *pgx.Conn

func initDb(){
	ctx := context.Background()
	DB_URL := os.Getenv("DB_URL")
	conn, err := pgx.Connect(ctx, DB_URL)
	if err != nil {
		log.Fatalln("Failed to connect to DB.\n",err)
	}

	conn.Exec(ctx,"CREATE EXTENSION IF NOT EXISTS vector")
	DB = conn
}

