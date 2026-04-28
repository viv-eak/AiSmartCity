CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    complaint_id UUID REFERENCES complaints(id),
    channel VARCHAR(50) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'sent'
);
