# 🚀 PHASE 2 — Plan d'implémentation GEMs & Rapports

> **Ordre d'exécution :** Chaque étape doit être terminée avant de passer à la suivante.
> Les étapes marquées ⚠️ nécessitent une migration de base de données.

---

## ÉTAPE 1 — Nettoyage : Retirer GEM des Groupes ⚠️

### 1.1 Schéma Prisma — Retirer GEM de GroupType

**Fichier :** `packages/database/prisma/schema.prisma`

```prisma
// AVANT
enum GroupType {
  DEPARTEMENT
  TRIBU
  GEM          // ← SUPPRIMER cette ligne
  MAISON_D_HONNEUR
  CELLULE
  ASSEMBLEE
}

// APRÈS
enum GroupType {
  DEPARTEMENT
  TRIBU
  MAISON_D_HONNEUR
  CELLULE
  ASSEMBLEE
}
```

**Action :** Lancer la migration
```bash
cd packages/database
npx prisma migrate dev --name remove_gem_from_group_type
```

> ⚠️ Si des groupes en base ont le type `GEM`, les migrer vers la nouvelle entité `Gem` avant de lancer la migration.

### 1.2 Frontend — Retirer GEM des formulaires et filtres Groupes

**Fichiers à modifier :**
- `apps/admin/app/dashboard/groups/page.tsx` → retirer `GEM` des filtres et du formulaire de création
- `apps/admin/app/dashboard/groups/[id]/page.tsx` → retirer mentions GEM
- Tout composant affichant `GroupType`

### 1.3 API — Retirer GEM de la validation des groupes

**Fichier :** `apps/api/app/api/v1/groups/route.ts` (et `[id]/route.ts`)
- Retirer `GEM` du Zod enum de validation du champ `type`

---

## ÉTAPE 2 — Base de données : Nouvelles tables ⚠️

### 2.1 Ajouter les modèles Gem, GemMember et Report

**Fichier :** `packages/database/prisma/schema.prisma`

```prisma
// --- GEM ---

model Gem {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  churchId    String
  church      Church   @relation(fields: [churchId], references: [id], onDelete: Cascade)

  // Rattachement optionnel à un groupe (ex: département)
  groupId     String?
  group       Group?   @relation(fields: [groupId], references: [id])

  members     GemMember[]
  reports     Report[]

  @@map("gems")
}

model GemMember {
  id        String   @id @default(cuid())
  gemId     String
  memberId  String
  isLeader  Boolean  @default(false)
  joinedAt  DateTime @default(now())

  gem    Gem    @relation(fields: [gemId], references: [id], onDelete: Cascade)
  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([memberId])       // Contrainte mono-GEM — gérer via config API si multi-GEM
  @@unique([gemId, memberId])
  @@map("gem_members")
}

// --- RAPPORTS (système unifié) ---

model Report {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  submittedAt DateTime @default(now())

  authorId    String
  author      Member   @relation("ReportAuthor", fields: [authorId], references: [id])

  gemId       String?
  gem         Gem?     @relation(fields: [gemId], references: [id])
  groupId     String?
  group       Group?   @relation(fields: [groupId], references: [id])

  churchId    String
  church      Church   @relation(fields: [churchId], references: [id])

  @@map("reports")
}
```

**Ajouter les relations inverses dans Member et Group :**

```prisma
model Member {
  // ... champs existants ...
  gemMemberships GemMember[]
  reportsWritten Report[]  @relation("ReportAuthor")
}

model Group {
  // ... champs existants ...
  gems    Gem[]
  reports Report[]
}

model Church {
  // ... champs existants ...
  gems    Gem[]
  reports Report[]
}
```

**Action :** Lancer la migration
```bash
cd packages/database
npx prisma migrate dev --name add_gem_and_report_tables
```

### 2.2 Fichier de config GEM

**Créer :** `apps/api/src/config/gem.config.ts`

```typescript
export const GEM_CONFIG = {
  /**
   * false (défaut) = un membre ne peut appartenir qu'à un seul GEM.
   * true = un membre peut appartenir à plusieurs GEMs.
   * Si true, la contrainte @@unique([memberId]) dans GemMember est ignorée
   * et la validation se fait dans le service.
   */
  ALLOW_MULTI_GEM: false,
} as const;
```

---

