# Credit Decision AI

AI-assisted credit decision support with multi-agent analysis and human-in-the-loop review.

---

## Project overview and objectives

This project provides a full-stack system for managing credit requests and supporting banker review workflows with AI-driven signals. It is built as a decision support tool (not an automated approval engine) and focuses on transparency, traceability, and reproducibility for reviewers and auditors.

Platform link (if applicable): Not publicly hosted; run locally (frontend at http://localhost:4173).

Objectives:
- Provide a simple client flow to create and track credit requests.
- Provide a banker flow to review cases, add decisions, and leave audit trail comments.
- Enrich decisions with multi-agent analysis (documents, similarity, fraud, behavior, explanation).
- Use vector similarity on historical cases to help assess risk and outcomes.
- Keep humans in the loop with clear summaries and status tracking.

---

## Technologies used (with versions)

Some backend dependencies are intentionally unpinned; use `backend/requirements.txt` for exact resolved versions in your environment.

Requirements / Dependencies:
- Backend: `backend/requirements.txt`
- Frontend: `frontend/package.json`
- UI/UX prototype (optional): `uiuxcredit2/package.json`

### Runtime and infrastructure

| Component | Version | Source |
| --- | --- | --- |
| Python | 3.11 | `backend/Dockerfile` |
| Node.js | 18 (alpine) | `frontend/Dockerfile` |
| PostgreSQL | 16 | `docker-compose.yml` |
| Qdrant | 1.9.1 | `docker-compose.yml` |
| Docker Compose | v2+ | local toolchain |

### Backend libraries

| Library | Version | Source |
| --- | --- | --- |
| FastAPI | unpinned | `backend/requirements.txt` |
| Uvicorn | unpinned | `backend/requirements.txt` |
| Pydantic | unpinned | `backend/requirements.txt` |
| qdrant-client | unpinned | `backend/requirements.txt` |
| sentence-transformers | unpinned | `backend/requirements.txt` |
| Torch | 2.3.1+cpu | `backend/requirements.txt` |
| LangChain | unpinned | `backend/requirements.txt` |
| LangGraph | unpinned | `backend/requirements.txt` |
| langchain-openai | unpinned | `backend/requirements.txt` |
| langchain-huggingface | unpinned | `backend/requirements.txt` |
| openai | >=1.0.0 | `backend/requirements.txt` |
| python-multipart | unpinned | `backend/requirements.txt` |
| psycopg2 | unpinned | `backend/requirements.txt` |
| PyPDF2 | unpinned | `backend/requirements.txt` |

### Frontend libraries

| Library | Version | Source |
| --- | --- | --- |
| React | 18.3.1 | `frontend/package.json` |
| React Router | 6.29.0 | `frontend/package.json` |
| TanStack React Query | 5.62.7 | `frontend/package.json` |
| Zustand | 4.5.4 | `frontend/package.json` |
| Vite | 6.0.3 | `frontend/package.json` |
| TypeScript | 5.6.3 | `frontend/package.json` |
| Playwright | 1.52.0 | `frontend/package.json` |

### Optional UI/UX prototype

| Library | Version | Source |
| --- | --- | --- |
| Vite | 6.3.5 | `uiuxcredit2/package.json` |
| React | 18.3.1 | `uiuxcredit2/package.json` |
| Radix UI (multiple packages) | ^1.x / ^2.x | `uiuxcredit2/package.json` |

---

## Architecture diagram

```
[Client Browser]
      |
      v
[Frontend (React/Vite)] ---- HTTP ----> [Backend (FastAPI)]
                                           |      |      \
                                           |      |       \
                                           |      |        +--> [LLM API (OpenAI compatible, optional)]
                                           |      +--> [Qdrant Vector DB]
                                           +--> [PostgreSQL]

Backend orchestrates multi-agent analysis and returns summaries and decisions.
```

---

## Project hierarchy / repository layout

```
credit-decision-ai/
├── backend/              FastAPI backend, agents, orchestration, tests
├── frontend/             React/Vite app (client + banker flows)
├── uiuxcredit2/          UI/UX prototype bundle (standalone Vite app)
├── data/                 Synthetic datasets + sample docs
├── data/sql/schema.sql   Minimal base schema
├── migrations/           SQL migrations
├── docker-compose.yml    Local multi-service setup
├── schema.sql            Full schema (optional)
└── seed_database.py      Optional database seeding script
```

---

## UI/UX prototype (optional)

The `uiuxcredit2` folder is a standalone Vite app for UI/UX exploration.

```
cd uiuxcredit2
npm install
npm run dev
```

---

## Qdrant integration (detailed)

Qdrant provides similarity search for historical credit cases. It is used by the Similarity agent and updated continuously from Postgres.

Key parts of the integration:

1) Configuration (environment variables)
- `QDRANT_URL` and optional `QDRANT_API_KEY` configure the client.
- `QDRANT_COLLECTION_NAME` defaults to `credit_dataset`.
- `EMBEDDING_MODEL` defaults to `sentence-transformers/all-MiniLM-L6-v2` (set explicitly to avoid module-specific defaults).
- `QDRANT_AUTO_LOAD=1` enables auto-loading of the synthetic dataset on startup.
- `SIMILARITY_DATASET_PATH` points to `data/synthetic/credit_dataset.json` (or custom path).

