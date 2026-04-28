CREATE TABLE complaint_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id),
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaint_events_complaint_id ON complaint_events(complaint_id);
