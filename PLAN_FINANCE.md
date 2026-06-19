# Plan d'Implémentation — Module Finance ChurchFlow

> Ce fichier est le plan de travail suivi pas à pas. Chaque tâche est cochée dès qu'elle est implémentée et testée.

---

## Contexte & Analyse des Besoins

### Ce qui existe déjà
- Modèle `Transaction` Prisma basique (type ENTREE/SORTIE, catégorie plate sans hiérarchie)
- Page `apps/admin/app/dashboard/finances/page.tsx` : UI en maquette avec overlay "En construction", données mock, **zéro appel API**
- Aucune route API `/api/v1/finances/` n'existe

### Besoins collectés

#### Entrées
| Catégorie | Description |
|---|---|
| Offrandes | Offrande du culte principal |
| Dîmes | Dîme des membres |
| Dons | Dons libres, actions de grâce |
| Collectes enfants | Collectes spécifiques département enfants |
| Autres entrées | Tout autre flux entrant |

#### Sorties — 3 grandes familles + sous-catégories

| Famille | Code | Exemples de sous-catégories |
|---|---|---|
| Dépenses de Fonctionnement | FONCTIONNEMENT | Électricité, Frais de loge, Internet, Eau, Fournitures de bureau, Entretien |
| Dépenses d'Investissement | INVESTISSEMENT | Matériel sono, Instruments, Mobilier, Équipements informatiques, Travaux immobiliers |
| Dépenses Exceptionnelles | EXCEPTIONNEL | Campagne CJSA, Séminaires, Conventions, Voyages pastoraux, Événements spéciaux |

#### Exigences fonctionnelles clés
1. **Saisie rapide** : libellé libre + sélection catégorie/sous-catégorie en cascade
2. **Catégorisation flexible** : sous-catégories paramétrables (pas figées en dur)
3. **Dashboard financier** : solde, entrées du mois, sorties par famille
4. **Historique filtrable** : par type, famille, sous-catégorie, période, mode de paiement
5. **Multi-tenant** : toutes les données filtrées par `churchId`

---

## Architecture Technique

```
Prisma schema (packages/database)
  └── Transaction (étendu)
  └── FinanceCategory (nouveau — sous-catégories paramétrables)

API (apps/api/app/api/v1/finances/)
  ├── transactions/route.ts       GET list + POST create
  ├── transactions/[id]/route.ts  GET detail + PUT update + DELETE
  ├── categories/route.ts         GET list + POST create
  └── categories/[id]/route.ts    PUT update + DELETE

Admin UI (apps/admin/app/dashboard/finances/)
  └── page.tsx   (refonte complète — suppression overlay + connexion API réelle)
```

---

## Plan d'Implémentation

### PHASE 1 — Base de données

- [x] **1.1** Étendre l'enum `TransactionCategory` : ajouter `DIXIME`, `COLLECTE_ENFANTS`, retirer les doublons
- [x] **1.2** Ajouter l'enum `ExpenseFamily` : `FONCTIONNEMENT | INVESTISSEMENT | EXCEPTIONNEL`
- [x] **1.3** Créer le modèle `FinanceCategory` (sous-catégories paramétrables)
  - champs : `id`, `name`, `family` (ExpenseFamily?), `flowType` (ENTREE/SORTIE), `churchId`, `isDefault`, `color`