> 👉 **VOUS ÊTES ICI** — (Les étapes 1 et 2 concernant la base de données ont été réalisées)

## ÉTAPE 3 — API : Routes CRUD pour les GEMs

### 3.1 Structure des routes à créer

```
apps/api/app/api/v1/gems/
  ├── route.ts                        GET (liste), POST (créer)
  └── [id]/
        ├── route.ts                  GET (détail), PUT (modifier), DELETE
        ├── members/
        │     └── route.ts            GET (liste membres), POST (ajouter), DELETE (retirer)
        └── reports/
              └── route.ts            GET (rapports du GEM)

apps/api/app/api/v1/reports/
  ├── route.ts                        GET (liste filtrée par rôle), POST (créer rapport)
  └── [id]/
        └── route.ts                  GET (détail), PUT (modifier), DELETE
```

### 3.2 Service GEM

**Créer :** `apps/api/src/services/gem-service.ts`

```typescript
import { prisma } from '@churchflow/database';
import { GEM_CONFIG } from '../config/gem.config';

export const gemService = {
  // Lister les GEMs (filtrés par churchId)
  async getAll(churchId: string, groupId?: string) {
    return prisma.gem.findMany({
      where: { churchId, ...(groupId ? { groupId } : {}), isActive: true },
      include: {
        members: { include: { member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } } },
        group: { select: { id: true, name: true, type: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  // Créer un GEM
  async create(data: { name: string; description?: string; churchId: string; groupId?: string }) {
    return prisma.gem.create({ data });
  },

  // Ajouter un membre à un GEM
  async addMember(gemId: string, memberId: string) {
    if (!GEM_CONFIG.ALLOW_MULTI_GEM) {
      const existing = await prisma.gemMember.findUnique({ where: { memberId } });
      if (existing) throw new Error('Ce membre appartient déjà à un GEM. (ALLOW_MULTI_GEM=false)');
    }
    return prisma.gemMember.create({ data: { gemId, memberId } });
  },

  // Désigner un responsable GEM (et attribuer le rôle automatiquement)
  async setLeader(gemId: string, memberId: string, memberUserId?: string) {
    return prisma.$transaction(async (tx) => {
      // Retirer le statut leader des autres membres
      await tx.gemMember.updateMany({ where: { gemId }, data: { isLeader: false } });
      // Désigner le nouveau leader
      await tx.gemMember.update({ where: { gemId_memberId: { gemId, memberId } }, data: { isLeader: true } });
      // Attribuer le rôle RESPONSABLE_GEM si l'utilisateur a un compte
      if (memberUserId) {
        const gemRole = await tx.role.findFirst({ where: { name: 'RESPONSABLE_GEM' } });
        if (gemRole) {
          await tx.userRole.upsert({
            where: { userId_roleId: { userId: memberUserId, roleId: gemRole.id } },
            create: { userId: memberUserId, roleId: gemRole.id },
            update: {},
          });
        }
      }
    });
  },
};
```

### 3.3 Service Rapports

**Créer :** `apps/api/src/services/report-service.ts`

```typescript
import { prisma } from '@churchflow/database';

export const reportService = {
  // Lister les rapports selon le rôle de l'utilisateur connecté
  async getFiltered(userId: string, churchId: string, userRole: string) {
    const baseWhere = { churchId };

    if (userRole === 'ADMIN') return prisma.report.findMany({ where: baseWhere, include: reportIncludes, orderBy: { submittedAt: 'desc' } });

    if (userRole === 'RESPONSABLE_GEM') {
      const member = await prisma.member.findFirst({ where: { userId } });
      return prisma.report.findMany({ where: { ...baseWhere, authorId: member?.id }, include: reportIncludes, orderBy: { submittedAt: 'desc' } });
    }

    if (userRole === 'RESPONSABLE_GROUPE') {
      const member = await prisma.member.findFirst({ where: { userId } });
      const memberGroups = await prisma.memberGroup.findMany({ where: { memberId: member?.id }, select: { groupId: true } });
      const groupIds = memberGroups.map(g => g.groupId);
      return prisma.report.findMany({
        where: { ...baseWhere, OR: [{ authorId: member?.id }, { gem: { groupId: { in: groupIds } } }, { groupId: { in: groupIds } }] },
        include: reportIncludes, orderBy: { submittedAt: 'desc' },
      });
    }

    // PASTEUR_RESIDENT et au-dessus : tous les rapports de l'église
    return prisma.report.findMany({ where: baseWhere, include: reportIncludes, orderBy: { submittedAt: 'desc' } });
  },

  async create(data: { title: string; content: string; authorId: string; churchId: string; gemId?: string; groupId?: string }) {
    return prisma.report.create({ data, include: reportIncludes });
  },
};

const reportIncludes = {
  author: { select: { id: true, firstName: true, lastName: true } },
  gem: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
};
```

