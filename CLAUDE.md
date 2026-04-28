# Smart City AI — Project Reference

AI-Powered Smart City Incident & Service Assistant — microservices-based civic complaint platform where citizens report issues and AI auto-classifies, prioritizes, detects duplicates, and routes them.

**Tech Stack:** Node.js/Express (TypeScript, ESM), PostgreSQL + pgvector, Ollama (local LLM), Apache Kafka, React + Vite + Tailwind + TanStack Query

**Conventions:** All services are TypeScript ESM (`"type": "module"` in package.json). Use `.js` extensions in imports even for `.ts` files. Monorepo uses npm workspaces with shared package `@smart-city/shared`.

## Services & Ports

| Service | Package | Port |
|---------|---------|------|
| API Gateway | `packages/api-gateway` | 3000 |
| Auth Service | `packages/auth-service` | 3001 |
| Complaint Service | `packages/complaint-service` | 3002 |
| AI Service | `packages/ai-service` | 3003 |
| Notification Service | `packages/notification-service` | 3004 |
| Analytics Service | `packages/analytics-service` | 3005 |
| Frontend (Vite) | `packages/frontend` | 5173 |
| PostgreSQL | docker | 5432 |
| Kafka | docker | 9092 |
| Ollama | docker | 11434 |
| Kafka UI | docker | 8080 |
| Mailhog (SMTP/UI) | docker | 1025/8025 |

## Kafka Event Flow

```
Complaint Created → complaint.created topic
    ↓
AI Service consumes → classifies (llama3) + embeds (nomic-embed-text) + duplicate detection (pgvector cosine >0.92)
    ↓
complaint.enriched topic → Notification Service sends email
    ↓
Status changes → complaint.status-changed topic → Notification Service
```

## Shared Package Exports (`@smart-city/shared`)

- **Types:** `User`, `AuthUser`, `Complaint`, `ComplaintEvent`, `KafkaEvent` variants
- **Kafka:** `publishEvent()`, `createConsumer()`, `TOPICS`
- **Middleware:** `authMiddleware`, `adminMiddleware`, `signToken()`, `validate()`, `validateQuery()`, `errorHandler`, `AppError`
- **DB:** `getPool()`, `closePool()`
- **Schemas (Zod):** `registerSchema`, `loginSchema`, `createComplaintSchema`, `updateStatusSchema`, `listComplaintsSchema`

## Database Schema

Database `smartcity` on PostgreSQL 16 with extensions `vector` and `uuid-ossp`. Migrations are plain SQL files in `packages/shared/src/db/migrations/`, run via `npm run migrate` (root). Custom runner tracks executed files in `_migrations` table.

### users
- `id` UUID PK, `name` VARCHAR(255), `email` VARCHAR(255) UNIQUE, `password_hash` VARCHAR(255)
- `role` VARCHAR(50) DEFAULT 'citizen' — values: citizen, admin, operator
- `created_at`, `updated_at` TIMESTAMPTZ

### complaints
- `id` UUID PK, `user_id` FK → users, `description` TEXT
- `category` VARCHAR(100) — NULL until AI classifies; values: roads, water_supply, electricity, sanitation, public_safety, parks, noise, other, unclassified
- `priority` VARCHAR(20) — NULL until AI classifies; values: low, medium, high, critical
- `status` VARCHAR(50) DEFAULT 'submitted' — values: submitted, classified, in_progress, resolved, closed, duplicate
- `summary` TEXT (AI-generated), `location_lat`/`location_lng` DOUBLE PRECISION, `address` TEXT
- `duplicate_of` UUID FK → complaints (self-ref), `ai_confidence` REAL
- `created_at`, `updated_at` TIMESTAMPTZ

### complaint_events
- `id` UUID PK, `complaint_id` FK → complaints, `event_type` VARCHAR(100)
- `actor_id` FK → users (nullable), `metadata` JSONB, `created_at` TIMESTAMPTZ

### complaint_embeddings
- `id` UUID PK, `complaint_id` FK → complaints UNIQUE, `embedding` vector(768)
- IVFFlat index with `vector_cosine_ops`, lists=100

### notifications
- `id` UUID PK, `user_id` FK → users, `complaint_id` FK → complaints
- `channel` VARCHAR(50), `subject` VARCHAR(500), `body` TEXT, `sent_at` TIMESTAMPTZ, `status` VARCHAR(50)

## API Endpoints

All proxied through API Gateway (port 3000). Frontend Vite proxy: `/api` → gateway.

