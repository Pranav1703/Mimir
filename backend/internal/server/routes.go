package server

import (
	"mimir/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func UserRouter(r *chi.Mux, db *pgxpool.Pool) {

	h := handlers.New(db)

	r.Route("/user", func(r chi.Router) {
		r.Post("/signup", h.SignUp)
		r.Post("/login", h.Login)
		r.Post("/logout", h.Logout)
	})
}