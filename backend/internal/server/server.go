package server

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

var server *http.Server

func StartServer(){
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Mimir server healthy."))
	})
	s := &http.Server{
		Addr: "127.0.0.1:3003",
		Handler: r,
	}
	server = s
	if err := server.ListenAndServe(); err!= nil {
		log.Fatalln(err)
	}
}

func StopServer(){
	if err := server.Close(); err !=nil{
		log.Fatalln(err)
	}
}