2) Sync pipeline (Postgres -> Qdrant)
- `backend/services/vector_sync.py` defines `sync_credit_case_to_qdrant(case_id)`.
- It fetches a full case from Postgres, builds two textual views:
  - a profile summary (loan, income, employment, household),
  - a payment behavior summary (on-time rate, late/missed, etc).
- It embeds those texts with `HuggingFaceEmbeddings` and upserts to Qdrant.
- The point stores two vectors: `profile` and `payment` plus a rich payload.
- Sync is best-effort: timeouts and failures do not break API requests.

3) Sync triggers
- API routes schedule Qdrant sync in background tasks after create/resubmit/decision events.
- This keeps Qdrant aligned with the source of truth in Postgres.

4) Similarity search in the agent layer
- `backend/agents/similarity_agent.py` initializes a Qdrant client and embedding model.
- It ensures the collection exists and can auto-load the dataset if empty.
- During analysis, it queries Qdrant for similar historical cases and aggregates stats.

5) Dataset loader (optional)
- `data/synthetic/loadtoqdrant.py` can build a fresh collection and bulk-load the dataset.
- It creates payload indexes and inserts vectorized points in batches.

---

## Similarity agent: Qdrant search flow (profile, payment, hybrid)

The Similarity agent uses a multi-vector collection with two named vectors:
- `profile`: embedding of the applicant profile text (loan + income + household + employment).
- `payment`: embedding of a payment behavior summary (late/missed, on-time rate, etc) when available.

Technical flow:
1) Build two texts (profile and payment summary), then embed with `HuggingFaceEmbeddings`.
2) Query Qdrant with `query_points(..., using="<vector_name>")`, `limit=TOP_K_SIMILAR`, `with_payload=True`.
3) Return Qdrant payloads as "similar cases", then compute aggregate stats.

Hybrid (profile + payment) search is implemented in the app (not inside Qdrant):
- If `vector_type` is `hybrid`, `profile+payment`, or `profile_payment`, the agent runs two separate vector queries:
  - `using="profile"` with the profile vector
  - `using="payment"` with the payment vector
- Results are merged by `case_id` and a weighted score sum is computed.
  - Weights come from `profile_weight` and `payment_weight` (defaults 0.6 / 0.4).
- If the payment vector is missing, it falls back to profile-only search.

Notes:
- This is vector-only similarity; there is no BM25 or text+vector "hybrid" in Qdrant here.
- The collection uses COSINE distance and HNSW defaults (m=16, ef_construct=128) when created.
- Qdrant calls use timeouts/retries (`QDRANT_TIMEOUT_SEC`, `QDRANT_RETRY_COUNT`) and fall back to `search()` for older client versions.
- If Qdrant or embeddings are unavailable, the agent falls back to a local similarity function over the synthetic dataset.

Hybrid search diagram:
```
profile_text  -> embed -> profile_vector ----\
                                               \--> Qdrant query (using="profile") -> topK_profile
payment_text  -> embed -> payment_vector ----/ \--> Qdrant query (using="payment") -> topK_payment

merge by case_id
score = profile_weight*score_profile + payment_weight*score_payment
sort desc -> top K similar cases
```

---

## Setup and installation instructions (for reviewers)

These steps allow a fresh clone to run locally and reproduce results.

### Option A: Docker Compose (recommended)

1) Create env file (minimal defaults)
```
cp .env.example .env
```
Edit `.env` if you need to override defaults (see Configuration).

2) Start services
```
docker compose up --build
```

3) Initialize database schema (first run only, choose one)

- Base schema + migrations (recommended):
```
docker compose exec -T postgres psql -U postgres -d credit < data/sql/schema.sql
for f in migrations/*.sql; do
  docker compose exec -T postgres psql -U postgres -d credit < "$f"
done
```

- Full schema (quickstart, no migrations):
```
docker compose exec -T postgres psql -U postgres -d credit < schema.sql
```

4) (Optional) Seed the database
```
DB_HOST=localhost DB_PORT=5432 DB_NAME=credit DB_USER=postgres DB_PASSWORD=postgres \
  python seed_database.py
```

5) (Optional) Load synthetic dataset into Qdrant
```
docker compose exec backend python /app/data/synthetic/loadtoqdrant.py
```

Ports:
- Backend: http://localhost:8000 (docs: /docs)
- Frontend: http://localhost:4173
- Qdrant: http://localhost:6333
- Postgres: localhost:5432

### Option B: Local development (no Docker)

Prerequisites:
- Python 3.11, Node 18, PostgreSQL 16, Qdrant 1.9.1

