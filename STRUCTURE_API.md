# ChurchFlow — Structure API (`apps/api`)

> **Rôle** : Backend unique et source de vérité pour toutes les données. Aucun frontend n'accède directement à la base de données. Toute consommation de données passe par ces routes.

---

## Localisation dans le monorepo

```
apps/api/
├── app/
│   ├── api/
│   │   └── v1/                   ← TOUTES les routes sont sous /api/v1/
│   │       ├── health/
│   │       │   └── route.ts      → GET /api/v1/health
│   │       ├── churches/
│   │       │   ├── route.ts      → GET /api/v1/churches  |  POST /api/v1/churches
│   │       │   └── [id]/
│   │       │       └── route.ts  → GET /api/v1/churches/:id
│   │       ├── members/
│   │       │   ├── route.ts      → GET /api/v1/members  |  POST /api/v1/members
│   │       │   └── [id]/
│   │       │       └── route.ts  → GET /api/v1/members/:id  |  PUT  |  DELETE
│   │       ├── groups/
│   │       │   ├── route.ts      → GET /api/v1/groups  |  POST
│   │       │   └── [id]/
│   │       │       └── route.ts  → GET /api/v1/groups/:id  |  PUT  |  DELETE
│   │       ├── meetings/
│   │       │   └── route.ts      → GET /api/v1/meetings  |  POST
│   │       └── formations/
│   │           └── route.ts      → GET /api/v1/formations  |  POST
│   ├── layout.tsx
│   └── page.tsx                  → Page d'accueil de l'API (documentation minimale)
├── next.config.mjs
├── package.json                  → @churchflow/api
└── vercel.json
```

---

## Convention de routing — Règle stricte

| Pattern                   | Méthodes             | Usage                               |
| ------------------------- | -------------------- | ----------------------------------- |
| `/api/v1/{resource}`      | `GET` `POST`         | Liste paginée + Création            |
| `/api/v1/{resource}/[id]` | `GET` `PUT` `DELETE` | Détail + Modification + Suppression |

- **Versionnement obligatoire** : toujours `/api/v1/`. Quand une v2 sera nécessaire, créer `/api/v2/` sans casser `/api/v1/`.
- **Nommage des ressources** : pluriel, kebab-case (`members`, `meeting-attendees`).

---

## Structure d'une route — Patron à suivre

```typescript
// apps/api/app/api/v1/{resource}/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

// 1. Schéma de validation Zod (toujours en haut du fichier)
const createResourceSchema = z.object({
  // ...champs
  churchId: z.string().min(1), // TOUJOURS présent
});

// 2. GET — Liste filtrée par churchId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const churchId = searchParams.get("churchId");

  if (!churchId) {
    return NextResponse.json(
      { success: false, error: "churchId requis" },
      { status: 400 },
    );
  }

  const items = await prisma.resource.findMany({
    where: { churchId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: items });
}

// 3. POST — Création
export async function POST(request: Request) {
  const body = await request.json();
  const result = createResourceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error.errors.map((e) => e.message).join(", "),
      },
      { status: 400 },
    );
  }

  const item = await prisma.resource.create({ data: result.data });
  return NextResponse.json({ success: true, data: item }, { status: 201 });
}
```

---

## Format de réponse — Toujours respecter

```typescript
// Succès simple
{ success: true, data: T }

// Succès paginé
{
  success: true,
  data: T[],
  pagination: { total: number, page: number, pageSize: number, hasMore: boolean }
}

// Erreur
{ success: false, error: string }

// Message sans data
{ success: true, message: string }
```

Ces interfaces sont définies dans `packages/types/src/index.ts` : `ApiResponse<T>` et `PaginatedResponse<T>`.

---

## Routes existantes

### `GET /api/v1/health`

Vérification que l'API est en ligne.

### `GET /api/v1/churches`

Retourne la liste de toutes les églises enregistrées (ordre alphabétique).

### `POST /api/v1/churches`

Crée une nouvelle église (système multi-tenant).

### `GET /api/v1/churches/[id]`

