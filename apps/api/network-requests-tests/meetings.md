# Tests API — Réunions (Meetings)

Ce fichier regroupe les requêtes `curl` pour tester la gestion des réunions (Cultes, Prières, Répétitions, Agapes, etc.).

> [!IMPORTANT]
> - Remplace `{churchId}` par l'ID réel de ton église.
> - Le type de réunion doit être l'un des suivants : `CULTE`, `TEMPS_DE_PRIERE`, `REPETITION`, `AGAPE`, `AUTRE`.

---

## 1. Créer une Réunion
Planifie et crée une nouvelle rencontre/réunion.

### Requête HTTP
`POST /api/v1/meetings`

### Commande curl (Exemple : Culte de Célébration)
```bash
curl -X POST http://localhost:3000/api/v1/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Culte de Célébration Dimanche",
    "description": "Grand culte hebdomadaire de la communauté",
    "type": "CULTE",
    "date": "2026-05-24T09:00:00.000Z",
    "location": "Temple Principal Calavi",
    "notes": "Prédicateur invité spécial.",
    "churchId": "{churchId}"
  }'
```

---

## 2. Récupérer toutes les Réunions d'une Église
Récupère la liste de toutes les réunions planifiées ou passées pour une église, triées de la plus récente à la plus ancienne.

### Requête HTTP
`GET /api/v1/meetings?churchId={churchId}`

### Commande curl
```bash
curl -X GET "http://localhost:3000/api/v1/meetings?churchId={churchId}" \
  -H "Content-Type: application/json"
```
