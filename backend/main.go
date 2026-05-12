package main

import (
	"mimir/database"
	"mimir/server"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	database.InitDb()

	sig  := make(chan os.Signal,1)
	signal.Notify(sig, syscall.SIGABRT, syscall.SIGINT, syscall.SIGKILL, syscall.SIGTERM)
	go func(){
		server.StartServer()
	}()

	<-sig
	server.StopServer()
	database.CloseDb(database.DB)
}
