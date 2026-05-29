CREATE EXTENSION IF NOT EXISTS vector;

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    username varchar(100) unique not null,
    password varchar(200) not null
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(768) NOT NULL -- Locked to 768 dimensions for nomic-embed-text-v2-moe
);

CREATE INDEX IF NOT EXISTS article_embeddings_hnsw_idx 
ON article_embeddings USING hnsw (embedding vector_cosine_ops);
