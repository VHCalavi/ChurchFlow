# Tests API — Églises (Churches)

Ce fichier regroupe les requêtes `curl` pour tester la gestion des églises (système multi-tenant).

> [!IMPORTANT]
> - Pour récupérer les détails d'une église (`GET /api/v1/churches/{churchId}`), remplace `{churchId}` par un ID réel retourné lors de la création d'une église.

---

## 1. Créer une Église (Church)
Crée une nouvelle église dans la base de données.

### Requête HTTP
`POST /api/v1/churches`

### Commande curl (Exemple : Vases d'Honneur Calavi)
```bash
curl -X POST http://localhost:3000/api/v1/churches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vases d'\''Honneur Calavi",
    "description": "Église locale Vases d'\''Honneur à Abomey-Calavi",
    "address": "Abomey-Calavi, Bénin",
    "phone": "+22997000000",
    "email": "vasesdhonneurcalavi@gmail.com",
    "website": "https://vasesdhonneurcalavi.org"
  }'
```

---

## 2. Récupérer toutes les Églises
Récupère la liste de toutes les églises enregistrées dans la base de données, triées par ordre alphabétique.

### Requête HTTP
`GET /api/v1/churches`

### Commande curl
```bash
curl -X GET http://localhost:3000/api/v1/churches \
  -H "Content-Type: application/json"
```

---

## 3. Récupérer les Détails d'une Église
Récupère les détails d'une église spécifique par son ID (inclut les statistiques de membres, groupes, réunions, etc.).

### Requête HTTP
`GET /api/v1/churches/{churchId}`

### Commande curl
```bash
curl -X GET http://localhost:3000/api/v1/churches/{churchId} \
  -H "Content-Type: application/json"
```
