# 📋 LISTE COMPLÈTE - ELEMENTS MANQUANTS / À IMPLEMENTER

## 🎯 PRIORITÉ 1: Gestion Membres & Profil (CRITIQUE)

### 1.1 Page Détail Membre Complet ✅

**CE QUE TU VEUX:**
- Page dédiée complète pour voir toutes les infos d'un membre (pas drawer, page séparée)
- Photo de profil (stockage + affichage)
- Historique des entretiens
- Tous les documents associés
- Arbre généalogique global avec possibilité d'activer/désactiver les types de liaisons (famille, GEM, affiliation département)
- Timeline des activités du membre

**CE QUI EXISTE DÉJÀ:**
- ✅ Relation 1:1 avec User
- ✅ Relation avec MemberGroup (groupes)
- ✅ Relation avec MeetingAttendee (présences)
- ✅ Fields de base: firstName, lastName, email, phone, address, birthDate, baptismDate, joinDate, isActive

**CE QUI MANQUE À IMPLEMENTER:**

1. **Photo de profil**
   - Option de stockage (Storage ou S3)
   - Option d'upload dans la page détail
   - Display avec Tailwind

2. **Historique des entretiens**
   - Table: `MemberInterview`
   - Pour chaque entretien: titre, contenu, date, intervieweur, type (INITIAL, FOLLOWUP, ANNUAL, SPECIAL), pièces jointes

3. **Tous les documents associés**
   - Table: `MemberDocument`
   - Types: ID_CARD, BAPTISM_CERTIFICATE, MEDICAL_REPORT, etc.
   - Pour chaque doc: type, URL, date d'upload

4. **Arbre généalogique avec filtrage**
   - Table: `FamilyRelation`
   - Relations possibles: PARENT, ENFANT, SPOUSE, SIBLING, GEM_PARTNER
   - Chaque relation peut être activée/désactivée individuellement
   - Possibilité de filtrer par type (garder famille, garder GEM, garder affiliation département)
   - Visualisation interactive dans l'interface

5. **Timeline des activités**
   - Table: `MemberActivityTimeline`
   - Pour chaque événement: date, type, détails, ID lié (pour lien avec autre entité)
   - Types: MEETING, FORMATION, GROUP, INTERVIEW, ETC.

**Architecture:**
```prisma
// Entretiens
model MemberInterview {
  id String @id @default(cuid())
  memberId String
  title String
  content String @db.Text
  date DateTime @default(now())
  interviewerId String
  type String // INITIAL, FOLLOWUP, ANNUAL, SPECIAL
  attachments String[]

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
  interviewer Member? @relation(fields: [interviewerId], references: [id])
}

// Documents
model MemberDocument {
  id String @id @default(cuid())
  memberId String
  type String // ID_CARD, BAPTISM_CERTIFICATE, MEDICAL_REPORT, ETC.
  fileUrl String
  uploadedAt DateTime @default(now())
  uploadedBy String

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}

// Relations de parenté et GEMs
model FamilyRelation {
  id String @id @default(cuid())
  memberId String
  relativeId String
  relationType String // PARENT, ENFANT, SPOUSE, SIBLING, GEM_PARTNER
  isActive Boolean @default(true) // Pour activer/désactiver les liaisons

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
  relative Member @relation("FamilyRelations", fields: [relativeId], references: [id], onDelete: Cascade)
}

// Index pour les recherches rapides
model FamilyIndex {
  id String @id @default(cuid())
  memberId String
  relationType String
  relativeIds String[] // Tous les IDs des membres avec cette relation
  lastUpdated DateTime @updatedAt
}

// Timeline d'activités
model MemberActivityTimeline {
  id String @id @default(cuid())
  memberId String
  date DateTime
  activityType String
  details String
  relatedId String? // Pour lier à autre entité (ex: meetingId, formationId)
  relatedType String? // Pour identifier l'entité liée

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}
```

**Interfaces TypeScript:**
```typescript
// packages/types/src/index.ts
export interface MemberInterview {
  id: string
  memberId: string
  title: string
  content: string
  date: Date
  interviewerId: string
  type: InterviewType
  attachments: string[]
}

export enum InterviewType {
  INITIAL = 'initial',
  FOLLOWUP = 'followup',
  ANNUAL = 'annual',
  SPECIAL = 'special'
}

export interface MemberDocument {
  id: string
  memberId: string
  type: DocumentType
  fileUrl: string
  uploadedAt: Date
  uploadedBy: string
}

export enum DocumentType {
  ID_CARD = 'id_card',
  BAPTISM_CERTIFICATE = 'baptism_certificate',
  MEDICAL_REPORT = 'medical_report',
  OTHER = 'other'
}

export interface FamilyRelation {
  id: string
  memberId: string
  relativeId: string
  relationType: FamilyRelationType
  isActive: boolean
}

export enum FamilyRelationType {
  PARENT = 'parent',
  CHILD = 'child',
  SPOUSE = 'spouse',
  SIBLING = 'sibling',
  GEM_PARTNER = 'gem_partner'
}

export interface MemberActivity {
  id: string
  memberId: string
  date: Date
  activityType: string
  details: string
  relatedId?: string
  relatedType?: string
}
```

