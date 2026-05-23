# Tests API — Santé de l'API (Health Check)

Ce fichier regroupe les requêtes `curl` pour vérifier l'état de l'API ChurchFlow.

## Base URL
Par défaut, en local, l'API tourne sur `http://localhost:3000`.

---

## 1. Vérifier la santé de l'API (Health Check)
Permet de s'assurer que le service API est en ligne et répond correctement.

### Requête HTTP
`GET /api/v1/health`

### Commande curl
```bash
curl -X GET http://localhost:3000/api/v1/health \
  -H "Content-Type: application/json"
```

### Réponse attendue (Succès - 200 OK)
```json
{
  "success": true,
  "status": "UP",
  "timestamp": "2026-05-21T22:30:00.000Z"
}
```
