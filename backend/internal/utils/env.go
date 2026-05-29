package utils

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func GetEnv(key string) string {
	if err := godotenv.Load(); err != nil {
		log.Println("Note: No .env file detected; falling back to system environment variables.")
	}
	value, ok := os.LookupEnv(key)
	if !ok {
		log.Fatalf("Critical Error: Environment configuration parameter %s is missing.", key)
	}
	return value
}