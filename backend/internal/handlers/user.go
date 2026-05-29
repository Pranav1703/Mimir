package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"Briefly/internal/middlewares"
	"Briefly/internal/utils"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

type userBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type userResponse struct {
	ID       string    `json:"id"`
	Username string 	`json:"username"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func (h *Handler)SignUp(w http.ResponseWriter, r *http.Request) {
	var body userBody
	if err := json.NewDecoder(r.Body).Decode(&body); err !=nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse{Error: "invalid JSON"})
		return
	}

	if body.Username == "" || body.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse{Error: "username and password required"})
		return
	}

	hash, err :=bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse{Error: fmt.Sprintln("error while hashing password. ")})
		log.Println("error while hashing password. " + err.Error())
		return
	}
	var res userResponse
	err = h.DB.QueryRow(
		r.Context(),
		"INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
		body.Username,
		hash,
	).Scan(&res.ID,&res.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse{Error: fmt.Sprintln("user already exists.")})
		log.Println("failed to create user. " + err.Error())
		return
	}

	token, err := utils.GenerateToken(res.ID, res.Username)
	if err != nil {
	    w.WriteHeader(http.StatusInternalServerError)
	    json.NewEncoder(w).Encode(errorResponse{Error: "failed to generate token"})
		log.Println("failed to generate token")
	    return
	}
	http.SetCookie(w, &http.Cookie{
	    Name:     "access_token",
	    Value:    token,
	    Path:     "/",
	    HttpOnly: true,
	    SameSite: http.SameSiteLaxMode,
	    MaxAge:   604800, // 7 days in seconds
	})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "user created and logged in successfully.",
		"user": res.Username,
	})
}

func (h *Handler)Login(w http.ResponseWriter, r *http.Request) {
	var body userBody
	if err :=json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse{Error: "json decoding failed."})
		return
	}

	if body.Username == "" || body.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse{Error: "username and password required"})
		return
	}

	var id string
	var username string
	var hash string
	err := h.DB.QueryRow(
		r.Context(),
		"SELECT * FROM users WHERE username=$1",
		body.Username,
	).Scan(&id, &username, &hash)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(errorResponse{Error: "no users found."})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash),[]byte(body.Password)); err!= nil {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(errorResponse{Error: "Wrong credentials"})
		return		
	}
	token, err := utils.GenerateToken(id, username)
	if err != nil {
	    w.WriteHeader(http.StatusInternalServerError)
	    json.NewEncoder(w).Encode(errorResponse{Error: "failed to generate token"})
		log.Println("failed to generate token")
	    return
	}
	http.SetCookie(w, &http.Cookie{
	    Name:     "access_token",
	    Value:    token,
	    Path:     "/",
	    HttpOnly: true,
	    SameSite: http.SameSiteLaxMode,
	    MaxAge:   604800, // 7 days in seconds
	})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "user logged in.",
		"user": username,
	})

}

func (h *Handler)Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
	    Name:     "access_token",
	    Value:    "",
	    Path:     "/",
	    HttpOnly: true,
	    SameSite: http.SameSiteLaxMode,
	    MaxAge:   -1,
	})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "logged out",
	})
}

func (h *Handler)Me(w http.ResponseWriter, r *http.Request) {
    claims := middlewares.UserFromContext(r.Context())
    json.NewEncoder(w).Encode(map[string]string{
        "id":       claims.Subject,
        "username": claims.Username,
    })
}