---

### 1.2 Statuts Membres: Actif/Inactif ✅

**CE QUE TU VEUX:**
- Garder le champ `isActive: boolean` actuel avec son sens original (true = actif, false = inactif)
- Quand un membre est inactif, il reste visible partout mais avec indication visuelle (point rouge ou gris)
- Conditions d'inactivité: Quand le système n'enregistre rien de positif concernant la personne pendant une certaine période
- Liste des actions qui renouvellent le décompte doit être facilement modifiable depuis l'interface

**CE QUI EXISTE DÉJÀ:**
- ✅ Champ `isActive: boolean` dans le model Member

**CE QUI MANQUE À IMPLEMENTER:**

1. **Configuration des conditions d'inactivité**
   - Liste configurable des actions qui "réveillent" un membre
   - Période configurable pour le décompte
   - Interface d'administration pour cette configuration

2. **Indication visuelle dans l'interface**
   - Badge rouge ou gris pour les membres inactifs
   - Différentiation visuelle des listes
   - Notification pour les membres récemment marqués inactifs

**Architecture:**
```prisma
model InactivityConfig {
  id String @id @default(cuid())
  name String
  description String?
  inactivePeriodDays Int // Nombre de jours sans activité pour devenir inactif
  actions String[] // Actions qui comptent comme activité: MEETING, FORMATION, GROUP, ETC.
  isActive Boolean @default(true)
  churchId String

  church Church @relation(fields: [churchId], references: [id])
}

model Member {
  // ... existing fields

  isActive Boolean @default(true) // true = actif, false = inactif
}

// Utilitaire pour vérifier si un membre doit être marqué inactif
// Deux options:
// 1. Créer un background job qui marque les membres inactifs
// 2. Créer une fonction qui peut être appelée quand on a besoin
```

**Interfaces TypeScript:**
```typescript
// packages/types/src/index.ts
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
  nextActionNeeded: string // Action qui doit être faite pour réactiver
}
```

---

### 1.3 Relations de Parenté & GEMs ✅

**CE QUE TU VEUX:**
- Table séparée pour les relations (flexible, pas couplée avec le système)
- Arbre généalogique total de la communauté
- Possibilité d'activer/désactiver les liaisons individuellement
- Possibilité de filtrer les types de liaisons dans l'interface (famille, GEM, affiliation département)
- Relations GEMs doivent être facilement identifiables mais indépendantes du système de groupes

**CE QUI EXISTE DÉJÀ:**
- ✅ Hiérarchie supervisé via `supervisorId`
- ✅ Relation avec groupes via `MemberGroup`
- ✅ Relation avec formations via `MemberFormation`

**CE QUI MANQUE À IMPLEMENTER:**

1. **Table des relations familiales**
   - Table: `FamilyRelation` (déjà défini dans 1.1)

2. **Index des relations**
   - Table: `FamilyIndex` (déjà défini dans 1.1)

3. **Interface de visualisation avec filtrage**
   - Vue globale de tous les membres avec leurs liaisons
   - Filtres par type de liaison (famille, GEM, département)
   - Switch individuel pour activer/désactiver chaque liaison
   - Arborescence interactive

**Architecture:**
```prisma
model FamilyRelation {
  id String @id @default(cuid())
  memberId String
  relativeId String
  relationType String // PARENT, ENFANT, SPOUSE, SIBLING, GEM_PARTNER
  isActive Boolean @default(true)

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
  relative Member @relation("FamilyRelations", fields: [relativeId], references: [id], onDelete: Cascade)
}

model FamilyIndex {
  id String @id @default(cuid())
  memberId String
  relationType String
  relativeIds String[]
  lastUpdated DateTime @updatedAt
}
```

**Frontend:**
```typescript
// Interface de filtrage des liaisons
interface FamilyRelationFilter {
  includeFamily: boolean      // Inclure les relations de famille
  includeGem: boolean         // Inclure les relations GEM
  includeDepartment: boolean  // Inclure les affiliations département
  includeHierarchy: boolean   // Inclure la hiérarchie supervisé
}

// Component pour afficher la visualisation avec filtres
interface FamilyTreeViewProps {
  memberId: string
  filters: FamilyRelationFilter
  onRelationToggle: (relationId: string, isActive: boolean) => void
}

// Exemple d'utilisation dans le detail page
<FamilyTreeView
  memberId={currentMember.id}
  filters={{
    includeFamily: true,
    includeGem: true,
    includeDepartment: true,
    includeHierarchy: true
  }}
/>
```

