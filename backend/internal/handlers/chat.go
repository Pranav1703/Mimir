package handlers

import (
	"Briefly/internal/embeddding"
	"Briefly/internal/middlewares"
	"Briefly/internal/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/pgvector/pgvector-go"
)

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

type ChatRequest struct {
    Message    string `json:"message"`
    SessionID  string `json:"session_id,omitempty"`  // empty = new session
}
type ChatResponse struct {
    Response   string `json:"response"`
    SessionID  string `json:"session_id"`            
}

func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {

	claims := middlewares.UserFromContext(r.Context())
	userID, err := uuid.Parse(claims.Id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid user identity profile"})
		return
	}
	var reqBody ChatRequest
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

	var sessionID uuid.UUID

	if reqBody.SessionID == "" {
		titleSnippet := reqBody.Message
    	if len(titleSnippet) > 40 {
    	    titleSnippet = titleSnippet[:37] + "..."
    	}
    	titleSnippet = strings.TrimSpace(titleSnippet)

		err = h.DB.QueryRow(ctx,
			"INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id",
			userID, titleSnippet,
		).Scan(&sessionID)
		if err != nil {
			log.Println("Database session creation failed:", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to initialize conversational thread"})
			return
		}
	} else {
		sessionID, err = uuid.Parse(reqBody.SessionID)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid session identifier specification"})
			return
		}

		var dbUserID uuid.UUID
		err = h.DB.QueryRow(ctx,
			"SELECT user_id FROM chat_sessions WHERE id = $1",
			sessionID,
		).Scan(&dbUserID)

		if err == pgx.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Chat session thread not found"})
			return
		} else if err != nil {
			log.Println("Session lookup security error:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if dbUserID != userID {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Access denied to requested session data thread"})
			return
		}
	}

	_, err = h.DB.Exec(ctx,
		"INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)",
		sessionID, reqBody.Message,
	)
	if err != nil {
		log.Println("Failed to record inbound message history record:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error saving chat history"})
		return
	}

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

	chatbotResponse := apiResponse.Choices[0].Message.Content

	_, err = h.DB.Exec(ctx,
		"INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'chatbot', $2)",
		sessionID, chatbotResponse,
	)
	if err != nil {
		log.Println("Failed to save outgoing LLM generated context:", err)
	}

	_, err = h.DB.Exec(ctx,
		"UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1",
		sessionID,
	)
	if err != nil {
		log.Println("Failed to refresh session updated_at metadata node:", err)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ChatResponse{
		Response:  chatbotResponse,
		SessionID: sessionID.String(),
	})
}