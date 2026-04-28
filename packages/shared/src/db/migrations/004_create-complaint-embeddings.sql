CREATE TABLE complaint_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) UNIQUE,
    embedding vector(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaint_embeddings_vector ON complaint_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