Retourne les détails d'une église par son ID (inclut les statistiques globales de ses membres, groupes, réunions...).

### `GET /api/v1/members?churchId=`

Retourne tous les membres d'une église avec leur superviseur (select partiel).

### `POST /api/v1/members`

Crée un membre. Validation hiérarchique :

- Si `status !== "RESPONSABLE"` → `grade` et `echelon` interdits.
- Si `status === "RESPONSABLE"` → `grade` et `echelon` obligatoires.

### `GET /api/v1/members/[id]`

Retourne un membre par ID.

### `GET /api/v1/groups?churchId=`

Retourne tous les groupes. Types : `DEPARTEMENT`, `TRIBU`, `GEM`.

### `POST /api/v1/groups`

Crée un groupe. Un `GEM` doit avoir un `parentId` (Département ou Tribu).

### `GET /api/v1/meetings?churchId=`

Retourne toutes les réunions.

### `POST /api/v1/meetings`

Crée une réunion.

### `GET /api/v1/formations?churchId=`

Retourne toutes les formations.

### `GET /api/v1/formations`

Crée une formation. Types : `ACADEMIE`, `BAPTEME`, `PORTEURS_DE_VIE`, `ECOLE_DES_BERGERS`.

### `GET /api/v1/finances/dashboard`

Retourne les indicateurs clés (solde, entrées/sorties) et l'évolution sur 6 mois pour le module financier.

### `GET /api/v1/finances/categories` | `POST` | `PUT /[id]` | `DELETE /[id]`

Gère les catégories financières et les familles de dépenses.

### `GET /api/v1/finances/transactions` | `POST` | `PUT /[id]` | `DELETE /[id]`

Gère les transactions financières (entrées/sorties) avec filtres avancés.

---

## Routes à créer (roadmap)

| Route                                   | Priorité |
| --------------------------------------- | -------- |
| `/api/v1/members/[id]` PUT + DELETE     | Haute    |
| `/api/v1/groups/[id]` PUT + DELETE      | Haute    |
| `/api/v1/meetings/[id]` PUT + DELETE    | Haute    |
| `/api/v1/formations/[id]` PUT + DELETE  | Haute    |
| `/api/v1/materials` GET + POST          | Moyenne  |
| `/api/v1/providers` GET + POST          | Moyenne  |
| `/api/v1/purchases` GET + POST          | Moyenne  |
| `/api/v1/auth/login`                    | Haute    |
| `/api/v1/auth/session`                  | Haute    |
| `/api/v1/users` GET + POST              | Haute    |
| `/api/v1/roles` + `/api/v1/permissions` | Haute    |

---

## Dépendances du package `@churchflow/api`

```json
{
  "@churchflow/database": "workspace:*",
  "@churchflow/types": "workspace:*",
  "@churchflow/utils": "workspace:*",
  "@churchflow/auth": "workspace:*"
}
```

**Jamais importer** `@churchflow/ui` dans l'API — les composants UI n'ont rien à faire côté API.

---

## Multi-tenant — Règle critique

Chaque modèle Prisma possède un `churchId`. Chaque requête GET **doit** filtrer par `churchId`.

```typescript
// CORRECT
prisma.member.findMany({ where: { churchId } });

// INTERDIT — retourne les données de toutes les églises
prisma.member.findMany();
```

En production, le `churchId` proviendra de la session Auth.js (côté serveur), pas du body de la requête client.

---

## Ajouter une nouvelle ressource — Checklist

- [ ] Ajouter le modèle dans `packages/database/prisma/schema.prisma`
- [ ] Ajouter les types dans `packages/types/src/index.ts`
- [ ] Créer `apps/api/app/api/v1/{resource}/route.ts`
- [ ] Créer `apps/api/app/api/v1/{resource}/[id]/route.ts`
- [ ] Valider avec Zod (schéma en haut du fichier)
- [ ] Tester `GET`, `POST`, `PUT`, `DELETE` manuellement
- [ ] Mettre à jour ce fichier avec la nouvelle route
