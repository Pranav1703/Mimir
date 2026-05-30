package handlers

import (
	"Briefly/internal/middlewares"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type session struct {
	Id string	 `json:"id"`
	Title string `json:"title"`
}

type sessionResp struct {
	Sessions []session `json:"sessions"`
}
func (h *Handler) GetSessions(w http.ResponseWriter, r *http.Request) {
	claims := middlewares.UserFromContext(r.Context())
	rows , err := h.DB.Query(r.Context(),"Select id, title from chat_sessions where user_id=$1", claims.Id)
	if err!= nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch sessions. db error"})
		return
	}
	defer rows.Close()

	var sessionList []session
	for rows.Next() {
		var s session
		if err :=rows.Scan(&s.Id, &s.Title); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "failed to scan sessionsList."})
			return
		}
		sessionList = append(sessionList, s)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&sessionResp{
		Sessions: sessionList,
	})
}

type chatMsg struct {
	Role string `json:"role"`
	Content string `json:"content"`
	Created_at time.Time `json:"createdAt"`
}

type msgResp struct {
	Messages []chatMsg `json:"messages"`
}

func (h *Handler) GetMessagesbySessionId(w http.ResponseWriter, r *http.Request) {
	sessionId := chi.URLParam(r, "id")

	rows , err := h.DB.Query(r.Context(),"Select role, content, created_at from chat_messages where session_id=$1", sessionId)
	if err!= nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch sessions. db error"})
		return
	}
	defer rows.Close()
	var messages []chatMsg
		
	for rows.Next() {
		var msg chatMsg
		if err := rows.Scan(&msg.Role, &msg.Content, &msg.Created_at); err!=nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "failed to scan chat messages."})
			return			
		}
		messages = append(messages, msg)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&msgResp{
		Messages: messages,
	})
}


func (h *Handler) DeleteSessions(w http.ResponseWriter, r *http.Request) {
	sessionId := chi.URLParam(r, "id")
	claims := middlewares.UserFromContext(r.Context())
	_, err :=h.DB.Exec(r.Context(), "DELETE from chat_sessions where id = $1 AND user_id = $2", sessionId, claims.Id)
	if err!= nil{
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete session. db error"})
		return
	}

	w.WriteHeader(http.StatusOK)
}