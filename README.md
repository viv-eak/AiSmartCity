# Smart City AI

AI-Powered Smart City Incident & Service Assistant — a microservices-based civic complaint platform where citizens report issues and AI auto-classifies, prioritizes, detects duplicates, and routes them.

## Architecture

```
Citizens → React Frontend → API Gateway → Microservices
                                             ├── Auth Service
                                             ├── Complaint Service ──→ Kafka ──→ AI Service (Ollama)
                                             ├── Analytics Service                    ↓
                                             └── Notification Service ←── Kafka ←── enriched events
```

**Tech Stack:** Node.js/Express (TypeScript, ESM), PostgreSQL + pgvector, Ollama (local LLM), Apache Kafka, React + Vite + Tailwind + TanStack Query

## Services

| Service | Port |
|---|---|
| API Gateway | 3000 |
| Auth Service | 3001 |
| Complaint Service | 3002 |
| AI Service | 3003 |
| Notification Service | 3004 |
| Analytics Service | 3005 |
| Frontend (Vite) | 5173 |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

### Setup

```bash
# Start infrastructure (PostgreSQL, Kafka, Ollama, Mailhog)
docker compose up -d

# Pull AI models
./scripts/pull-models.sh

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start all backend services
npm run dev

# In a separate terminal, start the frontend
npm run dev:frontend
```

The app will be available at `http://localhost:5173`.

## AI Pipeline

When a complaint is submitted:

1. **Classification** — Ollama (llama3) categorizes the complaint (roads, water_supply, electricity, etc.) and assigns priority (low/medium/high/critical)
2. **Embedding** — nomic-embed-text generates a 768-dim vector stored in pgvector
3. **Duplicate Detection** — cosine similarity search flags duplicates (threshold > 0.92)
4. **RAG Chat** — Citizens can ask questions answered using complaint context via vector search + LLM

## API Overview

All endpoints are proxied through the API Gateway on port 3000.

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/complaints` — Submit a complaint
- `GET /api/complaints` — List complaints (with pagination and filters)
- `PATCH /api/complaints/:id/status` — Update status (admin only)
- `POST /api/ai/ask` — Ask a question (RAG)
- `GET /api/analytics/summary` — Dashboard summary stats
- `GET /api/analytics/trends` — Complaint trends over time

## Infrastructure

| Service | Image |
|---|---|
| PostgreSQL | pgvector/pgvector:pg16 |
| Kafka | confluentinc/cp-kafka:7.5.0 |
| Ollama | ollama/ollama:latest |
| Mailhog | mailhog/mailhog:latest |
| Kafka UI | provectuslabs/kafka-ui:latest |

**Useful UIs:**
- Kafka UI: `http://localhost:8080`
- Mailhog: `http://localhost:8025`

## Environment Variables

Copy `.env` to the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartcity
KAFKA_BROKERS=localhost:9092
OLLAMA_URL=http://localhost:11434
JWT_SECRET=your-dev-secret-change-in-prod
SMTP_HOST=localhost
SMTP_PORT=1025
```

## Project Structure

```
packages/
├── shared/            # Shared types, middleware, DB, Kafka utilities, Zod schemas
├── api-gateway/       # Express proxy routing to services
├── auth-service/      # JWT auth (register, login, profile)
├── complaint-service/ # CRUD + status management + timeline
├── ai-service/        # Classification, embeddings, RAG, Kafka consumer
├── notification-service/ # Email notifications via Mailhog
├── analytics-service/ # Summary, trends, category breakdown
└── frontend/          # React SPA (Vite + Tailwind + TanStack Query)
```

## Troubleshooting

- **Kafka not connecting:** Check container health and `KAFKA_BROKERS` env var
- **AI not classifying:** Ensure Ollama is running and models are pulled (`docker exec smartcity-ollama ollama list`)
- **pgvector errors:** Verify the `vector` extension is created (`scripts/init-db.sql`)
- **Auth failures:** Ensure `JWT_SECRET` is consistent across services
- **Emails not arriving:** Check Mailhog UI at `localhost:8025`