---

## ÉTAPE 4 — Rôles RBAC : Ajouter RESPONSABLE_GEM

### 4.1 Seed / Migration des rôles

Dans le fichier de seed (`packages/database/prisma/seed.ts` ou script de migration) :

```typescript
// Ajouter le rôle RESPONSABLE_GEM s'il n'existe pas
await prisma.role.upsert({
  where: { name: 'RESPONSABLE_GEM' },
  create: {
    name: 'RESPONSABLE_GEM',
    description: 'Responsable d\'un GEM, peut soumettre des rapports',
    churchId: /* churchId principal */,
  },
  update: {},
});
```

### 4.2 Permissions associées au rôle

| Permission | RESPONSABLE_GEM | RESPONSABLE_GROUPE | PASTEUR |
|---|---|---|---|
| `gem:view` | ✅ | ✅ | ✅ |
| `gem:create` | ❌ | ✅ | ✅ |
| `gem:manage_members` | ✅ (son GEM) | ✅ | ✅ |
| `report:create` | ✅ | ✅ | ✅ |
| `report:view_own` | ✅ | ✅ | ✅ |
| `report:view_group` | ❌ | ✅ | ✅ |
| `report:view_all` | ❌ | ❌ | ✅ |

---

## ÉTAPE 5 — Frontend : Menu et pages GEM

### 5.1 Sidebar — Ajouter l'entrée GEM

**Fichier :** `apps/admin/components/layout/dashboard-layout.tsx` (ou fichier de navigation)

```typescript
// Ajouter dans le tableau de navigation
{ href: '/dashboard/gems', label: 'GEMs', icon: <Layers /> },
{ href: '/dashboard/reports', label: 'Rapports', icon: <FileText /> },
```

### 5.2 Page Liste GEMs — `/dashboard/gems/page.tsx`

**Fonctionnalités :**
- Chargement des GEMs depuis `GET /api/v1/gems`
- Regroupement par `group.name` (ou "Sans groupe" si non rattaché)
- Carte par GEM : nom, nombre de membres, responsable (badge spécial), groupe
- Bouton "Nouveau GEM" → modale de création
- Bouton "Voir" → navigation vers `/dashboard/gems/[id]`

### 5.3 Page Détail GEM — `/dashboard/gems/[id]/page.tsx`

**Onglets :**
1. **Membres** — liste des membres du GEM, bouton "Ajouter un membre", bouton "Désigner responsable", bouton "Retirer"
2. **Rapports** — liste des rapports soumis pour ce GEM, bouton "Nouveau rapport"

### 5.4 Page Rapports — `/dashboard/reports/page.tsx`

**Fonctionnalités :**
- Chargement depuis `GET /api/v1/reports` (filtrés automatiquement par le backend selon le rôle)
- Groupement : par GEM | par Groupe | par Date
- Formulaire "Nouveau rapport" : Titre + Contenu texte + Contexte (GEM ou Groupe)
- Chaque rapport cliquable → modale de lecture complète

### 5.5 Onglet GEM dans la page Groupe — `/dashboard/groups/[id]/page.tsx`

- Ajouter un onglet **"GEMs"**
- Appel : `GET /api/v1/gems?groupId=[id]`
- Affiche la liste des GEMs rattachés à ce groupe

### 5.6 Onglet Rapports dans le profil membre — `/dashboard/members/[id]/page.tsx`

