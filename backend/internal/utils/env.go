package utils

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("Note: No .env file detected; falling back to system environment variables.")
	}
}

func GetEnv(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		log.Fatalf("Critical Error: Environment configuration parameter %s is missing.", key)
	}
	return value
}