- [x] **1.4** Modifier le modèle `Transaction`
  - ajouter `expenseFamily` (ExpenseFamily?) — null pour les entrées
  - ajouter `categoryId` (FK vers FinanceCategory)
  - ajouter `paymentMethod` (ESPECES | MOBILE_MONEY | CHEQUE | VIREMENT)
  - renommer `title` → `label` (libellé de l'opération)
  - ajouter `donorName` (String?) — pour les entrées avec donateur identifié
- [x] **1.5** Générer et appliquer la migration Prisma
- [x] **1.6** Seed des catégories par défaut (entrées + 3 familles de dépenses avec sous-catégories)

### PHASE 2 — API Backend

- [x] **2.1** Route `GET /api/v1/finances/categories`
  - Retourne toutes les catégories de la church (entrées + sorties groupées par famille)
- [x] **2.2** Route `POST /api/v1/finances/categories`
  - Crée une nouvelle sous-catégorie pour la church
- [x] **2.3** Route `PUT /api/v1/finances/categories/[id]`
- [x] **2.4** Route `DELETE /api/v1/finances/categories/[id]`
- [x] **2.5** Route `GET /api/v1/finances/transactions`
  - Filtres : `type`, `expenseFamily`, `categoryId`, `from`, `to`, `paymentMethod`, `search`
  - Pagination : `page`, `limit`
  - Agrégats dans la réponse : `totalEntrees`, `totalSorties`, `solde`
- [x] **2.6** Route `POST /api/v1/finances/transactions`
  - Validation Zod complète
  - Retourne `{ success, data, message }`
- [x] **2.7** Route `GET /api/v1/finances/transactions/[id]`
- [x] **2.8** Route `PUT /api/v1/finances/transactions/[id]`
- [x] **2.9** Route `DELETE /api/v1/finances/transactions/[id]`
- [x] **2.10** Route `GET /api/v1/finances/dashboard`
  - KPIs agrégés : solde, entrées mois en cours, sorties par famille, évolution sur 6 mois

### PHASE 3 — UI Admin

- [x] **3.1** Supprimer l'overlay "En construction" et le blur de la page finances
- [x] **3.2** KPI cards (solde, entrées mois, sorties fonctionnement, investissement, exceptionnel)
- [x] **3.3** Graphique — évolution mensuelle entrées vs sorties (barre ou courbe, 6 mois)
- [x] **3.4** Tableau des transactions avec filtres (type, famille, période, mode paiement)
- [x] **3.5** Modal "Nouvelle transaction" avec :
  - Libellé (champ texte libre)
  - Flux : Entrée / Sortie (radio/toggle)
  - Si Entrée → sélect catégorie d'entrée (Offrande, Dîme, Don, etc.)
  - Si Sortie → sélect famille (Fonctionnement / Investissement / Exceptionnel) PUIS sélect sous-catégorie filtrée
  - Montant, date, mode de paiement
  - Donateur (optionnel, pour les entrées)
  - Notes libres
- [x] **3.6** Modal "Éditer transaction" (pré-remplie)
- [x] **3.7** Confirmation de suppression
- [x] **3.8** Toast de feedback (succès / erreur)
- [x] **3.9** Gestion des catégories (panneau ou page dédiée)
  - Liste des catégories par famille
  - Ajouter / renommer / supprimer une sous-catégorie

### PHASE 4 — Qualité & Polish

- [ ] **4.1** Types partagés ajoutés dans `packages/types/src/index.ts`
  - `Transaction`, `FinanceCategory`, `ExpenseFamily`, `PaymentMethod`
- [ ] **4.2** Validation Zod côté API complète sur tous les endpoints
- [ ] **4.3** Responsive mobile pour la page finances
- [ ] **4.4** Tests manuels des flux critiques (entrée offrande, dépense fonctionnement, suppression)
- [ ] **4.5** Mise à jour de `STRUCTURE_API.md` avec les nouvelles routes finance

---

## Catégories par Défaut (seed)

### Entrées
- Offrande
- Dîme
- Don / Action de grâce
- Collecte enfants
- Autre entrée

### Sorties — Fonctionnement
- Électricité
- Eau
- Internet / Téléphone
- Frais de loge / Location salle
- Entretien & Nettoyage
- Fournitures de bureau
- Transport
- Autre fonctionnement

### Sorties — Investissement
- Matériel sono & audiovisuel
- Instruments de musique
- Mobilier & Équipements
- Équipements informatiques
- Travaux & Aménagements
- Autre investissement

### Sorties — Exceptionnel
- Campagne CJSA
- Séminaire
- Convention / Conférence
- Voyage pastoral
- Événement spécial
- Autre exceptionnel

---

## Règles Métier à Respecter

1. `expenseFamily` est obligatoire si `type = SORTIE`, nul si `type = ENTREE`
2. `categoryId` doit appartenir à la même `churchId` que la transaction
3. Les catégories `isDefault = true` ne peuvent pas être supprimées, seulement désactivées
4. Toutes les routes filtrent par `churchId` extrait de la session (jamais du body client)
5. Montants en centimes (Int) dans la DB, affichés en F CFA avec `toLocaleString("fr-FR")`
6. La réponse `GET /finances/transactions` calcule `solde = totalEntrees - totalSorties` côté serveur

---

## Charte Visuelle Finance (VH Calavi)

| Élément | Style |
|---|---|
| Entrée (badge) | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| Sortie Fonctionnement (badge) | `bg-orange-50 text-orange-700 border-orange-200` |
| Sortie Investissement (badge) | `bg-blue-50 text-blue-700 border-blue-200` |
| Sortie Exceptionnel (badge) | `bg-purple-50 text-purple-700 border-purple-200` |
| Montant positif | `text-emerald-700` avec préfixe `+` |
| Montant négatif | `text-red-600` avec préfixe `-` |
| CTA principal | `bg-[#006C69]` (Vert VH) |
| KPI Solde | icône Wallet, fond primary/5 |
