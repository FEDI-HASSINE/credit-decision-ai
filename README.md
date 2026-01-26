# Credit Decision AI

AI-assisted credit decision support with multi-agent analysis and human-in-the-loop review.

---

## Project Overview

Credit Decision AI helps bankers and credit analysts evaluate loan applications using multiple independent AI agents. Each agent focuses on a specific perspective (risk, similarity, policy rules, fraud signals), and their outputs are combined to support a transparent recommendation rather than an automatic decision. The final approval or rejection remains human-driven.

The system uses a backend API to orchestrate agents, persist their outputs, and present summaries to a banker-facing frontend. A vector database (Qdrant) provides similarity search on historical cases so analysts can compare the current request to comparable profiles and outcomes.

---

## Key Features

- Multi-agent credit analysis (risk, similarity, policy/rules, fraud/anomaly). *(Assumption / Planned for some agents)*
- Qdrant similarity search on historical cases and repayment patterns.
- Human-in-the-loop decision support with traceable signals.
- Explainability via structured summaries and agent outputs.
- Client history and repayment behavior usage. *(Assumption / Planned)*

---

## System Architecture

### High-level components

- **Frontend:** client and banker interfaces.
- **Backend (FastAPI):** request handling, orchestration, and persistence.
- **Multi-agent layer:** independent agents run in parallel and return separate results.
- **Database (PostgreSQL):** structured storage for cases, agent outputs, and decisions.
- **Vector database (Qdrant):** similarity search over embeddings.

### Architecture Diagram

```
┌────────────────────┐              ┌───────────────────┐
│  Client Frontend   │◄────────────►│   Backend API     │
│  (React/Vite)      │              │   (FastAPI)       │
└────────────────────┘              └─────────┬─────────┘
                                              │
                                              ▼
                                ┌─────────────────────────┐
                                │   Multi-Agent Layer     │
                                │  (independent agents)   │
                                └────────────┬────────────┘
                                             │
        ┌────────────────┬───────────────────┼───────────────────┬────────────────┐
        │                │                   │                   │                │
        ▼                ▼                   ▼                   ▼                ▼
  ┌──────────┐   ┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────┐
  │   Risk   │   │ Similarity  │   │ Rule/Policy  │   │    Fraud     │   │   Image    │
  │  Agent   │   │   Agent     │   │    Agent     │   │    Agent     │   │   Agent    │
  └─────┬────┘   └──────┬──────┘   └──────┬───────┘   └──────┬───────┘   └─────┬──────┘
        │               │                  │                  │                  │
        └───────────────┴──────────────────┴──────────────────┴──────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │   PostgreSQL                 │
                              │   (cases, history)           │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │   Qdrant Vector DB           │
                              └──────────────────────────────┘

Banker ──► Chat UI ──► Agents ──► Qdrant + Database (Assumption / Planned)
```

---

## Qdrant Integration

Qdrant is used to retrieve similar historical cases so analysts can compare a new application to past outcomes. The Similarity Agent builds embeddings from a credit profile summary and queries a Qdrant collection named `credit_dataset` using cosine similarity. The default embedding model is `all-MiniLM-L6-v2` (configurable via environment variables).

### Current usage

- Embedding of credit profile summaries.
- Qdrant collection: `credit_dataset`.
- Similarity search for top-k comparable cases.

### Possible future extensions *(Assumption / Planned)*

- Embeddings for repayment behavior summaries (late payments, defaults).
- Similarity search over client history and installment patterns.

---

## Data Flow / Pipeline

1. **Input:** client application data and documents.
2. **Cleaning:** validate numeric ranges and normalize categorical fields.
3. **Feature extraction:** structured features for rule-based checks.
4. **Embeddings:** transform profile summaries into vectors.
5. **Storage:** PostgreSQL for structured data, Qdrant for vectors.
6. **Agent inference:** independent agent scoring and explanations.
7. **Banker review:** human validation of AI signals and final decision.

---

## Multi-Agent Design

- **Risk Agent:** evaluates overall risk and debt ratios. *(Assumption / Planned)*
- **Similarity Agent (Qdrant):** retrieves comparable cases and statistics.
- **Rule / Policy Agent:** checks policy constraints and eligibility rules. *(Assumption / Planned)*
- **Fraud / Anomaly Agent:** flags suspicious patterns. *(Present / Planned depending on dataset)*

Agents run independently and their outputs are aggregated into a single recommendation for the banker.

---

## Banker Interaction

Bankers review the AI-generated summary, inspect similar past cases, and assess risk explanations. A chat-style interface can allow bankers to ask questions such as "Why was this rejected?" or "Show similar cases." *(Assumption / Planned)* The intent is to maximize explainability and transparency while keeping the final decision human-driven.

---

## Project Status & Roadmap

### Implemented / Available

- Backend API for credit requests and orchestration.
- Similarity Agent with Qdrant integration.
- PostgreSQL persistence for cases and agent outputs.

### In Progress

- Banker workspace enhancements.
- Extended similarity analytics.

### Planned

- Full policy/rule agent.
- Banker–agent chat interface.
- Client history and installment-level analytics.

---

## Repository Structure

```
├── backend/              FastAPI backend, agents, orchestration, tests
├── frontend/             React/Vite frontend
├── data/                 Synthetic datasets and SQL schema files
├── docker-compose.yml    Local multi-service setup
├── schema.sql            Database schema
└── seed_database.py      Optional database seeding script
```

---

## Technologies Used

- Python
- FastAPI
- Qdrant
- SentenceTransformers
- PostgreSQL
- React (Vite)
- LangChain / LangGraph
