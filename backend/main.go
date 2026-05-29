package main

import (
	"Briefly/internal/database"
	"Briefly/internal/handlers"
	"Briefly/internal/server"
	"Briefly/internal/utils"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	utils.LoadEnv()
	sig  := make(chan os.Signal,1)
	signal.Notify(sig, syscall.SIGABRT, syscall.SIGINT, syscall.SIGTERM)

	pool := database.InitDb()
	defer pool.Close()
	server := server.New(pool)

	go func(){
		server.StartServer()
	}()

	<-sig
	handlers.ShutdownBrowser()
	server.StopServer()

}
