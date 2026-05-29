package embedding

import (
	"Briefly/internal/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

var (
	ollamaEndpoint string
	modelName      string
	configOnce     sync.Once
)

var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

type OllamaEmbedRequest struct {
	Model string `json:"model"`
	Input string `json:"input"`
}


type OllamaEmbedResponse struct {
	Model      string      `json:"model"`
	Embeddings [][]float32 `json:"embeddings"`
}

func initConfig() {
	ollamaEndpoint = utils.GetEnv("EMBEDDING_MODEL_URL")
	modelName = utils.GetEnv("EMBEDDING_MODEL_NAME")
}

func Generate(ctx context.Context, text string) ([]float32, error) {

	configOnce.Do(initConfig)
	
	reqPayload := OllamaEmbedRequest{
		Model: modelName,
		Input: text,
	}

	jsonData, err := json.Marshal(reqPayload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal ollama request: %w", err)
	}
 
	req, err := http.NewRequestWithContext(ctx, "POST", ollamaEndpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ollama connection failed (is it running?): %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama returned bad status code: %s", resp.Status)
	}

	var ollamaResp OllamaEmbedResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return nil, fmt.Errorf("failed to decode ollama response: %w", err)
	}

	// Because we pass a single string, Ollama returns our data inside the first element
	if len(ollamaResp.Embeddings) == 0 {
		return nil, fmt.Errorf("ollama returned an empty embedding array")
	}

	return ollamaResp.Embeddings[0], nil
}

func ChunkText(text string, chunkSize int) []string {
	words := strings.Fields(text)
	var chunks []string
	var currentChunk []string
	currentLength := 0

	for _, word := range words {
		currentChunk = append(currentChunk, word)
		currentLength += len(word) + 1
		if currentLength >= chunkSize {
			chunks = append(chunks, strings.Join(currentChunk, " "))
			currentChunk = nil
			currentLength = 0
		}
	}
	if len(currentChunk) > 0 {
		chunks = append(chunks, strings.Join(currentChunk, " "))
	}
	return chunks
}