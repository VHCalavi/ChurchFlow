# 📋 PHASE 1 - CHARGE DE TRAVAIL & FLOW D'IMPLEMENTATION

> Priorité 1: Gestion des Membres & Profil
> Date: 2026-06-20
> **MAJ: Correction du problème de relations bidirectionnelles**

---

## 📊 TABLEAU DE BORD PHASE 1

| Tâche | Statut | Priorité | Complexité | Est. Temps |
|-------|--------|----------|------------|------------|
| 1.1 Page détail membre complet | ⏳ | 1 | Moyenne | 2-3 jours |
| 1.2 Statuts Membres: Actif/Inactif | ⏳ | 1 | Faible | 0.5-1 jour |
| 1.3 Relations de Parenté & GEMs | ⏳ | 1 | Haute | 3-4 jours |
| Total | - | - | - | **5.5-8.5 jours** |

---

## 🎯 OBJECTIF GLOBAL

Créer une page détail membre complète avec:
- ✅ Vue complète du profil (photo, infos de base)
- ✅ Historique des entretiens
- ✅ Tous les documents associés
- ✅ Arbre généalogique avec filtrage flexible (famille, GEM, affiliation)
- ✅ Timeline des activités
- ✅ Statut Actif/Inactif configurable

---

## 📐 ARCHITECTURE DE L'INTERFACE

### Page Détail Membre

```
┌─────────────────────────────────────────────────────────────┐
│  ← Membres                                            [+]    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────┬───────┬───────┬───────┬───────┬───────┐           │
│  │ Général│Groupes│Présences│Entretiens│Documents│Arbre   │◄── Nouveaux │
│  └───────┴───────┴───────┴───────┴───────┴───────┘           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │   [Photo] Prénom: [NOM]    Statut: 🟢 Actif           │     │
│  │   ✉️ email@example.com    ✆ 01 23 45 67 89           │     │
│  │   📅 15 Jan 1990              🎂 20 ans               │     │
│  │   ⚪ 🟢 Inactif →        🔘 Activer/Désactiver          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [Informations Détailées]                                     │
│  - Date de naissance: 15 Jan 1990                            │
│  - Baptême: 20 Jan 1990                                       │
│  - Date d'adhésion: 01 Jan 2024                               │
│  - Adresse: 123 Rue Exemple, Ville                           │
│  - Supervisor: Jean Dupont                                    │
│  - Groupes: [Département A] • [GEM: Binôme 1]                │
│  - Formations: [Baptême] • [Porteurs de vie]                  │
│  - Présences: 12 sur 15 réunions                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 1.1 PAGE DÉTAIL MEMBRE COMPLETE

### 1.1.1 Architecture Backend - CORRIGÉ

#### Tables à créer

**A. MemberInterview** (Historique des entretiens)

```prisma
model MemberInterview {
  id          String    @id @default(cuid())
  memberId    String
  title       String
  content     String    @db.Text
  date        DateTime  @default(now())
  interviewer String    // ID de l'intervieweur
  type        String    // INITIAL, FOLLOWUP, ANNUAL, SPECIAL
  attachments String[]  // Listes d'URLs de fichiers

  member      Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)
  interviewer Member?   @relation(fields: [interviewerId], references: [id])

  @@index([memberId])
  @@index([date])
  @@index([type])
}
```

**B. MemberDocument** (Documents membres)

```prisma
model MemberDocument {
  id          String    @id @default(cuid())
  memberId    String
  type        String    // ID_CARD, BAPTISM_CERTIFICATE, MEDICAL_REPORT, ETC.
  fileUrl     String
  uploadedAt  DateTime  @default(now())
  uploadedBy  String    // ID de l'uploadeur

  member      Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([type])
  @@index([uploadedAt])
}
```

**C. FamilyRelation** (Relations de parenté et GEMs)

```prisma
model FamilyRelation {
  id          String    @id @default(cuid())
  memberId    String
  relativeId  String
  relationType String   // PARENT, ENFANT, SPOUSE, SIBLING, GEM_PARTNER
  isActive    Boolean   @default(true)

  member      Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)
  relative    Member    @relation("FamilyRelations", fields: [relativeId], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([relativeId])
  @@index([relationType])
}
```

**D. FamilyIndex** (Index pour recherches rapides)

```prisma
model FamilyIndex {
  id          String        @id @default(cuid())
  memberId    String
  relationType String
  relativeIds String[]      // Tous les IDs des membres avec cette relation
  lastUpdated DateTime      @updatedAt

  @@index([memberId])
  @@index([relationType])
}
```

**E. MemberActivityTimeline** (Timeline des activités)

```prisma
model MemberActivityTimeline {
  id          String    @id @default(cuid())
  memberId    String
  date        DateTime
  activityType String
  details     String
  relatedId   String?   // Pour lier à autre entité (ex: meetingId, formationId)
  relatedType String?   // Pour identifier l'entité liée

  member      Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([date])
  @@index([activityType])
}
```

**F. InactivityConfig** (Configuration des conditions d'inactivité)

```prisma
model InactivityConfig {
  id                  String   @id @default(cuid())
  name                String
  description         String?
  inactivePeriodDays  Int      // Nombre de jours sans activité pour devenir inactif
  actions             String[] // Actions qui comptent comme activité: MEETING, FORMATION, GROUP, ETC.
  isActive            Boolean  @default(true)
  churchId            String

  church              Church   @relation(fields: [churchId], references: [id])

  @@unique([churchId])
}
```

### 🚨 CORRECTION MAJEURE: PAS DE RELATIONS BIDIRECTIONNELLES INUTILES

**Problème précédent:**
Tu as créé des relations bidirectionnelles inutiles qui compliquent le code.

**Solution CORRECTE:**
- **MemberInterview** n'a besoin que d'une relation `member` (pas de `memberInterviews`)
- **MemberDocument** n'a besoin que d'une relation `member` (pas de `memberDocuments`)
- **Member** n'a besoin de aucune relation inverse

**Pourquoi?** Parce que tu accèdes aux données via queries, pas via des relations:
```typescript
// CORRECT: Query direct
const interviews = await prisma.memberInterview.findMany({
  where: { memberId: "..." }
})