Backend:
```
export DB_HOST=localhost DB_PORT=5432 DB_NAME=credit DB_USER=postgres DB_PASSWORD=postgres
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (Playwright requires browser install once per machine):
```
cd frontend
npm install
npm run dev
```

Qdrant (example):
```
docker run -p 6333:6333 qdrant/qdrant:v1.9.1
```

---

## Usage examples

All APIs are prefixed with `/api`.

### Register and login

Passwords must be at least 6 characters.

```
# Register a new client
curl -X POST http://localhost:8000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"client2@test.com","password":"password123"}'

# Login (seeded demo users)
# client1@test.com / hashed-password (literal seed value)
# banker1@test.com / hashed-password (literal seed value)
curl -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"client1@test.com","password":"hashed-password"}'
```

### Create a credit request

```
# Replace TOKEN with the login response token
curl -X POST http://localhost:8000/api/client/credit-requests \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 12000,
    "duration_months": 36,
    "monthly_income": 2500,
    "monthly_charges": 900,
    "employment_type": "employee",
    "contract_type": "permanent",
    "seniority_years": 3,
    "family_status": "single"
  }'
```

### Upload documents

```
curl -X POST http://localhost:8000/api/client/credit-requests/upload \
  -H 'Authorization: Bearer TOKEN' \
  -F 'payload={"amount":12000,"duration_months":36,"monthly_income":2500,"monthly_charges":900,"employment_type":"employee","contract_type":"permanent","seniority_years":3,"family_status":"single"}' \
  -F 'files=@data/sample_docs/sample.pdf'
```

### List and view client requests

```
curl -H 'Authorization: Bearer TOKEN' \
  http://localhost:8000/api/client/credit-requests

curl -H 'Authorization: Bearer TOKEN' \
  http://localhost:8000/api/client/credit-requests/1
```

### Banker decision

```
curl -X POST http://localhost:8000/api/banker/credit-requests/1/decision \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"decision":"approve","note":"Stable income and low debt ratio"}'
```

Sample documents are available in `data/sample_docs/`.

---

## Configuration

Main environment variables (see `.env.example`):

LLM / agents:
- `OPENAI_API_KEY`: enables LLM-backed agents (optional).
- `OPENAI_BASE_URL`: OpenAI-compatible endpoint (default `https://api.groq.com/openai/v1`).
- `LLM_MODEL`: default `llama-3.3-70b-versatile`.
- `DECISION_LLM_MODEL`: default `llama-3.1-8b-instant` (falls back to `LLM_MODEL` if set).
- `DECISION_LLM_FALLBACK_MODEL`: default `llama-3.1-8b-instant`.
- `DECISION_LLM_MAX_OUTPUT_TOKENS`: default `300`.

Qdrant / similarity:
- `QDRANT_URL`: default `http://localhost:6333`.
- `QDRANT_API_KEY`: optional.
- `QDRANT_COLLECTION_NAME`: default `credit_dataset`.
- `QDRANT_AUTO_LOAD`: set to `1` to auto-load dataset into Qdrant on startup.
- `SIMILARITY_DATASET_PATH`: optional path to `data/synthetic/credit_dataset.json`.
- `EMBEDDING_MODEL`: default `sentence-transformers/all-MiniLM-L6-v2`.
- `TOP_K_SIMILAR`: number of similar cases returned (set explicitly; defaults differ across modules).
- `QDRANT_TIMEOUT_SEC`: request timeout in seconds (default `2.5`).
- `QDRANT_RETRY_COUNT`: retry count for Qdrant operations (default `2`).

Database:
- `DB_HOST` (default `postgres`), `DB_PORT` (default `5432`), `DB_NAME` (default `credit`),
  `DB_USER` (default `postgres`), `DB_PASSWORD` (default `postgres`).

Uploads:
- `UPLOAD_DIR`: where uploaded documents are stored (default `/app/data/uploads`).

Frontend (dev):
- `VITE_PROXY_TARGET`: backend proxy target for Vite (default `http://localhost:8000`).

---

## Multi-agent design

Agents run independently and return structured outputs that are aggregated into a recommendation:

- Document agent: extracts signals from uploaded documents (LLM optional).
- Similarity agent: compares the case to historical profiles using Qdrant.
- Behavior agent: evaluates payment behavior signals (LLM optional).
- Fraud agent: flags anomalies (LLM optional).
- Decision + Explanation agents: consolidate signals into a recommendation and explanation.
- Image agent: stub heuristics for document quality (no real CV yet).

If `OPENAI_API_KEY` is not provided, agents fall back to heuristic or stub behavior.

---

## Testing

Backend:
```
cd backend
pytest
```

Frontend:
```
cd frontend
npm install
npx playwright install --with-deps
npm run test:e2e
```

---

## Notes

- This project is a decision-support system, not an automated approval engine.
- Authentication is demo-only: passwords are stored as plain strings and tokens are not JWTs. Do not use as-is in production.
- Some agents are still heuristic or partial implementations.
- Use in production requires additional validation, compliance, and security hardening.
