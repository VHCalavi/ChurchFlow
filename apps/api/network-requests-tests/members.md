# Tests API — Membres (Members)

Ce fichier regroupe les requêtes `curl` pour tester la gestion des membres de l'église.

> [!IMPORTANT]
> - Remplace `{churchId}` par l'ID réel de ton église (ex. à récupérer dans Prisma Studio ou via la base de données).
> - Les grades et échelons **ne s'appliquent qu'aux membres ayant le statut `RESPONSABLE`**.
> - Pour modifier (`PUT`) ou supprimer (`DELETE`), remplace `{memberId}` par l'ID d'un membre existant.

---

## 1. Créer un Membre Sympathisant
Crée un nouveau membre simple sans responsabilité.

### Requête HTTP
`POST /api/v1/members`

### Commande curl
```bash
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "gender": "HOMME",
    "birthDate": "1995-08-12",
    "phone": "+22997000000",
    "email": "jean.dupont@email.com",
    "address": "Calavi, Quartier Arconville",
    "status": "SYMPATHISANT",
    "churchId": "{churchId}",
    "notes": "Nouveau sympathisant intéressé par les cultes du dimanche."
  }'
```

---

## 2. Créer un Responsable (avec Grade et Échelon)
Crée un membre responsable. Les champs `grade` et `echelon` sont requis dans ce cas.

### Requête HTTP
`POST /api/v1/members`

### Commande curl
```bash
curl -X POST http://localhost:3000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Sessou",
    "gender": "FEMME",
    "birthDate": "1988-04-25",
    "phone": "+22996112233",
    "email": "marie.sessou@email.com",
    "address": "Calavi, Centre-ville",
    "status": "RESPONSABLE",
    "grade": "SERVITEUR",
    "echelon": "C10",
    "churchId": "{churchId}",
    "notes": "Responsable engagée, supervise 10 personnes."
  }'
```

---

## 3. Récupérer la Liste des Membres d'une Église
Récupère tous les membres rattachés à une église spécifique.

### Requête HTTP
`GET /api/v1/members?churchId={churchId}`

### Commande curl
```bash
curl -X GET "http://localhost:3000/api/v1/members?churchId={churchId}" \
  -H "Content-Type: application/json"
```

---

## 4. Récupérer les Détails d'un Membre
Récupère un membre spécifique via son ID avec ses informations hiérarchiques et ses affiliations.

### Requête HTTP
`GET /api/v1/members/{memberId}`

### Commande curl
```bash
curl -X GET http://localhost:3000/api/v1/members/{memberId} \
  -H "Content-Type: application/json"
```

---

## 5. Mettre à Jour un Membre
Met à jour les informations d'un membre existant.

### Requête HTTP
`PUT /api/v1/members/{memberId}`

### Commande curl (Exemple : Promotion en responsable)
```bash
curl -X PUT http://localhost:3000/api/v1/members/{memberId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESPONSABLE",
    "grade": "GAGNEUR_AMES",
    "echelon": "C5",
    "phone": "+22997999999",
    "notes": "Promu Gagneur d'\''âmes avec échelon C5."
  }'
```

---

## 6. Supprimer un Membre
Supprime définitivement un membre de la base de données.

### Requête HTTP
`DELETE /api/v1/members/{memberId}`

### Commande curl
```bash
curl -X DELETE http://localhost:3000/api/v1/members/{memberId} \
  -H "Content-Type: application/json"
```