// INCORRECT: Relations bidirectionnelles inutiles
const interviews = await prisma.member.findUnique({
  where: { id: "..." },
  include: { memberInterviews: true }
})
```

---

### 1.1.2 Interfaces TypeScript à créer

**Fichier**: `packages/types/src/index.ts`

```typescript
// Enums
export enum InterviewType {
  INITIAL = 'initial',
  FOLLOWUP = 'followup',
  ANNUAL = 'annual',
  SPECIAL = 'special'
}

export enum DocumentType {
  ID_CARD = 'id_card',
  BAPTISM_CERTIFICATE = 'baptism_certificate',
  MEDICAL_REPORT = 'medical_report',
  OTHER = 'other'
}

export enum FamilyRelationType {
  PARENT = 'parent',
  CHILD = 'child',
  SPOUSE = 'spouse',
  SIBLING = 'sibling',
  GEM_PARTNER = 'gem_partner'
}

// Interfaces
export interface MemberInterview {
  id: string
  memberId: string
  title: string
  content: string
  date: Date
  interviewerId: string
  interviewerName?: string
  type: InterviewType
  attachments: string[]
}

export interface MemberDocument {
  id: string
  memberId: string
  type: DocumentType
  fileUrl: string
  fileName?: string
  uploadedAt: Date
  uploadedBy: string
  uploadedByName?: string
}

export interface FamilyRelation {
  id: string
  memberId: string
  relativeId: string
  relativeName: string
  relationType: FamilyRelationType
  isActive: boolean
}

export interface FamilyIndex {
  id: string
  memberId: string
  relationType: FamilyRelationType
  relativeIds: string[]
  lastUpdated: Date
}

export interface MemberActivity {
  id: string
  memberId: string
  date: Date
  activityType: string
  activityTypeLabel: string
  details: string
  relatedId?: string
  relatedType?: string
  relatedName?: string
}

