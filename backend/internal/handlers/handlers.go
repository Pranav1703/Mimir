package handlers

import "github.com/jackc/pgx/v5/pgxpool"

type Handler struct {
	DB *pgxpool.Pool
}

func New(p *pgxpool.Pool) *Handler{
	return &Handler{
		DB: p,
	}
}