- Ajouter un onglet **"Rapports"** (ou enrichir l'onglet Documents existant)
- Appel : `GET /api/v1/reports?authorId=[memberId]`
- Liste des rapports soumis par ce membre

---

## ÉTAPE 6 — Frontend : Visualisation Graph

### 6.1 Installation de la dépendance

```bash
cd apps/admin
npm install reactflow
# ou
pnpm add reactflow
```

### 6.2 Page Graph — `/dashboard/graph/page.tsx`

**Structure des données à charger :**
```
GET /api/v1/graph → retourne { nodes: [], edges: [] }
```

**Nouvel endpoint API à créer :** `apps/api/app/api/v1/graph/route.ts`

Ce endpoint construit les nœuds et connexions en une seule requête :

```typescript
// Pseudo-code du endpoint /api/v1/graph
const [members, groups, gems, relations] = await Promise.all([
  prisma.member.findMany({ where: { churchId }, select: { id, firstName, lastName, status, supervisorId, photoUrl } }),
  prisma.group.findMany({ where: { churchId }, include: { members: true } }),
  prisma.gem.findMany({ where: { churchId }, include: { members: true, group: true } }),
  prisma.familyRelation.findMany({ where: { member: { churchId } } }),
]);

// Construire les nœuds React Flow
// Construire les edges (connexions)
return { nodes, edges };
```

**Filtres (panneau de contrôle UI) :**
```typescript
const [filters, setFilters] = useState({
  showPastoral: true,     // Hiérarchie superviseur → subordonné
  showGroups: true,       // Membres → Groupes
  showGems: true,         // Membres → GEMs
  showFamily: true,       // Liens de parenté
  showMembers: false,     // Membres individuels (dense, désactivé par défaut)
});
```

**Comportement :**
- Réappliquer les filtres côté client (pas de rechargement API)
- Les nœuds ont une taille proportionnelle à leur nombre de connexions
- Clic sur un nœud → navigation vers la page de détail de l'entité

---

## RÉSUMÉ DES FICHIERS À CRÉER / MODIFIER

### Nouveaux fichiers

| Fichier | Description |
|---|---|
| `apps/api/src/config/gem.config.ts` | Config ALLOW_MULTI_GEM |
| `apps/api/src/services/gem-service.ts` | Service GEM |
| `apps/api/src/services/report-service.ts` | Service Rapports |
| `apps/api/app/api/v1/gems/route.ts` | GET + POST gems |
| `apps/api/app/api/v1/gems/[id]/route.ts` | GET + PUT + DELETE gem |
| `apps/api/app/api/v1/gems/[id]/members/route.ts` | GET + POST + DELETE membres GEM |
| `apps/api/app/api/v1/reports/route.ts` | GET + POST rapports |
| `apps/api/app/api/v1/reports/[id]/route.ts` | GET + PUT + DELETE rapport |
| `apps/api/app/api/v1/graph/route.ts` | GET données graph |
| `apps/admin/app/dashboard/gems/page.tsx` | Liste GEMs |
| `apps/admin/app/dashboard/gems/[id]/page.tsx` | Détail GEM |
| `apps/admin/app/dashboard/reports/page.tsx` | Liste rapports |
| `apps/admin/app/dashboard/graph/page.tsx` | Graph interactif |

### Fichiers existants à modifier

| Fichier | Modification |
|---|---|
| `packages/database/prisma/schema.prisma` | Retirer GEM de GroupType + Ajouter Gem, GemMember, Report |
| `apps/api/app/api/v1/groups/route.ts` | Retirer GEM de la validation |
| `apps/admin/app/dashboard/groups/page.tsx` | Retirer GEM des filtres/formulaires |
| `apps/admin/app/dashboard/groups/[id]/page.tsx` | Ajouter onglet GEMs |
| `apps/admin/app/dashboard/members/[id]/page.tsx` | Ajouter onglet Rapports |
| `apps/admin/components/layout/dashboard-layout.tsx` | Ajouter GEMs + Rapports dans la sidebar |

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
1. ⚠️  Migration schéma (retirer GEM de GroupType + ajouter Gem/GemMember/Report)
2. ✍️  Créer gem.config.ts, gem-service.ts, report-service.ts
3. 🌐  Créer routes API gems (CRUD)
4. 🌐  Créer routes API reports (CRUD avec filtrage)
5. 🗂️  Ajouter rôle RESPONSABLE_GEM dans le seed/RBAC
6. 🖥️  Page /dashboard/gems (liste + détail)
7. 🖥️  Page /dashboard/reports
8. 🖥️  Modifier sidebar + page groupe (onglet GEMs) + page membre (onglet rapports)
9. 🌐  Créer route API /graph
10. 🖥️  Page /dashboard/graph (React Flow)
```
