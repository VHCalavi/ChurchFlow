# Tests API — Formations (Formations)

Ce fichier regroupe les requêtes `curl` pour tester la gestion des formations et écoles au sein de l'église.

> [!IMPORTANT]
> - Remplace `{churchId}` par l'ID réel de ton église.
> - Le type de formation doit être l'un des suivants : `ACADEMIE`, `BAPTEME`, `PORTEURS_DE_VIE`, `ECOLE_DES_BERGERS`.

---

## 1. Créer une Formation
Enregistre un nouveau cursus de formation ou classe d'école.

### Requête HTTP
`POST /api/v1/formations`

### Commande curl (Exemple : Promotion Académie 2026)
```bash
curl -X POST http://localhost:3000/api/v1/formations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Académie des Leaders — Promo 2026",
    "description": "Cursus approfondi de formation des futurs bergers et responsables",
    "type": "ACADEMIE",
    "startDate": "2026-06-01T18:00:00.000Z",
    "endDate": "2026-12-15T20:00:00.000Z",
    "churchId": "{churchId}"
  }'
```

---

## 2. Récupérer toutes les Formations d'une Église
Récupère l'ensemble des formations disponibles ou passées avec le nombre de membres inscrits.

### Requête HTTP
`GET /api/v1/formations?churchId={churchId}`

### Commande curl
```bash
curl -X GET "http://localhost:3000/api/v1/formations?churchId={churchId}" \
  -H "Content-Type: application/json"
```