export interface InactivityConfig {
  id: string
  name: string
  description?: string
  inactivePeriodDays: number
  actions: string[]
  isActive: boolean
  churchId: string
}
```

### 1.1.3 Services API à créer

**Fichier**: `apps/api/src/services/interview-service.ts`

```typescript
export const interviewService = {
  async getByMember(memberId: string) {
    return await prisma.memberInterview.findMany({
      where: { memberId },
      include: { interviewer: true },
      orderBy: { date: 'desc' }
    })
  },

  async getById(id: string) {
    return await prisma.memberInterview.findUnique({
      where: { id },
      include: { interviewer: true }
    })
  },

  async create(data: any) {
    return await prisma.memberInterview.create({
      data,
      include: { interviewer: true }
    })
  },

  async delete(id: string) {
    return await prisma.memberInterview.delete({ where: { id } })
  }
}
```

**Fichier**: `apps/api/src/services/document-service.ts`

```typescript
export const documentService = {
  async getByMember(memberId: string) {
    return await prisma.memberDocument.findMany({
      where: { memberId },
      orderBy: { uploadedAt: 'desc' }
    })
  },

  async create(data: any) {
    return await prisma.memberDocument.create({ data })
  },

  async delete(id: string) {
    return await prisma.memberDocument.delete({ where: { id } })
  }
}
```

**Fichier**: `apps/api/src/services/family-relation-service.ts`

```typescript
export const familyRelationService = {
  async getByMember(memberId: string, filters: any) {
    return await prisma.familyRelation.findMany({
      where: {
        memberId,
        isActive: true,
        relationType: {
          in: [
            ...(filters.includeFamily ? [FamilyRelationType.PARENT, FamilyRelationType.CHILD, FamilyRelationType.SPOUSE, FamilyRelationType.SIBLING] : []),
            ...(filters.includeGem ? [FamilyRelationType.GEM_PARTNER] : [])
          ]
        }
      },
      include: { relative: true }
    })
  },

  async update(id: string, data: any) {
    return await prisma.familyRelation.update({
      where: { id },
      data
    })
  },

  async delete(id: string) {
    return await prisma.familyRelation.delete({ where: { id } })
  }
}
```

### 1.1.4 API Routes à créer

**Fichier**: `apps/api/app/api/v1/members/[id]/interviews/route.ts`

```typescript
// GET /api/v1/members/:id/interviews
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const interviews = await prisma.memberInterview.findMany({
      where: {
        memberId: params.id,
        type: type ? { equals: type } : undefined
      },
      include: {
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return Response.json({ success: true, data: interviews })
  } catch (error) {
    return Response.json({ success: false, error: 'Error fetching interviews' }, { status: 500 })
  }
}

// POST /api/v1/members/:id/interviews
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, content, interviewerId, type, attachments } = body

    const interview = await prisma.memberInterview.create({
      data: {
        memberId: params.id,
        title,
        content,
        interviewerId,
        type,
        attachments: attachments || []
      },
      include: {
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return Response.json({ success: true, data: interview })
  } catch (error) {
    return Response.json({ success: false, error: 'Error creating interview' }, { status: 500 })
  }
}
```

**Fichier**: `apps/api/app/api/v1/members/[id]/documents/route.ts`

```typescript
// GET /api/v1/members/:id/documents
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const documents = await prisma.memberDocument.findMany({
      where: {
        memberId: params.id,
        type: type ? { equals: type } : undefined
      },
      orderBy: { uploadedAt: 'desc' }
    })

    return Response.json({ success: true, data: documents })
  } catch (error) {
    return Response.json({ success: false, error: 'Error fetching documents' }, { status: 500 })
  }
}

