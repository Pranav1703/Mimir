# Briefly

A self-hosted RAG (Retrieval-Augmented Generation) article and document summarizer. Ingest web articles or documents, then ask questions about them — the system retrieves relevant context via vector search and answers using an LLM.

## Self-Host Setup

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Ollama](https://ollama.ai/) running on the host with the embedding model pulled:

```
ollama pull nomic-embed-text-v2-moe
```

- An [OpenRouter](https://openrouter.ai/) API key (free tier available)

### Steps

1. **Clone the repo and enter the directory**

```
git clone <repo-url> briefly
cd briefly
```

2. **Create your environment file**

Copy the example and fill in your values:

```
cp .env.example .env
```

Edit `.env` — set correct values.

3. **Start the stack**

```
docker compose up -d
```

This starts three services:
- `db` — PostgreSQL with pgvector (port 5433)
- `backend` — Go API server (port 3002)
- `frontend` — Nginx-served SPA (port 5173)

4. **Open the app**

Visit [http://localhost:5173](http://localhost:5173)

### Notes

- The backend connects to Ollama on the host via `host.docker.internal:11434`. If you're on Linux without Docker Desktop, ensure `--add-host host.docker.internal:host-gateway` is active (already set in `docker-compose.yml`).
- CORS is configured for `http://localhost:5173`. For custom domains, update `AllowedOrigins` in `backend/internal/server/server.go:34`.
- The DB schema is auto-applied on first startup — no manual migration needed.
