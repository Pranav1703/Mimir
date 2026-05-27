package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"time"

	readability "codeberg.org/readeck/go-readability"
)

type LinkReqBody struct {
	Url string `json:"url"`
}

func (h *Handler)ProcessLink(w http.ResponseWriter, r *http.Request) {
	var reqBody LinkReqBody
	json.NewDecoder(r.Body).Decode(&reqBody)

	parsedURL, err := url.ParseRequestURI(reqBody.Url)
	if err != nil {
		log.Println("invalid URL format:", err)
		return
	}
	data, err := readability.FromURL(parsedURL.String(), 5* time.Second)
	log.Println("data parsed from ", reqBody.Url, ":\n",data)

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode("bruh")
}