// POST /api/v1/members/:id/documents
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { type, fileUrl, fileName } = body

    const document = await prisma.memberDocument.create({
      data: {
        memberId: params.id,
        type,
        fileUrl,
        fileName,
        uploadedBy: user.id
      }
    })

    return Response.json({ success: true, data: document })
  } catch (error) {
    return Response.json({ success: false, error: 'Error creating document' }, { status: 500 })
  }
}
```

**Fichier**: `apps/api/app/api/v1/members/[id]/family-relations/route.ts`

```typescript
// GET /api/v1/members/:id/family-relations
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const includeFamily = searchParams.get('includeFamily') === 'true'
    const includeGem = searchParams.get('includeGem') === 'true'
    const includeDepartment = searchParams.get('includeDepartment') === 'true'
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true'

    const relations = await prisma.familyRelation.findMany({
      where: {
        memberId: params.id,
        isActive: true,
        relationType: {
          in: [
            ...(includeFamily ? [FamilyRelationType.PARENT, FamilyRelationType.CHILD, FamilyRelationType.SPOUSE, FamilyRelationType.SIBLING] : []),
            ...(includeGem ? [FamilyRelationType.GEM_PARTNER] : [])
          ]
        }
      },
      include: {
        relative: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        }
      },
      orderBy: {
        relationType: 'asc'
      }
    })

    return Response.json({ success: true, data: relations })
  } catch (error) {
    return Response.json({ success: false, error: 'Error fetching family relations' }, { status: 500 })
  }
}
```

---

## 🔧 1.2 STATUTS MEMBRES: ACTIF/INACTIF

### 1.2.1 API Routes

**Fichier**: `apps/api/app/api/v1/admin/inactivity-config/route.ts`

```typescript
// GET /api/v1/admin/inactivity-config
export async function GET() {
  try {
    const config = await prisma.inactivityConfig.findFirst({
      where: { isActive: true }
    })

    return Response.json({ success: true, data: config })
  } catch (error) {
    return Response.json({ success: false, error: 'Error fetching inactivity config' }, { status: 500 })
  }
}

// PUT /api/v1/admin/inactivity-config
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const config = await prisma.inactivityConfig.upsert({
      where: { churchId: body.churchId },
      update: body,
      create: body
    })

    return Response.json({ success: true, data: config })
  } catch (error) {
    return Response.json({ success: false, error: 'Error updating inactivity config' }, { status: 500 })
  }
}
```

### 1.2.2 Service

**Fichier**: `apps/api/src/services/inactivity-config-service.ts`

```typescript
export const inactivityConfigService = {
  async getConfig() {
    return await prisma.inactivityConfig.findFirst({ where: { isActive: true } })
  },

  async updateConfig(data: any) {
    return await prisma.inactivityConfig.upsert({
      where: { churchId: data.churchId },
      update: data,
      create: data
    })
  },

  async checkInactivity(memberId: string) {
    const config = await this.getConfig()
    if (!config) return null

    const meetings = await prisma.meeting.findMany({ where: { memberId: memberId } })
    const formations = await prisma.memberFormation.findMany({ where: { memberId: memberId } })
    const groups = await prisma.memberGroup.findMany({ where: { memberId: memberId } })

    const lastActivityDates = [
      ...meetings.map(m => m.date),
      ...formations.map(f => f.startedAt),
      ...groups.map(g => g.joinedAt)
    ]

    const oldestActivity = lastActivityDates.length > 0
      ? Math.min(...lastActivityDates.map(d => new Date(d).getTime()))
      : Date.now()

    const daysSinceLastActivity = Math.floor((Date.now() - oldestActivity) / (1000 * 60 * 60 * 24))
    const shouldBeInactive = daysSinceLastActivity >= config.inactivePeriodDays

    return {
      memberId,
      shouldBeInactive,
      isActive: true, // À récupérer de la base
      lastActiveDate: lastActivityDates.length > 0 ? new Date(oldestActivity) : undefined,
      daysSinceLastActivity,
      nextActionNeeded: shouldBeInactive
        ? 'Aucune activité récente - le membre devrait être inactif'
        : `Dernière activité: ${daysSinceLastAction} jours avant`
    }
  }
}
```

---

## 🎯 1.3 RELATIONS DE PARENTÉ & GEMs

### 1.3.1 Backend Déjà implémenté dans 1.1.1.C et 1.1.4

### 1.3.2 Frontend - Visualisation de l'arbre

**Fichier**: `apps/admin/components/members/family-tree-viewer.tsx`

```typescript
'use client'

