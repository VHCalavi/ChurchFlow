# 📋 PHASE 1 - CHARGE DE TRAVAIL & FLOW D'IMPLEMENTATION

> Priorité 1: Gestion des Membres & Profil
> Date: 2026-06-19

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

### Onglet "Entretiens" (Nouveau)

```
┌─────────────────────────────────────────────────────────────┐
│  Entretiens du membre                                        │
├─────────────────────────────────────────────────────────────┤
│  [+] Nouvel Entretien                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📅 2024-06-15  📋 INITIAL                            │     │
│  │ Intervieweur: Marie Dupont                           │     │
│  │ 📄 Télécharger | 🗑️ Supprimer                        │     │
│  │ [Contenu de l'entretien...]                          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📅 2024-03-20  📋 FOLLOWUP                           │     │
│  │ Intervieweur: Jean Dupont                           │     │
│  │ 📄 Télécharger | 🗑️ Supprimer                        │     │
│  │ [Contenu de l'entretien...]                          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Onglet "Documents" (Nouveau)

```
┌─────────────────────────────────────────────────────────────┐
│  Documents du membre                                        │
├─────────────────────────────────────────────────────────────┤
│  [+] Ajouter un document                                    │
│                                                               │
│  📄 [ID_CARD] Carte d'identité        📅 2024-01-15    [📂] │
│  📄 [BAPTISM_CERTIFICATE] Certificat de baptême           │
│  📅 2024-01-20    [📂]                                        │
│  📄 [MEDICAL_REPORT] Rapport médical                   │
│  📅 2024-02-10    [📂]                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Onglet "Arbre Généalogique" (Nouveau)

```
┌─────────────────────────────────────────────────────────────┐
│  Arbre Généalogique - Filtres                                 │
├─────────────────────────────────────────────────────────────┤
│  [ ] Famille  [x] GEM  [ ] Département  [ ] Hiérarchie      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                                                         │     │
│  │     [PÈRE]       [MÈRE]                                │     │
│  │        │            │                                  │     │
│  │        │            │                                  │     │
│  │        └────────────┼────────────┐                    │     │
│  │                       │            │                    │     │
│  │              [ENFANT 1]    [ENFANT 2]                  │     │
│  │                       │            │                    │     │
│  │                       │            │                    │     │
│  │                 [ÉPOUX/ÉPOUSE]                              │     │
│  │                       │                                    │     │
│  │                [FRÈRE/SŒUR] ← [MEMBRE PRÉSENT]            │     │
│  │                                                       │     │
│  │              [GEM PARTNER]                             │     │
│  │                                                       │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  🔄 Voir arbre global | 📥 Exporter PNG/PDF                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 1.1 PAGE DÉTAIL MEMBRE COMPLETE

### 1.1.1 Architecture Backend

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
  isActive    Boolean   @default(true) // Pour activer/désactiver les liaisons

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

#### Interfaces TypeScript à créer

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
  activityTypeLabel: string // Human-readable
  details: string
  relatedId?: string
  relatedType?: string
  relatedName?: string
}
```

#### API Routes à créer

**Fichier**: `apps/api/app/api/v1/members/[id]/interviews/route.ts` (GET/POST)

```typescript
// GET /api/v1/members/:id/interviews - Récupérer tous les entretiens d'un membre
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filtrer par type

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
      orderBy: {
        date: 'desc'
      }
    })

    return Response.json({
      success: true,
      data: interviews
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error fetching interviews'
    }, { status: 500 })
  }
}

// POST /api/v1/members/:id/interviews - Créer un nouvel entretien
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    return Response.json({
      success: true,
      data: interview
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error creating interview'
    }, { status: 500 })
  }
}
```

**Fichier**: `apps/api/app/api/v1/members/[id]/documents/route.ts` (GET/POST)

```typescript
// GET /api/v1/members/:id/documents - Récupérer tous les documents d'un membre
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filtrer par type

    const documents = await prisma.memberDocument.findMany({
      where: {
        memberId: params.id,
        type: type ? { equals: type } : undefined
      },
      include: {
        _count: {
          select: { activities: true }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return Response.json({
      success: true,
      data: documents
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error fetching documents'
    }, { status: 500 })
  }
}

// POST /api/v1/members/:id/documents - Créer un nouveau document
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type, fileUrl, fileName } = body

    const document = await prisma.memberDocument.create({
      data: {
        memberId: params.id,
        type,
        fileUrl,
        fileName,
        uploadedBy: user.id // À extraire de la session
      }
    })

    return Response.json({
      success: true,
      data: document
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error creating document'
    }, { status: 500 })
  }
}
```

