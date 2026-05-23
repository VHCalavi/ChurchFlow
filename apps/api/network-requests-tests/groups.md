# Tests API — Groupes (Groups)

Ce fichier regroupe les requêtes `curl` pour tester la gestion des groupes (Départements, Tribus et GEM/familles d'impact).

> [!IMPORTANT]
> - Remplace `{churchId}` par l'ID réel de ton église.
> - Un groupe de type `GEM` (famille d'impact) **doit obligatoirement avoir un groupe parent** de type `DEPARTEMENT` ou `TRIBU`.
> - Pour modifier (`PUT`) ou supprimer (`DELETE`), remplace `{groupId}` par l'ID d'un groupe existant.

---

## 1. Créer un Département ou une Tribu (Groupe Parent)
Crée un groupe principal sans parent.

### Requête HTTP
`POST /api/v1/groups`

### Commande curl (Exemple : Département Accueil)
```bash
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Département Accueil & Protocole",
    "description": "Responsable de la logistique d'\''accueil des fidèles et invités",
    "type": "DEPARTEMENT",
    "churchId": "{churchId}"
  }'
```

---

## 2. Créer un GEM / Famille d'impact (Groupe Enfant)
Crée un sous-groupe rattaché à un Département ou une Tribu.

> [!NOTE]
> Remplace `{parentGroupId}` par l'ID du groupe créé à l'étape précédente.

### Requête HTTP
`POST /api/v1/groups`

### Commande curl
```bash
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GEM Calavi Nord",
    "description": "Famille d'\''impact de la zone Nord de Calavi",
    "type": "GEM",
    "parentId": "{parentGroupId}",
    "churchId": "{churchId}"
  }'
```

---

## 3. Récupérer tous les Groupes d'une Église
Récupère la liste des groupes associés à une église (inclut les relations parents/enfants et le nombre de membres).

### Requête HTTP
`GET /api/v1/groups?churchId={churchId}`

### Commande curl
```bash
curl -X GET "http://localhost:3000/api/v1/groups?churchId={churchId}" \
  -H "Content-Type: application/json"
```

---

## 4. Récupérer les Détails d'un Groupe
Récupère les détails d'un groupe spécifique avec ses sous-groupes, son parent, et la liste des membres affiliés.

### Requête HTTP
`GET /api/v1/groups/{groupId}`

### Commande curl
```bash
curl -X GET http://localhost:3000/api/v1/groups/{groupId} \
  -H "Content-Type: application/json"
```

---

## 5. Mettre à Jour un Groupe
Modifie les informations d'un groupe existant.

### Requête HTTP
`PUT /api/v1/groups/{groupId}`

### Commande curl (Exemple : Modification du nom et description)
```bash
curl -X PUT http://localhost:3000/api/v1/groups/{groupId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Département Accueil & Connexion",
    "description": "Nouveau rôle élargi à la fidélisation des nouveaux venus."
  }'
```

---

## 6. Supprimer un Groupe
Supprime définitivement un groupe.

> [!WARNING]
> Impossible de supprimer un groupe si des sous-groupes y sont rattachés (protection d'intégrité). Il faut d'abord supprimer ou détacher ses enfants (les GEM).

### Requête HTTP
`DELETE /api/v1/groups/{groupId}`

### Commande curl
```bash
curl -X DELETE http://localhost:3000/api/v1/groups/{groupId} \
  -H "Content-Type: application/json"
```