import { useState, useMemo } from 'react'
import { FamilyRelation, FamilyRelationType } from '@churchflow/types'
import { Users, User, UserPlus } from 'lucide-react'

interface Props {
  memberId: string
  relations: FamilyRelation[]
  onRelationToggle: (relationId: string, isActive: boolean) => void
}

export function FamilyTreeView({ memberId, relations, onRelationToggle }: Props) {
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')

  if (relations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucune relation définie pour ce membre</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Relations</h3>
        <div className="flex gap-2">
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            Liste
          </Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="space-y-2">
          {relations.map((relation) => (
            <RelationRow
              key={relation.id}
              relation={relation}
              onToggle={() => onRelationToggle(relation.id, relation.isActive)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RelationRow({ relation, onToggle }: { relation: FamilyRelation; onToggle: () => void }) {
  const relationLabels = {
    PARENT: 'Père',
    CHILD: 'Enfant',
    SPOUSE: 'Conjoint',
    SIBLING: 'Frère/Sœur',
    GEM_PARTNER: 'Partenaire GEM'
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-gray-500" />
        <div>
          <p className="font-medium">{relation.relativeName}</p>
          <p className="text-sm text-gray-600">
            {relationLabels[relation.relationType] || relation.relationType}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={relation.isActive} onCheckedChange={onToggle} />
        <UserPlus className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
```

---

## 📋 CHECKLIST D'IMPLEMENTATION

### 1. Préparer le schema Prisma

```bash
cd packages/database
# Ouvrir prisma/schema.prisma et ajouter les nouveaux models
cd ..
pnpm prisma migrate dev --name add_member_interviews_documents_family_relations
```

### 2. Générer les types

```bash
cd packages/types
pnpm build
```

### 3. Créer les services API

```bash
cd apps/api
mkdir src/services
# Créer les 5 services dans src/services/
```

### 4. Créer les API routes

```bash
cd apps/api
mkdir app/api/v1/members/[id]
# Créer les 4 files dans app/api/v1/members/[id]/
```

### 5. Implémenter le frontend

```bash
cd apps/admin
# Créer la page détail membres avec 6 onglets
# Créer les 7 components dans components/members/
```

### 6. Tester

```bash
# Tester les API routes avec curl
curl http://localhost:3000/api/v1/members/:id/interviews

# Tester le frontend
# Naviguer vers http://localhost:3001/members/:id
```

---

## 🚀 CHECKLIST D'ACCÈS RAPIDE

```bash
# Démarrer
git clone <repo>
cd ChurchFlow
pnpm install

# Base de données
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev --name add_member_interviews_documents_family_relations

# Types
cd packages/types
pnpm build

# API
cd apps/api
pnpm dev

# Admin
cd apps/admin
pnpm dev
```

---

## 📝 NOTES IMPORTANTES

### Points d'attention

1. **Pas de relations bidirectionnelles inutiles** - Seules les relations FROM Member vers l'entité sont nécessaires.
2. **Indexation** - Ajouter des index sur tous les champs queryés memberId, type, date, etc.
3. **Multi-tenant** - Utiliser churchId dans les where clauses, pas de relations Church directes.
4. **Validation** - Utiliser Zod pour valider les entrées.
5. **Stockage** - Utiliser un service de stockage pour les documents (S3, Storage).

### Règles de design

1. **Type safety** - Toujours utiliser les types @churchflow/types.
2. **Consistent API** - Structure de réponse: { success, data?, error? }.
3. **Error handling** - Gérer les erreurs proprement avec status codes.
4. **Responsive** - Tous les composants doivent être responsive.

---

**Date de création:** 2026-06-19
**Date de mise à jour:** 2026-06-20
**Correction:** Problème de relations bidirectionnelles résolu
**Responsable:** Senior Dev
**Status:** En attente d'implémentation