---

### 1.4 Dashboard Membre Personnel - SUPPRIMÉ ✅

**IMPORTANT:** Tu m'as indiqué qu'il n'y a PAS de dashboard personnel pour le moment.
- Membres et responsables seront bloqués à la connexion (message: "pas d'accès pour le moment")
- Ils auront leur propre plateforme séparée pour se connecter
- Le dashboard que nous sommes en train de modifier est le dashboard admin
- Dans le dashboard admin, lorsqu'on est dans la page détail d'un membre, on pourra voir ses entretiens, ses documents, et tout

---

## 🎯 PRIORITÉ 2: Gestion GEMs (Binômes) - CRITIQUE

### 2.1 Chef de GEM ✅

**CE QUE TU VEUX:**
- Définir le chef de chaque GEM
- Distinction chef vs membres dans GEM
- Permission spéciale pour le chef (surtout pour les rapports)

**CE QUI EXISTE DÉJÀ:**
- ✅ Relation avec groupes via `MemberGroup`
- ✅ Chaque membre peut être dans un groupe (type GEM)

**CE QUI MANQUE À IMPLEMENTER:**

1. **Champ spécial pour le chef de GEM**
   - Ajouter `gemRole` dans la relation `MemberGroup`
   - Valeurs possibles: CHEF_GEM, RESPONSABLE_GEM, MEMBRE

2. **Validation de l'unicité du chef par GEM**
   - Un seul membre par GEM peut être chef

**Architecture:**
```prisma
model MemberGroup {
  // ... existing fields

  gemRole String? // CHEF_GEM, RESPONSABLE_GEM, MEMBRE
}

// Pour assurer l'unicité du chef par GEM
// On peut ajouter un index unique ou une contrainte
// Ou faire la validation dans le code
```

**Interfaces TypeScript:**
```typescript
export enum GemRole {
  CHEF_GEM = 'chef_gem',
  RESPONSABLE_GEM = 'responsable_gem',
  MEMBRE = 'membre'
}
```

---

### 2.2 Menu GEM Spécifique ✅

**CE QUE TU VEUX:**
- Menu dédié "GEMs" dans la navigation
- Section: Binômes et Rapports
- Vue de tous les GEMs du groupe
- Vue de tous les GEMs du système

**CE QUI EXISTE DÉJÀ:**
- ✅ Vue des groupes avec types GEM
- ✅ Interface de gestion des groupes

**CE QUI MANQUE À IMPLEMENTER:**

1. **Menu GEM dans la navigation**
   - Nouveau menu item "GEMs"
   - Sous-menus: "Binômes" et "Rapports"

2. **Page de visualisation des GEMs**
   - Vue de tous les GEMs du groupe (filtré par churchId)
   - Vue de tous les GEMs du système
   - Switch pour basculer entre les deux vues

**Architecture:**
```prisma
// Mapping des binômes GEM
model GemConnection {
  id String @id @default(cuid())
  gemId String
  mapping String[] // IDs des membres du binôme (généralement 2 membres)
  isActive Boolean @default(true)

  group Group @relation(fields: [gemId], references: [id])
}
```

**Interfaces TypeScript:**
```typescript
export enum GemView {
  GROUP_GEMS = 'group_gems',      // GEMs du groupe actuel
  SYSTEM_GEMS = 'system_gems',    // Tous les GEMs
}

export interface GemViewProps {
  view: GemView
  currentGroupId?: string
  churchId: string
}

// Component pour la page des GEMs
interface GEMsPageProps {
  view: GemView
  currentGroupId?: string
  churchId: string
}
```

---

### 2.3 Rapports GEM ✅

**CE QUE TU VEUX:**
- Formulaire de rapport pour le responsable GEM
- Types de rapports: Activités, Finances, Membres
- Historique des rapports
- Le responsable GEM a besoin de se connecter à la plateforme admin pour faire ses rapports
- Formulaire spécialisé pour les rapports GEM

**CE QUI EXISTE DÉJÀ:**
- ✅ Modèle de groupes avec type GEM
- ✅ Système d'authentification avec Rôles
- ✅ Possibilité de filtrer par responsable (superviseurId)

**CE QUI MANQUE À IMPLEMENTER:**

1. **Table des rapports GEM**
   - Table: `GemReport`
   - Pour chaque rapport: période, type, contenu, status

