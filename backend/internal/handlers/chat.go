package handlers

import (
	"strings"
	"Briefly/internal/embeddding"
	"Briefly/internal/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/pgvector/pgvector-go"
)


type Msg struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Response string `json:"response"`
}

// Standard OpenAI structural payloads used by OpenRouter
type OpenAIChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIChatResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {

	var reqBody Msg
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request format"})
		return
	}

	if reqBody.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Message content cannot be empty"})
		return
	}

	// Create a safe operational context deadline for the RAG chain
	ctx, cancel := context.WithTimeout(r.Context(), 2 * time.Minute)
	defer cancel()


	queryEmbedding, err := embedding.Generate(ctx, reqBody.Message)
	if err != nil {
		log.Println("Vector generation error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to evaluate query vector context"})
		return
	}

	rows, err := h.DB.Query(ctx, 
		"SELECT chunk_text FROM document_chunks ORDER BY embedding <=> $1 LIMIT 3", 
		pgvector.NewVector(queryEmbedding),
	)
	if err != nil {
		log.Println("Database retrieval matching failure:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database retrieval pipeline context error"})
		return
	}
	defer rows.Close()

	var contextChunks []string
	for rows.Next() {
		var chunk string
		if err := rows.Scan(&chunk); err == nil {
			contextChunks = append(contextChunks, chunk)
		}
	}
	var systemPrompt strings.Builder; 
	systemPrompt.WriteString("You are a helpful assistant. Use the following document context snippets to answer the user's question accurately. If the context doesn't contain information to answer the question, answer using your general knowledge but mention that it wasn't found in the documents.\n\nContext:\n")
	for _, chunk := range contextChunks {
		systemPrompt.WriteString(fmt.Sprintf("- %s\n", chunk))
	}

	apiKey := utils.GetEnv("OPENROUTER_API_KEY")
	modelName := utils.GetEnv("CHAT_MODEL_NAME") // use free tier models
	apiURL := "https://openrouter.ai/api/v1/chat/completions"

	// Build the API payload , follows OPENAI API format
	payload := OpenAIChatRequest{
		Model: modelName,
		Messages: []Message{
			{Role: "system", Content: systemPrompt.String()},
			{Role: "user", Content: reqBody.Message},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("OpenRouter network invocation failed:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "AI provider connection timed out"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("OpenRouter returned error status: %s", resp.Status)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "AI generation service failed"})
		return
	}

	var apiResponse OpenAIChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil || len(apiResponse.Choices) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to parse generation content payload"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ChatResponse{
		Response: apiResponse.Choices[0].Message.Content,
	})
}