### Auth Service (3001)
- `POST /api/auth/register` — `{ name, email, password }` → `{ user, token }`
- `POST /api/auth/login` — `{ email, password }` → `{ user, token }`
- `GET /api/auth/me` — Bearer JWT → user profile

### Complaint Service (3002)
- `POST /api/complaints` — Bearer, `{ description, location_lat?, location_lng?, address? }` → publishes `complaint.created`
- `GET /api/complaints` — Bearer, query: `?page=&limit=&status=&category=&priority=`
- `GET /api/complaints/:id` — Bearer, full detail
- `PATCH /api/complaints/:id/status` — Admin only, `{ status }` → publishes `complaint.status-changed`
- `GET /api/complaints/:id/timeline` — Bearer, events with actor names

### AI Service (3003)
- `POST /api/ai/ask` — Bearer, `{ question }` → RAG answer with sourceComplaintIds
- `POST /api/ai/similar` — Bearer, `{ text, limit? }` → similar complaint IDs with similarity scores
- Kafka consumer on `complaint.created` → classifies + embeds + duplicates → publishes `complaint.enriched`

### Analytics Service (3005)
- `GET /api/analytics/summary` — `{ total, byStatus, byPriority }`
- `GET /api/analytics/trends` — `?days=30` → `[{ date, count }]`
- `GET /api/analytics/category-breakdown` — `[{ category, count }]`

## AI Pipeline

Key files in `packages/ai-service/src/services/`:

- **ollama.service.ts** — HTTP client for Ollama (`/api/generate` with llama3, `/api/embeddings` with nomic-embed-text)
- **classifier.service.ts** — Structured prompt → JSON parse (with regex fallback) → validates against allowed categories/priorities. Fallback after 3 retries: `category="unclassified"`, `priority="medium"`, `confidence=0`
- **embedding.service.ts** — `pgvector.toSql()` for storage, cosine similarity `1 - (embedding <=> $1)`, duplicate threshold > 0.92
- **rag.service.ts** — Embed question → pgvector top-5 → augmented LLM prompt → answer with source IDs
- **consumers/complaint.consumer.ts** — Full pipeline: classify → embed → find duplicate → update DB → insert event → publish enriched

## Frontend

Stack: React 18, Vite 5, Tailwind CSS 3, TanStack Query 5, Zustand 5, React Router 6, Recharts 2, Axios

### Auth Flow
- Zustand store with `persist` middleware (`auth-storage` in localStorage)
- Axios interceptor: Bearer token on requests, 401 → auto-logout + redirect `/login`

### Routes
- `/login`, `/register` — public
- `/` — Dashboard (summary cards, PieChart categories, BarChart trends)
- `/complaints` — paginated table with status/category filters
- `/complaints/new` — submit form
- `/complaints/:id` — detail with timeline (polls every 5s for AI updates)
- `/ask` — RAG chat interface

### API Layer (`src/api/`)
- `client.ts` — Axios with auth interceptor
- `auth.ts`, `complaints.ts`, `ai.ts`, `analytics.ts`

## Infrastructure

### Docker Compose
- **postgres:** `pgvector/pgvector:pg16`, user postgres/postgres, DB smartcity, init script enables extensions
- **zookeeper:** `confluentinc/cp-zookeeper:7.5.0`
- **kafka:** `confluentinc/cp-kafka:7.5.0`, auto-create topics enabled
- **kafka-ui:** `provectuslabs/kafka-ui:latest`
- **ollama:** `ollama/ollama:latest`, volume `./ollama-data`
- **mailhog:** `mailhog/mailhog:latest`

### Environment Variables (`.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartcity
KAFKA_BROKERS=localhost:9092
OLLAMA_URL=http://localhost:11434
JWT_SECRET=your-dev-secret-change-in-prod
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Startup
1. `docker compose up -d`
2. `./scripts/pull-models.sh` — pull llama3 + nomic-embed-text
3. `npm run migrate`
4. `npm run dev` — all backend services
5. `npm run dev:frontend` — Vite dev server (separate terminal)

### Common Debug Points
- **Kafka not connecting:** check container health, `KAFKA_BROKERS` env
- **AI not classifying:** check Ollama running + models pulled (`docker exec smartcity-ollama ollama list`)
- **pgvector errors:** ensure `vector` extension created (`scripts/init-db.sql`)
- **Auth failures:** `JWT_SECRET` consistency across services (loaded from `../../.env`)
- **Email not sending:** Mailhog UI at `localhost:8025`, SMTP on port 1025
- **IVFFlat index on empty table:** normal for dev with <100 rows
