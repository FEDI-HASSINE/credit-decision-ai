# Credit Decision AI

Assistant de décision crédit orienté multi‑agents. Le backend orchestre plusieurs agents (documents, comportement, similarité, fraude, image, explication), agrège leurs signaux et stocke les résultats dans PostgreSQL. Le frontend fournit un espace client + banquier pour piloter le dossier et garder l’humain dans la boucle.

## Objectif
Aider les analystes crédit avec des signaux structurés et explicables, sans automatiser la décision finale. La fraude est un signal parmi d’autres. La recommandation peut être rejouée, mais la décision finale appartient au banquier.

## Architecture (flux simplifié)
1. **Client** soumet une demande via `/api/client/credit-requests`.
2. **Orchestrateur** (`backend/core/orchestrator.py`) exécute les agents et produit :
   - un payload de décision (recommandation + raisons)
   - un bundle d’agents normalisé
   - un résumé lisible
3. **Persistence** : résultats enregistrés en base (`agent_outputs`, `credit_cases`, etc.).
4. **Banquier** consulte, discute avec un agent, commente, et enregistre la décision finale.

## Stack
- **Backend** : FastAPI, LangChain/LangGraph (optionnel), psycopg2, Qdrant client
- **Vector store** : Qdrant
- **Embeddings** : SentenceTransformers
- **Frontend** : React (Vite)
- **DB** : PostgreSQL

## Démarrage rapide (Docker)
```bash
docker-compose up --build
```
Services exposés :
- Backend : http://localhost:8000
- Qdrant : http://localhost:6333
- Frontend : http://localhost:4173

### Initialiser la base (obligatoire)
Le backend applique de petites migrations au démarrage, mais **les tables doivent exister**.

Depuis l’hôte :
```bash
psql postgresql://postgres:postgres@localhost:5432/credit -f data/sql/schema.sql
```

### (Optionnel) Seeding
```bash
DB_HOST=localhost DB_PORT=5432 DB_NAME=credit DB_USER=postgres DB_PASSWORD=postgres \
python seed_database.py
```

## Dev local (sans Docker)
Backend :
```bash
cd backend
DB_HOST=localhost DB_PORT=5432 DB_NAME=credit DB_USER=postgres DB_PASSWORD=postgres \
uvicorn main:app --reload
```

Frontend :
```bash
cd frontend
npm install
npm run dev
```

## Configuration (.env)
Le fichier `.env` n’est pas versionné. Crée un `.env` local si besoin.

Backend (principaux) :
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `QDRANT_URL`, `QDRANT_API_KEY`
- `EMBEDDING_MODEL` (ex: `sentence-transformers/all-MiniLM-L6-v2`)
- `TOP_K_SIMILAR`
- `SIMILARITY_DATASET_PATH` (ex: `/app/data/synthetic/credit_dataset.json`)
- `QDRANT_AUTO_LOAD` (0/1)
- `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL`

Frontend :
- `VITE_API_URL` (par défaut `/api`)
- `VITE_PROXY_TARGET` (défini dans docker-compose pour pointer le backend)

## Authentification (démo)
Login :
```
POST /api/auth/login
{ "email": "banker1@test.com", "password": "hashed-password" }
```
Le token renvoyé est obligatoire dans `Authorization: Bearer <token>`.

Comptes seedés (si tu as lancé `seed_database.py`) :
- `banker1@test.com` / `hashed-password`
- `client1@test.com` / `hashed-password` (et client2, client3, …)

## Endpoints principaux (résumé)
### Client
- `POST /api/client/credit-requests` : création d’un dossier (déclenche l’orchestrateur)
- `GET /api/client/credit-requests` : liste
- `GET /api/client/credit-requests/{id}` : détail

### Banquier
- `GET /api/banker/credit-requests?status=pending|decided`
- `GET /api/banker/credit-requests/{id}`
- `POST /api/banker/credit-requests/{id}/decision`
- `POST /api/banker/credit-requests/{id}/comments`
- `GET /api/banker/credit-requests/{id}/agent-chat/{agent}`
- `POST /api/banker/credit-requests/{id}/agent-chat`
- `POST /api/banker/credit-requests/{id}/rerun`

Note : le chat agent est stocké **en mémoire** (non persistant). Il est réinitialisé au redémarrage du backend.

## Exemple de création de dossier
```
POST /api/client/credit-requests
{
  "amount": 5000,
  "duration_months": 24,
  "monthly_income": 3000,
  "monthly_charges": 800,
  "employment_type": "employee",
  "contract_type": "CDI",
  "seniority_years": 5,
  "family_status": "single",
  "documents": ["salary.pdf", "contract.pdf"]
}
```

Réponse (extrait) :
```
{
  "id": "123",
  "status": "in_review",
  "summary": "Decision proposee: review | Raisons: aucun signal majeur",
  "agents": { ... },
  "decision": null
}
```

## Orchestrateur & agents
**Orchestrateur (`backend/core/orchestrator.py`)** :
- prépare le payload (documents + profil + telemetry)
- exécute les agents
- normalise flags + explications
- calcule `reason_codes` et `decision` (recommandation)
- produit un bundle compact affichable côté frontend

Remarque : la **décision** exposée par l’API (`decision`) correspond à la décision **humaine** enregistrée.  
La recommandation des agents alimente le `summary` et les `agents`, mais n’écrit pas la décision finale.

**Agents (sorties attendues)** :
- **Document** : `document_analysis` (flags, dds_score, consistency_level, explanations)
- **Behavior** : `behavior_analysis` (brs_score, behavior_flags, explanations)
- **Similarity** : `ai_analysis` + `rag_statistics` (Qdrant)
- **Fraud** : `fraud_analysis` (fraud_score, risk_level, explanations)
- **Image** : `image_analysis` (ifs_score, flags, explanations)
- **Explanation** : `customer_explanation` + `internal_explanation`

Tous les agents exposent un `confidence` pour faciliter l’agrégation.

## Qdrant / Similarité
Le Similarity Agent utilise Qdrant si configuré.  
Dataset : `data/synthetic/credit_dataset.json`.

Le script `data/synthetic/loadtoqdrant.py` contient des **identifiants hardcodés** : remplace‑les avant usage.

## Tests
Backend :
```bash
cd backend && pytest
```

Frontend (Playwright) :
```bash
cd frontend && npm run test:e2e
```

## Structure du projet
```
credit-decision-ai/
├── docker-compose.yml
├── backend/
│   ├── main.py
│   ├── api/            # routes + schemas
│   ├── core/           # orchestrateur + db
│   ├── agents/         # agents spécialisés
│   ├── rag/            # chunking/embedding/retrieval (RAG)
│   └── tests/
├── frontend/
│   ├── src/
│   └── tests/
└── data/
    ├── synthetic/
    └── sql/
```

## Règle d’équipe
Toute nouvelle dépendance Python doit être ajoutée dans `backend/requirements.txt` avant usage.
