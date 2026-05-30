package server

import (
	"Briefly/internal/handlers"
	"Briefly/internal/middlewares"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func UserRouter(r *chi.Mux, db *pgxpool.Pool) {

	h := handlers.New(db)

	r.Route("/user", func(r chi.Router) {
		r.Post("/signup", h.SignUp)
		r.Post("/login", h.Login)
		
		r.Group(func(r chi.Router) {
			r.Use(middlewares.VerifyToken)
			r.Post("/logout", h.Logout)
			r.Get("/me", h.Me)
		})
	})
}

func IngestRouter(r *chi.Mux, db *pgxpool.Pool) {
	h := handlers.New(db)

	r.Route("/ingest", func(r chi.Router) {
		r.Use(middlewares.VerifyToken)
		r.Post("/link", h.ProcessLink)
		r.Post("/file", h.ProcessFile)
	})
}

func ChatRouter(r *chi.Mux, db * pgxpool.Pool) {
	h := handlers.New(db)
	
	r.Route("/chat", func(r chi.Router) {
		r.Use(middlewares.VerifyToken)
		r.Post("/talk", h.Chat)
		r.Get("/articleTitles", h.GetTitles)
		
		r.Get("/sessions", h.GetSessions)
		r.Get("/session/{id}/messages", h.GetMessagesbySessionId)
		r.Delete("/session/{id}", h.DeleteSessions)
	})
}