2. **Formulaire de rapport spécialisé**
   - Interface dédiée pour les rapports GEM
   - Types de rapports: ACTIVITES, FINANCES, MEMBRES
   - Validation des données selon le type

3. **Permissons**
   - Responsable GEM peut accéder au formulaire
   - Les autres utilisateurs n'ont pas accès

**Architecture:**
```prisma
model GemReport {
  id String @id @default(cuid())
  gemId String
  reporterId String
  period String // mensuel, trimestriel, annuel
  reportType String // ACTIVITES, FINANCES, MEMBRES
  content String @db.Text
  submittedAt DateTime @default(now())
  status String // DRAFT, SUBMITTED, APPROVED

  gem Group @relation(fields: [gemId], references: [id])
  reporter Member @relation(fields: [reporterId], references: [id])
}

// Pour s'assurer qu'un responsable ne fait qu'un seul rapport par période
// Option 1: Index unique sur (gemId, period)
// Option 2: Validation dans le code
```

**Interfaces TypeScript:**
```typescript
export enum GemReportType {
  ACTIVITES = 'activites',
  FINANCES = 'finances',
  MEMBRES = 'membres'
}

export enum GemReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved'
}

export interface GemReport {
  id: string
  gemId: string
  reporterId: string
  period: string
  reportType: GemReportType
  content: string
  submittedAt: Date
  status: GemReportStatus
}
```

---

## 🎯 PRIORITÉ 3: Hiérarchie & Rôles (IMPORTANT)

### 3.1 Hiérarchie Pasteurs Détaillée ✅

**CE QUE TU VEUX:**
- Niveaux pasteurs: SUPERVISEUR, RÉSIDENT, PAYS, ZONE, SOUS-ZONE
- Mapping des pasteurs vers ces niveaux
- Permissions par niveau hiérarchique

**CE QUI EXISTE DÉJÀ:**
- ✅ `supervisorId` dans Member pour la hiérarchie supervisé
- ✅ Liste des pasteurs comme membres avec rôle spécifique
- ✅ Restriction d'accès aux infos membres (via permissions)

**CE QUI MANQUE À IMPLEMENTER:**

