# backend

Contient l’API FastAPI et la logique métier.

- Ce qu’il fait: reçoit des requêtes, orchestre les agents, renvoie une décision expliquée.
- Exemple simple:
  - Requête: POST /api/client/credit-requests avec un profil (revenus, montant demandé, documents).
  - Résultat attendu: JSON avec une recommandation (approve/review/reject) et une explication.

Structure:
- api/: endpoints et schémas
- core/: orchestrateur
- agents/: rôles spécialisés (stubs)
- rag/: préparation mémoire/similarité
- vector_db/: connexion Qdrant
