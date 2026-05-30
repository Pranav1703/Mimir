package handlers

import (
	embedding "Briefly/internal/embeddding"
	"Briefly/internal/utils"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	readability "codeberg.org/readeck/go-readability"
	"github.com/chromedp/chromedp"
)

type LinkReqBody struct {
	Url string `json:"url"`
}

var (
    browserCtx    context.Context
    browserCancel context.CancelFunc
    allocOnce     sync.Once
)

func initBrowser() {
    allocOnce.Do(func() {
        allocCtx,  _ := chromedp.NewExecAllocator(context.Background(),
            append(chromedp.DefaultExecAllocatorOptions[:],
                chromedp.Flag("headless", true),
                chromedp.Flag("disable-gpu", true),
                chromedp.Flag("no-sandbox", true),
				
				chromedp.Flag("disable-blink-features", "AutomationControlled"),
				
				// 2. Spoofs a real, modern Windows desktop browser signature instead of "HeadlessChrome"
				chromedp.Flag("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
				
				// 3. Sets a standard desktop viewport size so elements don't collapse suspiciously
				chromedp.Flag("window-size", "1920,1080"),
            )...,
        )

		// 2. Create the MASTER browser context here (Spawns Chrome once)
        browserCtx, browserCancel = chromedp.NewContext(allocCtx)
        
        // 3. "Warm up" the browser so it starts immediately
        if err := chromedp.Run(browserCtx); err != nil {
            log.Fatalf("Failed to start Chrome binary: %v", err)
        }
    })
}

func ShutdownBrowser() {
    if browserCancel != nil {
        browserCancel()
    }
}

func vectorToString(v []float32) string {
    parts := make([]string, len(v))
    for i, val := range v {
        parts[i] = strconv.FormatFloat(float64(val), 'f', -1, 32)
    }
    return "[" + strings.Join(parts, ",") + "]"
}

func (h *Handler)ProcessLink(w http.ResponseWriter, r *http.Request) {
	var reqBody LinkReqBody
	json.NewDecoder(r.Body).Decode(&reqBody)

	parsedURL, err := url.ParseRequestURI(reqBody.Url)
	if err != nil {
		log.Println("invalid URL format:", err)
		return
	}

   initBrowser()

	timeoutCtx, cancel := context.WithTimeout(browserCtx, 20*time.Second)
    defer cancel()
    // Create a dedicated tab for this request
	tabCtx, tabCancel := chromedp.NewContext(timeoutCtx)
    defer tabCancel()

    var htmlContent string
    err = chromedp.Run(tabCtx,
        chromedp.Navigate(parsedURL.String()),
        chromedp.WaitReady("body"),
       	chromedp.Evaluate(`document.documentElement.outerHTML`, &htmlContent),
    )
    if err != nil {
        log.Println("failed to fetch page:", err)
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode("fetch failed")
        return
    }

	data, err := readability.FromReader(strings.NewReader(htmlContent), parsedURL)
	if err!= nil {
		log.Println("readability parse failed:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode("parse failed")
		return
	}
	log.Println("data parsed from ", reqBody.Url, ":\n",data.Content)
	log.Println("summary?: ",data.Excerpt)
	log.Println("text lenght: ",data.Length)
	log.Println("Title: ",data.Title)

	chunks := embedding.ChunkText(data.TextContent, 1000)
	for _, chunk := range chunks {
    	if len(strings.TrimSpace(chunk)) == 0 {
    	    continue
    	}

    	vector, err := embedding.Generate(r.Context(), chunk)
    	if err != nil {
    	    log.Println("Ollama embedding generation failed:", err)
    	    w.WriteHeader(http.StatusInternalServerError)
    	    return
    	}

    	vecString := vectorToString(vector)

    	query := `INSERT INTO document_chunks (url, title, chunk_text, embedding) VALUES ($1, $2, $3, $4::vector)`
    	_, err = h.DB.Exec(r.Context(), query, reqBody.Url, data.Title, chunk, vecString)
    	if err != nil {
    	    log.Println("failed to save to database table:", err)
    	    w.WriteHeader(http.StatusInternalServerError)
    	    return
    	}
	}

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode("bruh")
}

func (h * Handler)ProcessFile(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "File too large (Max 10MB)", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to retrieve file from form-data", http.StatusBadRequest)
		return
	}
	defer file.Close()

	filename := handler.Filename
	ext := strings.ToLower(filepath.Ext(filename))

	var textContent string
	switch ext {
	case ".txt", ".md":
		textContent, err = utils.ParseTextFile(file)
	case ".pdf":
		textContent, err = utils.ParsePDFFile(file, handler.Size)
	case ".docx":
		textContent, err = utils.ParseDocxFile(file, handler.Size)
	default:
		http.Error(w, "Unsupported file format. Use PDF, DOCX, TXT, or MD.", http.StatusUnsupportedMediaType)
		return
	}

	if err != nil {
		log.Println("File parsing failed:", err)
		http.Error(w, "Failed to parse file text", http.StatusInternalServerError)
		return
	}

	chunks := embedding.ChunkText(textContent, 1000)
	if len(chunks) == 0 {
	    log.Println("File produced 0 chunks after parsing:", filename)
	    http.Error(w, "No extractable text found in file", http.StatusBadRequest)
	    return
	}
	// Track a mock URL style string for your DB schema requirement
	fileVirtualURL := "file://" + filename 

	for _, chunk := range chunks {
		if len(strings.TrimSpace(chunk)) == 0 {
			continue
		}

		vector, err := embedding.Generate(r.Context(), chunk)
		if err != nil {
			log.Println("Embedding generation failed for file chunk:", err)
			http.Error(w, "Failed processing vector", http.StatusInternalServerError)
			return
		}

		vecString := vectorToString(vector)

		query := `INSERT INTO document_chunks (url, title, chunk_text, embedding) VALUES ($1, $2, $3, $4::vector)`
		_, err = h.DB.Exec(r.Context(), query, fileVirtualURL, filename, chunk, vecString)
		if err != nil {
			log.Println("Failed to save file vector to database:", err)
			http.Error(w, "Database save failed", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"message":  "File successfully vectorized",
		"filename": filename,
		"chunks":   strconv.Itoa(len(chunks)),
	})
}