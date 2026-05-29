package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func (h *Handler)GetTitles(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10 * time.Second)
	defer cancel()

	query := "SELECT DISTINCT title FROM document_chunks ORDER BY title ASC"
	rows, err := h.DB.Query(ctx, query)
	if err != nil {
		log.Println("Database retrieval error in GetTitles:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch document titles"})
		return
	}
	defer rows.Close()

	titles := []string{}

	for rows.Next() {
		var title string
		if err := rows.Scan(&title); err != nil {
			log.Println("Row scan failure in GetTitles:", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to parse document titles"})
			return
		}
		titles = append(titles, title)
	}

	if err := rows.Err(); err != nil {
		log.Println("Rows collection traversal error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error processing titles payload"})
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(titles)
}