**Fichier**: `apps/api/app/api/v1/members/[id]/family-relations/route.ts` (GET)

```typescript
// GET /api/v1/members/:id/family-relations - Récupérer toutes les relations familiales
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    return Response.json({
      success: true,
      data: relations
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error fetching family relations'
    }, { status: 500 })
  }
}
```

**Fichier**: `apps/api/app/api/v1/members/[id]/activities/route.ts` (GET)

```typescript
// GET /api/v1/members/:id/activities - Récupérer la timeline d'activités
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const activities = await prisma.memberActivityTimeline.findMany({
      where: {
        memberId: params.id
      },
      include: {
        relatedMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: limit
    })

    return Response.json({
      success: true,
      data: activities
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error fetching activities'
    }, { status: 500 })
  }
}
```

### 1.1.2 Architecture Frontend

#### Structure des fichiers

```
apps/admin/
├── app/
│   └── members/
│       └── [id]/
│           └── page.tsx              ← Page détail membre (séparée)
├── components/
│   ├── members/
│   │   ├── member-detail-interviews.tsx    ← Onglet Entretiens
│   │   ├── member-detail-documents.tsx     ← Onglet Documents
│   │   ├── member-detail-activities.tsx    ← Onglet Timeline
│   │   ├── member-detail-tree.tsx          ← Onglet Arbre
│   │   ├── interview-form.tsx              ← Formulaire entretien
│   │   ├── document-upload.tsx             ← Upload document
│   │   └── family-tree-viewer.tsx          ← Visualisation arbre
```

#### Page principale - `apps/admin/app/members/[id]/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Member } from '@churchflow/types'
import { MemberDetailGeneral } from '@/components/members/member-detail-general'
import { MemberDetailGroupes } from '@/components/members/member-detail-groupes'
import { MemberDetailPresences } from '@/components/members/member-detail-presences'
import { MemberDetailInterviews } from '@/components/members/member-detail-interviews'
import { MemberDetailDocuments } from '@/components/members/member-detail-documents'
import { MemberDetailTree } from '@/components/members/member-detail-tree'

interface PageProps {
  params: { id: string }
}

