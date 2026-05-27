package main

import (
	"Briefly/internal/database"
	"Briefly/internal/server"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	sig  := make(chan os.Signal,1)
	signal.Notify(sig, syscall.SIGABRT, syscall.SIGINT, syscall.SIGTERM)

	pool := database.InitDb()
	defer pool.Close()
	server := server.New(pool)

	go func(){
		server.StartServer()
	}()

	<-sig
	server.StopServer()
}
