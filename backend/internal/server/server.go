package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	db *pgxpool.Pool
	router *chi.Mux
	http   *http.Server
}

func New(db *pgxpool.Pool) *Server{
	s:= &Server{
		db: db,
		router: chi.NewRouter(),
	}
	s.addRoutes()
	return s
}

func (s *Server) addRoutes(){	
	s.router.Use(middleware.Logger)
	s.router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Mimir server healthy."))
	})
}

func (s *Server) StartServer() {
    s.http = &http.Server{
        Addr:    "127.0.0.1:3002",
        Handler: s.router,
    }
    if err := s.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatalln("server error:", err)
    }
}

func (s *Server) StopServer(){
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := s.http.Shutdown(ctx); err != nil {
        log.Printf("server forced shutdown: %v", err)
    }
}