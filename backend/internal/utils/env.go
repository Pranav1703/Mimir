package utils

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func GetEnv(key string) string {
	err := godotenv.Load()
  	if err != nil {
  	  log.Fatal("Error loading .env file")
  	}
	value, ok := os.LookupEnv(key)
	if(!ok){
		log.Fatalln(key," is not set.")
	}
	return value
}