1. **Enum PastorLevel** pour les 5 niveaux
2. **Mapping pastor vers niveau** (table ou champ dans Member)
3. **Validation des relations pastorales** (un superviseur ne peut avoir qu'un sous-superviseur direct, etc.)

**Architecture:**
```prisma
enum PastorLevel {
  SUPERVISEUR,      // Chef de zone
  RÉSIDENT,         // Pasteur résident dans église
  PAYS,             // Pasteur pour tout le pays
  ZONE,             // Pasteur d'une zone géographique
  SOUS_ZONE         // Chef de sous-zone
}

// Option 1: Ajouter pastorLevel dans Member (simplifié)
model Member {
  // ... existing fields

  pastorLevel? PastorLevel // NULL pour les non-pasteurs
}

// Option 2: Table dédiée (plus flexible, permet plusieurs pasteurs)
model PastorHierarchy {
  id String @id @default(cuid())
  memberId String @unique
  level PastorLevel
  zoneId String // Zone géographique de ce pasteur
  supervisorId String? // ID du pasteur supervisé
  isActive Boolean @default(true)

  member Member @relation(fields: [memberId], references: [id])
  supervisor PastorHierarchy? @relation("PastorSupervision", fields: [supervisorId], references: [id])
  subordinates PastorHierarchy[] @relation("PastorSupervision")

  // Index pour les recherches rapides
  @@index([zoneId])
  @@index([level])
  @@index([supervisorId])
}
```

---

### 3.2 Permissions Hiérarchiques ✅

**CE QUE TU VEUX:**
- Responsable: accès limité aux infos membres (pas le suivi détaillé)
- Seuls les pasteurs ou responsables directs ont accès au suivi
- Le suivi est spécial: uniquement pour les pasteurs ou responsables directs de la personne

**CE QUI EXISTE DÉJÀ:**
- ✅ RBAC avec rôles et permissions
- ✅ Restriction d'accès par rôles
- ✅ Relation supervisorId pour identifier les responsables directs

**CE QUI MANQUE À IMPLEMENTER:**

1. **Permission d'accès au suivi détaillé**
   - Nouvelle permission: `FOLLOWUP_ACCESS`
   - Limitation: réservée aux pasteurs ou responsables directs

2. **Middleware de restriction**
   - Vérifie si l'utilisateur a le droit d'accéder au suivi

**Architecture:**
```typescript
// packages/auth/src/permissions.ts
export const HIERARCHY_PERMISSIONS = {
  // Accès aux données membres (limité)
  VIEW_MEMBER_INFO: 'member:view_info', // Voir infos basiques
  FOLLOWUP_ACCESS: 'member:followup_access', // Accès au suivi détaillé

  // Accès aux rapports
  CREATE_GEM_REPORT: 'gem:create_report',
  VIEW_GEM_REPORTS: 'gem:view_reports',

  // Accès aux formations
  VIEW_FORMATION: 'formation:view',
  ENROLL_IN_FORMATION: 'formation:enroll'
} as const;

// Middleware de restriction pour le suivi
export function requireFollowupAccess(
  currentUser: Member,
  targetMemberId: string
): boolean {
  // Cas 1: Membre connecté = pas d'accès au suivi
  if (!currentUser.hasRole) return false;

  // Cas 2: Responsable direct (superviseur direct)
  // targetMember.supervisorId === currentUser.id
  if (targetMember.supervisorId === currentUser.id) return true;

  // Cas 3: Pasteur ou superviseur hiérarchique
  if (currentUser.pastorLevel && targetMember.pastorLevel) {
    if (currentUser.pastorLevel === PastorLevel.PAYS) return true; // Pasteur pays voit tout
    if (currentUser.pastorLevel === PastorLevel.ZONE) {
      // Pasteur zone voit sa zone
      if (targetMember.zoneId === currentUser.zoneId) return true;
    }
    // Cas 4: Pasteur supervisé (détail à définir selon ta hiérarchie)
    if (currentUser.pastorLevel === PastorLevel.SUPERVISEUR) {
      // Superviseur voit ses sous-superviseurs
      if (isSubordinate(currentUser.id, targetMemberId)) return true;
    }
  }

  return false;
}

// Fonction helper pour vérifier si un membre est subordonné
function isSubordinate(
  supervisorId: string,
  memberId: string
): boolean {
  // Vérifier via la hiérarchie pastorale
  // Ou vérifier via la hiérarchie member (supervisorId)
  // À définir selon ton organisation
  return false;
}
```

---

### 3.3 Organisations Spécifiques ✅

**CE QUE TU VEUX:**
- Types: MAISON_D'HONNEUR, CELLULE, ASSEMBLÉE
- Actions spécifiques selon le type
- Gestion des organisations avec types uniques

**CE QUI EXISTE DÉJÀ:**
- ✅ Enum `GroupType` dans le code (peut être élargi)
- ✅ Structure de groupes avec types
- ✅ Relation MemberGroup pour les membres dans les groupes

**CE QUI MANQUE À IMPLEMENTER:**

1. **Étendre GroupType** avec les nouveaux types
2. **Actions spécifiques par type** (si nécessaires)
3. **Validation des actions selon le type**

**Architecture:**
```prisma
// Étendre l'enum existant
enum GroupType {
  DEPARTEMENT
  TRIBU
  GEM
  MAISON_D_HONNEUR
  CELLULE
  ASSEMBLEE
  // ... d'autres types selon besoin
}

// Pour les actions spécifiques par type
// Option 1: Metadata dans Group
model Group {
  // ... existing fields

  actions Json @default("{}") // Ex: { "MAISON_D_HONNEUR": ["recolte"], "CELLULE": ["reunion"] }
}

// Option 2: Table séparée (plus flexible)
model OrganizationAction {
  id String @id @default(cuid())
  groupId String
  actionType String // RECOLTE, COLLECTE, REUNION, ETC.
  scheduledDate DateTime?
  assignedToId String?
  status String // PLANNED, IN_PROGRESS, COMPLETED
  notes String?

  group Group @relation(fields: [groupId], references: [id])
  assignedTo Member? @relation(fields: [assignedToId], references: [id])
}
```

---

## 🎯 PRIORITÉ 4: Formation & Académie (IMPORTANT)

### 4.1 Module Formation = Admin Plateforme Académie ✅

**CE QUE TU VEUX:**
- Administration complète de la plateforme académémie
- Tous les membres ne se connectent pas
- Les gestionnaires ajoutent les membres dans les classes
- Système d'invitation par code

**CE QUI EXISTE DÉJÀ:**
- ✅ Entités Formation et MemberFormation
- ✅ Types de formations existants (Baptême, Porteurs de vie, École des bergers)
- ✅ Relation entre membres et formations

**CE QUI MANQUE À IMPLEMENTER:**

1. **Classes/cohorts**
   - Table: `FormationClass`
   - Pour chaque formation: année, dates, max étudiants, statut

2. **Enrollment (inscriptions)**
   - Table: `ClassEnrollment`
   - Pour chaque membre: date d'inscription, progression, notes, certificat

3. **Planning des cours**
   - Table: `ClassSchedule`
   - Pour chaque cours: date, sujet, enseignant, lieu

4. **Invitations par gestionnaires**
   - Table: `ClassInvitation`
   - Code unique pour chaque classe
   - Pour permettre aux gestionnaires d'ajouter des membres

**Architecture:**
```prisma
// Classes/cohorts
model FormationClass {
  id String @id @default(cuid())
  formationId String
  name String // Ex: "2024 - Porteurs de vie - Cohorte 1"
  year Int
  startDate DateTime
  endDate DateTime
  maxStudents Int?
  isActive Boolean @default(true)
  invitationCode String @unique // Pour les gestionnaires

  formation Formation @relation(fields: [formationId], references: [id])
  enrollments ClassEnrollment[]
  schedules ClassSchedule[]
}

// Enrollments
model ClassEnrollment {
  id String @id @default(cuid())
  classId String
  memberId String
  enrolledAt DateTime @default(now())
  progress Int @default(0) // 0-100
  grade String?
  certificateUrl String?

  formationClass FormationClass @relation(fields: [classId], references: [id])
  member Member @relation(fields: [memberId], references: [id])
}

// Planning des cours
model ClassSchedule {
  id String @id @default(cuid())
  classId String
  date DateTime
  topic String
  teacherId String
  location String?
  notes String?

  formationClass FormationClass @relation(fields: [classId], references: [id])
  teacher Member @relation(fields: [teacherId], references: [id])
}

// Invitations pour gestionnaires
model ClassInvitation {
  id String @id @default(cuid())
  invitationCode String @unique
  classId String
  email String // Email du gestionnaire
  status String // PENDING, ACCEPTED, REJECTED
  acceptedAt DateTime?
  acceptedEmail String?

  formationClass FormationClass @relation(fields: [classId], references: [id])
}
```

**Interfaces TypeScript:**
```typescript
// packages/types/src/index.ts
export interface FormationClass {
  id: string
  formationId: string
  name: string
  year: number
  startDate: Date
  endDate: Date
  maxStudents?: number
  isActive: boolean
  invitationCode: string
}

export interface ClassEnrollment {
  id: string
  classId: string
  memberId: string
  enrolledAt: Date
  progress: number // 0-100
  grade?: string
  certificateUrl?: string
}

export interface ClassSchedule {
  id: string
  classId: string
  date: Date
  topic: string
  teacherId: string
  location?: string
  notes?: string
}

export interface ClassInvitation {
  id: string
  invitationCode: string
  classId: string
  email: string
  status: string
  acceptedAt?: Date
  acceptedEmail?: string
}
```

---

## 🎯 PRIORITÉ 5: RDV & Chatbot (IMPORTANT)

### 5.1 Gestion Demandes RDV via Chatbot ✅

**CE QUE TU VEUX:**
- Formulaire de demande de RDV
- Flux de validation/approbation
- Intégration chatbot pour prise de RDV
- Gestion des plages horaires disponibles
- Notifications automatiques

**CE QUI EXISTE DÉJÀ:**
- ✅ Système de réunions existant
- ✅ Relation MeetingAttendee pour les présences
- ✅ Authentification pour les utilisateurs

**CE QUI MANQUE À IMPLEMENTER:**

1. **Demandes de RDV**
   - Table: `AppointmentRequest`
   - Pour chaque demande: titre, description, date préférée, statut

2. **Session chatbot**
   - Table: `ChatbotSession`
   - Pour suivre la progression des demandes via chat

3. **Flux de validation**
   - Status: PENDING, APPROVED, REJECTED, COMPLETED

**Architecture:**
```prisma
model AppointmentRequest {
  id String @id @default(cuid())
  title String
  description String?
  preferredDate DateTime?
  status String // PENDING, APPROVED, REJECTED, COMPLETED
  assignedToId String?

  assignedTo Member? @relation(fields: [assignedToId], references: [id])
}

model ChatbotSession {
  id String @id @default(cuid())
  memberId String
  messages Json[]
  currentStep String?
  isActive Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  member Member @relation(fields: [memberId], references: [id])
}
```

---

## 🎯 PRIORITÉ 6: Interface & UX (IMPORTANT)

### 6.1 Panel Gauche Monochrome Hiérarchique ✅

**CE QUE TU VEUX:**
- Arborescence interactive des églises/zones
- Filtrer par niveau hiérarchique
- Vue synthétique par niveau
- Navigation rapide vers les entités
- Mode monochrome pour clarté

**CE QUI EXISTE DÉJÀ:**
- ✅ Panel gauche générique
- ✅ Navigation avec le router

**CE QUI MANQUE À IMPLEMENTER:**

1. **Structure de données hiérarchique**
   - Interface: `HierarchyNode`
   - Types: CHURCH, ZONE, SUBZONE, GROUP, GEM

2. **Component de visualisation**
   - Arborescence interactive
   - Filtres par niveau hiérarchique
   - Navigation rapide

3. **Mode monochrome**
   - Design en gris/un pour clarté

**Architecture:**
```typescript
interface HierarchyNode {
  id: string
  name: string
  type: 'CHURCH' | 'ZONE' | 'SUBZONE' | 'GROUP' | 'GEM'
  level: number
  children?: HierarchyNode[]
}

interface NavigationFilter {
  level?: number
  type?: GroupType
  churchId?: string
}

// Component pour la navigation hiérarchique
interface HierarchyPanelProps {
  churchId?: string
  filters: NavigationFilter
  onNodeSelect: (node: HierarchyNode) => void
}
```

---

### 6.2 Profil Complet - Tout les Entretiens ✅

**CE QUE TU VEUX:**
- Dans le dashboard admin, quand on est dans la page détail d'un membre, on pourra voir ses entretiens, ses documents, et tout
- Pas besoin de créer un dashboard personnel pour le moment

**CE QUI EXISTE DÉJÀ:**
- ✅ Page de détail membre existante
- ✅ Tabs Général/Groupes/Présences

**CE QUI MANQUE À IMPLEMENTER:**

1. **Nouvel onglet "Entretiens" dans la page détail**
   - Liste de tous les entretiens
   - Possibilité d'ajouter un nouvel entretien
   - Possibilité de voir le contenu complet

2. **Nouvel onglet "Documents" dans la page détail**
   - Liste de tous les documents
   - Possibilité d'ajouter un nouveau document
   - Possibilité de télécharger/voir

3. **Nouvel onglet "Arbre généalogique" dans la page détail**
   - Vue réduite pour un membre spécifique
   - Possibilité d'activer/désactiver les liaisons

**Architecture:**
```typescript
// Déjà défini dans 1.1 (MemberInterview, MemberDocument, FamilyRelation)
```

---

## 📊 COMPARAISON SYNTHÉTIQUE

| Fonctionnalité | ChurchFlow (Actuel) | Eglise360 | Priorité | Commenté par toi |
|---|---|---|---|---|
| **Page détail membre complet** | ⚠️ Drawer basique | ✅ Page complète | 1 | **B - Page séparée** |
| **Photo profil** | ✅ Field | ✅ Avatar | 1 | Garder isActive (true=actif) |
| **Formulaire ressencement** | ❌ | ✅ | - | **Pas nécessaire** (tu contactes physiquement) |
| **Historique entretiens** | ❌ | ✅ | 1 | ✅ Table MemberInterview |
| **Documents membres** | ❌ | ✅ | 1 | ✅ Table MemberDocument |
| **Arbre généalogique** | ❌ | ✅ | 1 | ✅ Table FamilyRelation avec filtrage |
| **Actif/Inactif** | ⚠️ isActive boolean | ✅ Actif/Inactif | 1 | **Garder isActive** (true=actif) |
| **Conditions d'inactivité** | ❌ | ❌ | 1 | ✅ Table InactivityConfig |
| **Hiérarchie pasteurs** | ⚠️ Supervisor | ✅ 5 niveaux | 3 | ✅ Enum PastorLevel |
| **Permissions hiérarchiques** | ⚠️ RBAC | ✅ Complexe | 3 | ✅ requireFollowupAccess |
| **Dashboard personnel** | ❌ | ✅ | - | **Supprimé - Pas besoin** |
| **RDV via chatbot** | ❌ | ✅ | 5 | ✅ Tables AppointmentRequest |
| **Formation admin** | ⚠️ Types | ✅ Académie complète | 4 | ✅ Classes, Enrollments, Planning |
| **GEMs chef** | ❌ | ⚠️ | 2 | ✅ gemRole dans MemberGroup |
| **Menu GEM** | ❌ | ❌ | 2 | ✅ Menu dédié avec views |
| **Rapports GEM** | ❌ | ❌ | 2 | ✅ Table GemReport |
| **Panel hiérarchique** | ❌ | ⚠️ | 6 | ✅ Interface HierarchyNode |
| **Entretiens complets** | ❌ | ✅ | 1 | ✅ Table MemberInterview |

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### **PHASE 1 (M1-M2) - CRITIQUE**
1. ✅ Modifier page détail membre pour la rendre complète (onglets: Entretiens, Documents, Arbre)
2. ✅ Ajouter statut Actif/Inactif (garder isActive avec true=actif)
3. ✅ Ajouter conditions d'inactivité (configurable, actions qui renouvellent le décompte)
4. ✅ Créer tables MemberInterview, MemberDocument, FamilyRelation, FamilyIndex, MemberActivityTimeline
5. ✅ Créer InactivityConfig pour les conditions
6. ✅ Ajouter chef de GEM (gemRole) et menu GEM dédié
7. ✅ Créer table GemReport et formulaire spécialisé
8. ✅ Implémenter requireFollowupAccess pour les permissions hiérarchiques

### **PHASE 2 (M2-M3) - IMPORTANT**
9. ✅ Implémenter hiérarchie pasteurs détaillée (5 niveaux)
10. ✅ Étendre GroupType avec MAISON_D_HONNEUR, CELLULE, ASSEMBLÉE
11. ✅ Créer système RDV via chatbot (AppointmentRequest, ChatbotSession)
12. ✅ Créer module formation = admin académie complet (FormationClass, ClassEnrollment, ClassSchedule, ClassInvitation)

### **PHASE 3 (M3+) - AVANCÉ**
13. ✅ Créer panel hiérarchique monochrome pour la navigation
14. ✅ Ajouter certificats de formation
15. ✅ Intégrer notifications système

---

## 💡 RÉSUMÉ TECHNIQUE

**Tables à créer:**
1. ✅ MemberInterview - Historique des entretiens
2. ✅ MemberDocument - Documents membres
3. ✅ FamilyRelation - Relations parenté et GEMs
4. ✅ FamilyIndex - Index pour recherches rapides
5. ✅ MemberActivityTimeline - Timeline des activités
6. ✅ InactivityConfig - Conditions d'inactivité
7. ✅ GemReport - Rapports GEM
8. ✅ GemConnection - Mapping des binômes GEM
9. ✅ PastorHierarchy - Hiérarchie pasteurs
10. ✅ FormationClass - Classes/cohorts formations
11. ✅ ClassEnrollment - Inscriptions formations
12. ✅ ClassSchedule - Planning cours
13. ✅ ClassInvitation - Invitations gestionnaires
14. ✅ AppointmentRequest - Demandes RDV
15. ✅ ChatbotSession - Sessions chatbot

**Enums à créer/étendre:**
1. ✅ InterviewType - Types d'entretiens
2. ✅ DocumentType - Types de documents
3. ✅ FamilyRelationType - Types de relations
4. ✅ GemRole - Rôles dans GEMs
5. ✅ GemReportType - Types de rapports GEM
6. ✅ GemReportStatus - Status des rapports
7. ✅ PastorLevel - Niveaux pasteurs
8. ✅ GemView - Vues pour les GEMs
9. ✅ GroupType - Étendre avec MAISON_D_HONNEUR, CELLULE, ASSEMBLÉE

**Middleware à créer:**
1. ✅ requireFollowupAccess - Restriction d'accès au suivi détaillé
2. ✅ isSubordinate - Vérifier si membre est subordonné

---

## 📝 NOTES ADDITIONNELLES

### Rôles et Permissions
- Membre connecté: Pas de rôle dans le système (pas d'accès au suivi)
- Responsable: Accès limité aux infos membres (pas le suivi détaillé)
- Seuls les pasteurs ou responsables directs ont accès au suivi détaillé
- Responsable GEM: Access admin pour faire les rapports

### Flux Formation
- Tous les membres ne se connectent pas à la plateforme admin
- Les gestionnaires ajoutent les membres dans les classes via code d'invitation
- Les gestionnaires reçoivent une invitation par email

### Hiérarchie des Pasteurs
- Superviseur (chef de zone)
- Résident (pasteur résident dans église)
- Pays (pasteur pour tout le pays)
- Zone (pasteur d'une zone géographique)
- Sous-zone (chef de sous-zone)

### Responsables GEM
- Responsable: Ceux qui sont sous un pasteur
- Chef de GEM: Un responsable spécifique par GEM
- Le responsable GEM a le status de responsable
- Il a besoin de se connecter à la plateforme admin pour faire ses rapports
- Formulaire spécialisé pour les rapports GEM

### Conditions d'Inactivité
- Actions qui renouvellent le décompte: MEETING, FORMATION, GROUP, ETC.
- Période configurable (ex: 6 mois sans activité)
- Liste d'actions modifiable dans l'interface admin

### Dashboard
- Supprimé le concept de dashboard personnel pour le moment
- Tous les membres seront bloqués à la connexion avec message explicite
- Le dashboard admin sera le seul dashboard pour l'instant

---

**Date de mise à jour:** 2026-06-19
**Analyse basée sur:** Notes de l'utilisateur + Analyse ChurchFlow vs Eglise360
**Approche:** Senior Dev - Valider avec l'utilisateur avant implémentation