export default function MemberDetailPage({ params }: PageProps) {
  const [currentMember, setCurrentMember] = useState<Member | null>(null)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Détail du Membre</h1>
        <p className="text-gray-600">Informations complètes du membre</p>
      </div>

      {currentMember && (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="groupes">Groupes</TabsTrigger>
            <TabsTrigger value="presences">Présences</TabsTrigger>
            <TabsTrigger value="entretiens">Entretiens</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="arbre">Arbre</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <MemberDetailGeneral
              member={currentMember}
              onUpdate={handleUpdateMember}
            />
          </TabsContent>

          <TabsContent value="groupes">
            <MemberDetailGroupes memberId={params.id} />
          </TabsContent>

          <TabsContent value="presences">
            <MemberDetailPresences memberId={params.id} />
          </TabsContent>

          <TabsContent value="entretiens">
            <MemberDetailInterviews memberId={params.id} />
          </TabsContent>

          <TabsContent value="documents">
            <MemberDetailDocuments memberId={params.id} />
          </TabsContent>

          <TabsContent value="arbre">
            <MemberDetailTree memberId={params.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
```

#### Component Onglet Entretiens - `member-detail-interviews.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberInterview, InterviewType } from '@churchflow/types'
import { interviewService } from '@/services/interview-service'
import { InterviewForm } from './interview-form'

interface Props {
  memberId: string
}

export function MemberDetailInterviews({ memberId }: Props) {
  const [interviews, setInterviews] = useState<MemberInterview[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchInterviews()
  }, [memberId])

  const fetchInterviews = async () => {
    const data = await interviewService.getByMember(memberId)
    setInterviews(data)
  }

  const handleInterviewCreated = (interview: MemberInterview) => {
    setInterviews([interview, ...interviews])
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Entretiens</h2>
        <Button onClick={() => setShowForm(true)}>+ Nouvel Entretien</Button>
      </div>

      {showForm && (
        <InterviewForm
          memberId={memberId}
          onCancel={() => setShowForm(false)}
          onSuccess={handleInterviewCreated}
        />
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          {Object.values(InterviewType).map((type) => (
            <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onDelete={() => handleDeleteInterview(interview.id)}
              />
            ))}
          </div>
        </TabsContent>

        {Object.values(InterviewType).map((type) => (
          <TabsContent key={type} value={type}>
            <div className="space-y-4">
              {interviews
                .filter(i => i.type === type)
                .map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onDelete={() => handleDeleteInterview(interview.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function InterviewCard({
  interview,
  onDelete
}: {
  interview: MemberInterview
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{interview.title}</CardTitle>
            <p className="text-sm text-gray-600">
              {new Date(interview.date).toLocaleDateString('fr-FR')}
              {' • '}
              {interview.type}
              {' • '}
              {interview.interviewerName}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{interview.content}</p>
        {interview.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">Pièces jointes:</p>
            {interview.attachments.map((attachment) => (
              <Button
                key={attachment}
                variant="outline"
                size="sm"
                onClick={() => window.open(attachment, '_blank')}
              >
                📄 Télécharger
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### Component Onglet Documents - `member-detail-documents.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentType } from '@churchflow/types'
import { documentService } from '@/services/document-service'
import { DocumentUpload } from './document-upload'

interface Props {
  memberId: string
}

export function MemberDetailDocuments({ memberId }: Props) {
  const [documents, setDocuments] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [memberId])

  const fetchDocuments = async () => {
    const data = await documentService.getByMember(memberId)
    setDocuments(data)
  }

  const handleDocumentUploaded = (document: any) => {
    setDocuments([document, ...documents])
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Documents</h2>
        <Button onClick={() => setShowForm(true)}>+ Ajouter un document</Button>
      </div>

      {showForm && (
        <DocumentUpload
          memberId={memberId}
          onCancel={() => setShowForm(false)}
          onSuccess={handleDocumentUploaded}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc: any) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  )
}

function DocumentCard({ document }: { document: any }) {
  const typeLabels = {
    ID_CARD: 'Carte d\'identité',
    BAPTISM_CERTIFICATE: 'Certificat de baptême',
    MEDICAL_REPORT: 'Rapport médical',
    OTHER: 'Autre'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{typeLabels[document.type] || document.type}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          📅 {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => window.open(document.fileUrl, '_blank')}>
            📂 Voir le document
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Component Onglet Arbre - `member-detail-tree.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter } from 'lucide-react'
import { FamilyRelation, FamilyRelationType } from '@churchflow/types'
import { familyRelationService } from '@/services/family-relation-service'
import { FamilyTreeView } from './family-tree-viewer'

interface Props {
  memberId: string
}

export function MemberDetailTree({ memberId }: Props) {
  const [relations, setRelations] = useState<FamilyRelation[]>([])
  const [filters, setFilters] = useState({
    includeFamily: true,
    includeGem: true,
    includeDepartment: false,
    includeHierarchy: false
  })

  useEffect(() => {
    fetchRelations()
  }, [memberId, filters])

  const fetchRelations = async () => {
    const params = new URLSearchParams({
      includeFamily: filters.includeFamily.toString(),
      includeGem: filters.includeGem.toString(),
      includeDepartment: filters.includeDepartment.toString(),
      includeHierarchy: filters.includeHierarchy.toString()
    })

    const data = await familyRelationService.getByMember(memberId, params)
    setRelations(data)
  }

  const handleRelationToggle = async (relationId: string, isActive: boolean) => {
    await familyRelationService.update(relationId, { isActive })
    setRelations(
      relations.map(r =>
        r.id === relationId ? { ...r, isActive } : r
      )
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres de visualisation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeFamily}
                onChange={(e) => setFilters({ ...filters, includeFamily: e.target.checked })}
                className="rounded"
              />
              Famille
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeGem}
                onChange={(e) => setFilters({ ...filters, includeGem: e.target.checked })}
                className="rounded"
              />
              GEM
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeDepartment}
                onChange={(e) => setFilters({ ...filters, includeDepartment: e.target.checked })}
                className="rounded"
              />
              Département
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeHierarchy}
                onChange={(e) => setFilters({ ...filters, includeHierarchy: e.target.checked })}
                className="rounded"
              />
              Hiérarchie
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Arbre Généalogique</CardTitle>
        </CardHeader>
        <CardContent>
          <FamilyTreeView
            memberId={memberId}
            relations={relations}
            onRelationToggle={handleRelationToggle}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 1.1.3 Flow de navigation et d'implémentation

#### Étape 1: Préparer le schema Prisma

```bash
# 1. Ouvrir packages/database/prisma/schema.prisma
# 2. Ajouter les nouveaux models
# 3. Lancer la migration
cd packages/database
pnpm prisma migrate dev --name add_member_interviews_documents_family_relations
```

#### Étape 2: Générer les types TypeScript

```bash
cd packages/types
pnpm build
```

#### Étape 3: Créer les API routes

```bash
cd apps/api
# Créer les fichiers dans app/api/v1/members/[id]/
# Pour chaque endpoint (interviews, documents, family-relations, activities)
```

#### Étape 4: Créer les services (réutilisables)

```typescript
// packages/api/src/services/interview-service.ts
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

// packages/api/src/services/document-service.ts
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

// packages/api/src/services/family-relation-service.ts
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
  }
}

// packages/api/src/services/activity-service.ts
export const activityService = {
  async getByMember(memberId: string, limit = 50) {
    return await prisma.memberActivityTimeline.findMany({
      where: { memberId },
      include: { relatedMember: true },
      orderBy: { date: 'desc' },
      take: limit
    })
  },

  async create(data: any) {
    return await prisma.memberActivityTimeline.create({ data })
  }
}
```

#### Étape 5: Implémenter les composants frontend

```bash
cd apps/admin
# Créer les fichiers dans components/members/
# Pour chaque component (interviews, documents, tree, forms)
```

#### Étape 6: Tester

1. **API Routes**: Tester avec curl ou Postman
   ```bash
   # Test GET /api/v1/members/:id/interviews
   curl http://localhost:3000/api/v1/members/:id/interviews

   # Test POST /api/v1/members/:id/interviews
   curl -X POST http://localhost:3000/api/v1/members/:id/interviews \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","content":"Test content","interviewerId":"...","type":"INITIAL"}'
   ```

2. **Frontend**: Tester dans le navigateur
   - Naviguer vers `/members/:id`
   - Tester chaque onglet
   - Tester les fonctionnalités (créer entretien, uploader document, etc.)

#### Étape 7: Documentation

- Mettre à jour README
- Ajouter screenshot dans documentation
- Documenter les API endpoints

---

## 🔧 1.2 STATUTS MEMBRES: ACTIF/INACTIF

### 1.2.1 Architecture Backend

#### Tables à créer

**A. InactivityConfig** (Configuration des conditions d'inactivité)

```prisma
model InactivityConfig {
  id          String   @id @default(cuid())
  name        String
  description String?
  inactivePeriodDays Int // Nombre de jours sans activité pour devenir inactif
  actions     String[] // Actions qui comptent comme activité: MEETING, FORMATION, GROUP, ETC.
  isActive    Boolean  @default(true)
  churchId    String

  church      Church   @relation(fields: [churchId], references: [id])

  @@unique([churchId])
}
```

#### Interfaces TypeScript à créer

**Fichier**: `packages/types/src/index.ts`

```typescript
export interface InactivityConfig {
  id: string
  name: string
  description?: string
  inactivePeriodDays: number
  actions: string[]
  isActive: boolean
  churchId: string
}

export interface MemberInactivityCheck {
  memberId: string
  isActive: boolean
  lastActiveDate?: Date
  daysSinceLastAction: number
  nextActionNeeded: string
  actionsNeeded: string[]
}

// Utilitaire pour vérifier si un membre doit être marqué inactif
export function shouldMemberBeInactive(
  member: Member,
  config: InactivityConfig,
  lastActivityDates: Date[]
): boolean {
  if (member.isActive) return false

  // Vérifier si le membre a eu une activité récente
  const oldestActivity = Math.min(...lastActivityDates.map(d => new Date(d).getTime()))
  const daysSinceLastActivity = Math.floor((Date.now() - oldestActivity) / (1000 * 60 * 60 * 24))

  return daysSinceLastActivity >= config.inactivePeriodDays
}
```

#### API Routes à créer

**Fichier**: `apps/api/app/api/v1/admin/inactivity-config/route.ts`

```typescript
// GET /api/v1/admin/inactivity-config - Récupérer la configuration d'inactivité
export async function GET() {
  try {
    const config = await prisma.inactivityConfig.findFirst({
      where: { isActive: true }
    })

    return Response.json({
      success: true,
      data: config
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error fetching inactivity config'
    }, { status: 500 })
  }
}

// PUT /api/v1/admin/inactivity-config - Mettre à jour la configuration
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const config = await prisma.inactivityConfig.upsert({
      where: { churchId: body.churchId },
      update: body,
      create: body
    })

    return Response.json({
      success: true,
      data: config
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error updating inactivity config'
    }, { status: 500 })
  }
}
```

**Fichier**: `apps/api/app/api/v1/members/[id]/inactivity-check/route.ts`

```typescript
// GET /api/v1/members/:id/inactivity-check - Vérifier le statut d'inactivité d'un membre
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer la configuration d'inactivité
    const config = await prisma.inactivityConfig.findFirst({
      where: { isActive: true }
    })

    if (!config) {
      return Response.json({
        success: false,
        error: 'No inactivity config found'
      }, { status: 404 })
    }

    // Récupérer les dates de dernière activité du membre
    const meetings = await prisma.meeting.findMany({
      where: { memberId: params.id }
    })

    const formations = await prisma.memberFormation.findMany({
      where: { memberId: params.id }
    })

    const groups = await prisma.memberGroup.findMany({
      where: { memberId: params.id }
    })

    // Extraire les dates de dernière activité
    const lastActivityDates = [
      ...meetings.map(m => m.date),
      ...formations.map(f => f.startedAt),
      ...groups.map(g => g.joinedAt)
    ]

    // Vérifier le statut d'inactivité
    const shouldBeInactive = shouldMemberBeInactive(
      member,
      config,
      lastActivityDates
    )

    return Response.json({
      success: true,
      data: {
        memberId: params.id,
        shouldBeInactive,
        isActive: member.isActive,
        lastActiveDate: lastActivityDates.length > 0
          ? new Date(Math.max(...lastActivityDates.map(d => new Date(d).getTime())))
          : undefined,
        daysSinceLastAction: shouldBeInactive
          ? config.inactivePeriodDays
          : Math.floor((Date.now() - Math.max(...lastActivityDates.map(d => new Date(d).getTime()))) / (1000 * 60 * 60 * 24)),
        nextActionNeeded: shouldBeInactive
          ? 'Aucune activité récente - le membre devrait être inactif'
          : `Dernière activité: ${Math.floor((Date.now() - Math.max(...lastActivityDates.map(d => new Date(d).getTime()))) / (1000 * 60 * 60 * 24))} jours avant`
      }
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error checking inactivity'
    }, { status: 500 })
  }
}
```

### 1.2.2 Architecture Frontend

#### Service pour la configuration

```typescript
// packages/admin/src/services/inactivity-config-service.ts
export const inactivityConfigService = {
  async getConfig() {
    return await fetch('/api/v1/admin/inactivity-config')
      .then(res => res.json())
      .then(data => data.data)
  },

  async updateConfig(data: any) {
    return await fetch('/api/v1/admin/inactivity-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(data => data.data)
  },

  async checkInactivity(memberId: string) {
    return await fetch(`/api/v1/members/${memberId}/inactivity-check`)
      .then(res => res.json())
      .then(data => data.data)
  }
}
```

#### Interface pour la modification du statut

```typescript
// packages/admin/src/components/members/member-inactivity-toggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { inactivityConfigService } from '@/services/inactivity-config-service'

interface Props {
  memberId: string
  member: any
}

export function MemberInactivityToggle({ memberId, member }: Props) {
  const [isActive, setIsActive] = useState(member.isActive)
  const [config, setConfig] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<any>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    const data = await inactivityConfigService.getConfig()
    setConfig(data)
  }

  const handleCheck = async () => {
    setChecking(true)
    const result = await inactivityConfigService.checkInactivity(memberId)
    setCheckResult(result)
    setChecking(false)
  }

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked)

    const updatedMember = await updateMemberStatus(memberId, checked)

    if (updatedMember) {
      toast.success(
        checked
          ? 'Membre marqué comme actif'
          : 'Membre marqué comme inactif'
      )
    } else {
      setIsActive(member.isActive) // Revert
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut d\'activité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="inactivity-switch">
              {isActive ? '🟢 Actif' : '⚫ Inactif'}
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              {isActive
                ? 'Ce membre est actuellement actif'
                : 'Ce membre est actuellement inactif'}
            </p>
          </div>
          <Switch
            id="inactivity-switch"
            checked={isActive}
            onCheckedChange={handleToggle}
          />
        </div>

        {checkResult && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold mb-2">Vérification d'inactivité:</p>
            <p className="text-sm">
              {checkResult.nextActionNeeded}
            </p>
            {config && (
              <p className="text-xs text-gray-600 mt-2">
                Condition: {config.inactivePeriodDays} jours sans {config.actions.join(', ')}
              </p>
            )}
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleCheck}
          disabled={checking}
        >
          {checking ? 'Vérification...' : 'Vérifier le statut'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 1.2.3 Flow d'implémentation

1. **Préparer le schema Prisma**
   ```bash
   cd packages/database
   pnpm prisma migrate dev --name add_inactivity_config
   ```

2. **Créer l'API route de configuration**
   ```bash
   cd apps/api
   # Créer app/api/v1/admin/inactivity-config/route.ts
   ```

3. **Créer l'API route de vérification**
   ```bash
   # Créer app/api/v1/members/[id]/inactivity-check/route.ts
   ```

4. **Tester**
   - Tester l'upload de config
   - Tester la vérification d'inactivité
   - Tester le toggle actif/inactif

---

## 🎯 1.3 RELATIONS DE PARENTÉ & GEMs

### 1.3.1 Architecture Backend

#### Table déjà créée dans 1.1 (FamilyRelation)

**Voir section 1.1.1.A pour le schema complet**

### 1.3.2 Frontend - Visualisation de l'arbre

#### Component FamilyTreeView - `family-tree-viewer.tsx`

```typescript
'use client'

import { useState, useMemo } from 'react'
import { FamilyRelation, FamilyRelationType } from '@churchflow/types'
import { User, UserPlus, Users } from 'lucide-react'

interface Props {
  memberId: string
  relations: FamilyRelation[]
  onRelationToggle: (relationId: string, isActive: boolean) => void
}

export function FamilyTreeView({ memberId, relations, onRelationToggle }: Props) {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')

  // Construire l'arbre à partir des relations
  const treeData = useMemo(() => {
    if (relations.length === 0) return null

    // Trouver les relations qui concernent le membre
    const memberRelations = relations.filter(
      r => r.memberId === memberId || r.relativeId === memberId
    )

    return memberRelations
  }, [relations, memberId])

  if (!treeData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucune relation définie pour ce membre</p>
        <p className="text-sm mt-2">
          Activez les filtres pour voir les relations
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Relations de {viewMode === 'tree' ? 'l\'arbre' : 'liste'}
        </h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            🌳 Arbre
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            📋 Liste
          </Button>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <div className="space-y-4">
          {renderTreeBranch(treeData)}
        </div>
      ) : (
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

function renderTreeBranch(relations: FamilyRelation[]) {
  // Logique pour rendre l'arbre visuel
  // À implémenter selon la structure des relations

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Vue arborescente en cours de développement
      </p>
    </div>
  )
}

function RelationRow({
  relation,
  onToggle
}: {
  relation: FamilyRelation
  onToggle: () => void
}) {
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
        <Switch
          checked={relation.isActive}
          onCheckedChange={onToggle}
        />
        <UserPlus className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
```

### 1.3.3 Flow d'implémentation

1. **Créer la page de gestion des relations** (optionnel pour le moment)
2. **Implémenter le visualisateur d'arbre** (déjà fait dans 1.1.3)
3. **Ajouter la possibilité de créer des relations** (phase future)
4. **Tester l'affichage et le toggle des relations**

---

## 📋 CHECKLIST D'IMPLEMENTATION PHASE 1

### Backend (API)

- [ ] Préparer le schema Prisma avec tous les nouveaux models
- [ ] Lancer la migration Prisma
- [ ] Générer les types TypeScript
- [ ] Créer les API routes:
  - [ ] GET/POST /api/v1/members/:id/interviews
  - [ ] GET /api/v1/members/:id/documents
  - [ ] POST /api/v1/members/:id/documents
  - [ ] GET /api/v1/members/:id/family-relations
  - [ ] PUT /api/v1/family-relations/:id
  - [ ] GET /api/v1/members/:id/activities
  - [ ] GET /api/v1/admin/inactivity-config
  - [ ] PUT /api/v1/admin/inactivity-config
  - [ ] GET /api/v1/members/:id/inactivity-check
- [ ] Créer les services:
  - [ ] interviewService
  - [ ] documentService
  - [ ] familyRelationService
  - [ ] activityService
  - [ ] inactivityConfigService

### Frontend (Admin)

- [ ] Créer la page détail membre séparée:
  - [ ] Structure de base avec tabs
  - [ ] Integration des 6 onglets
- [ ] Créer les components:
  - [ ] MemberDetailGeneral (mise à jour)
  - [ ] MemberDetailGroupes (mise à jour)
  - [ ] MemberDetailPresences (mise à jour)
  - [ ] MemberDetailInterviews (nouveau)
  - [ ] MemberDetailDocuments (nouveau)
  - [ ] MemberDetailActivities (nouveau)
  - [ ] MemberDetailTree (nouveau)
  - [ ] InterviewForm (nouveau)
  - [ ] DocumentUpload (nouveau)
  - [ ] FamilyTreeView (nouveau)
  - [ ] MemberInactivityToggle (nouveau)
- [ ] Tester tous les onglets et fonctionnalités

### Tests

- [ ] Tests unitaires des services
- [ ] Tests d'intégration des API routes
- [ ] Tests E2E dans le navigateur

### Documentation

- [ ] Mettre à jour README
- [ ] Ajouter screenshots
- [ ] Documenter les API endpoints
- [ ] Documenter l'usage des nouveaux onglets

---

## 🚀 CHECKLIST D'ACCÈS RAPIDE

### Démarrer l'implémentation

```bash
# 1. Cloner et installer les dépendances
git clone <repo-url>
cd ChurchFlow
pnpm install

# 2. Initialiser la base de données
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev --name add_member_interviews_documents_family_relations

# 3. Construire les types
cd packages/types
pnpm build

# 4. Lancer le serveur de développement
cd apps/api
pnpm dev

# 5. Lancer l'admin (nouvelle fenêtre)
cd apps/admin
pnpm dev
```

### Tests après chaque étape

```bash
# Tester l'API
curl http://localhost:3000/api/v1/members/:id/interviews

# Tester le frontend
# Naviguer vers http://localhost:3001/members/:id
```

---

## 📝 NOTES IMPORTANTES

### Points d'attention

1. **Relation symétrique**: La table FamilyRelation est bidirectionnelle. Quand on crée une relation de A vers B, il faut aussi créer une relation de B vers A.

2. **Indexation**: Pour des performances optimales, assurez-vous d'ajouter des index sur les champs fréquemment queryés.

3. **Permissions**: Les onglets ne sont accessibles que si l'utilisateur a les permissions appropriées.

4. **Stockage de fichiers**: Pour les documents et pièces jointes, prévoir un service de stockage (Storage ou S3) au lieu de stocker les fichiers directement dans la base de données.

5. **Validation**: Valider les données entrantes pour éviter les injections et erreurs.

6. **Erreur handling**: Gérer toutes les erreurs et fournir des messages clairs aux utilisateurs.

### Règles de design

1. **Single source of truth**: Chaque entité a un seul endpoint API correspondant.
2. **Consistent API**: Utiliser les mêmes conventions de nommage et structure de réponse.
3. **Type safety**: Toujours utiliser les types TypeScript définis dans @churchflow/types.
4. **Responsive**: Les composants doivent être responsive sur mobile et desktop.

---

**Document créé le:** 2026-06-19
**Dernière mise à jour:** 2026-06-19
**Responsable:** Senior Dev
**Status:** En attente de validation
