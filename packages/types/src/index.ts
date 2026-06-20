// ============================================================
// Types partagés ChurchFlow
// ============================================================

// --- Enums ---
export type MemberStatus = "SYMPATHISANT" | "MEMBRE" | "RESPONSABLE";

export type MemberGrade =
  | "ASPIRANT"
  | "SERVITEUR"
  | "GAGNEUR_AMES"
  | "ASSISTANT_PASTEUR"
  | "PASTEUR_ASSISTANT"
  | "PASTEUR_TITULAIRE";

export type MemberEchelon = "C2" | "C5" | "C10" | "C20" | "GA_C50" | "GA_C100";

export type GroupType = "DEPARTEMENT" | "TRIBU" | "GEM";

export type FormationType =
  | "ACADEMIE"
  | "BAPTEME"
  | "PORTEURS_DE_VIE"
  | "ECOLE_DES_BERGERS";

export type MeetingType =
  | "CULTE"
  | "TEMPS_DE_PRIERE"
  | "REPETITION"
  | "AGAPE"
  | "AUTRE";

export type Gender = "HOMME" | "FEMME";

export type TransactionType = "ENTREE" | "SORTIE";

export type ExpenseFamily = "FONCTIONNEMENT" | "INVESTISSEMENT" | "EXCEPTIONNEL";

export type PaymentMethod = "ESPECES" | "MOBILE_MONEY" | "CHEQUE" | "VIREMENT";

// --- Entities ---
export interface Church {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate?: Date;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  baptismDate?: Date;
  joinDate: Date;
  isActive: boolean;
  notes?: string;
  status: MemberStatus;
  grade?: MemberGrade;
  echelon?: MemberEchelon;
  churchId: string;
  userId?: string;
  supervisorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  isActive: boolean;
  churchId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Formation {
  id: string;
  name: string;
  description?: string;
  type: FormationType;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  churchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  type: MeetingType;
  date: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
  isRecurrent: boolean;
  tags: string[];
  churchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceCategory {
  id: string;
  name: string;
  flowType: TransactionType;
  family: ExpenseFamily | null;
  color: string | null;
  isDefault: boolean;
  isActive: boolean;
  churchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  label: string;
  amount: number;
  type: TransactionType;
  expenseFamily: ExpenseFamily | null;
  paymentMethod: PaymentMethod;
  date: Date;
  donorName: string | null;
  reference: string | null;
  notes: string | null;
  churchId: string;
  categoryId: string | null;
  category: FinanceCategory | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceDashboard {
  solde: number;
  totalEntrees: number;
  totalSorties: number;
  entreesThisMois: number;
  sortiesByFamily: Record<ExpenseFamily, number>;
  evolution6mois: { label: string; entrees: number; sorties: number }[];
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

// --- Group Members ---
export interface MemberGroup {
  memberId: string;
  groupId: string;
  role?: string;
  joinedAt: Date;
  member: { id: string; firstName: string; lastName: string; status: string };
}

// --- Auth ---
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  churchId: string;
  roles: string[];
}

// ============================================================
// PHASE 1: GESTION MEMBRES & PROFIL
// ============================================================

export enum InterviewType {
  INITIAL = 'INITIAL',
  FOLLOWUP = 'FOLLOWUP',
  ANNUAL = 'ANNUAL',
  SPECIAL = 'SPECIAL'
}

export enum DocumentType {
  ID_CARD = 'ID_CARD',
  BAPTISM_CERTIFICATE = 'BAPTISM_CERTIFICATE',
  MEDICAL_REPORT = 'MEDICAL_REPORT',
  OTHER = 'OTHER'
}

export enum FamilyRelationType {
  PARENT = 'PARENT',
  ENFANT = 'ENFANT',
  SPOUSE = 'SPOUSE',
  SIBLING = 'SIBLING',
  GEM_PARTNER = 'GEM_PARTNER'
}

export interface MemberInterview {
  id: string;
  memberId: string;
  title: string;
  content: string;
  date: Date;
  interviewerId: string;
  interviewerName?: string;
  type: InterviewType | string;
  attachments: string[];
}

export interface MemberDocument {
  id: string;
  memberId: string;
  type: DocumentType | string;
  fileUrl: string;
  fileName?: string;
  uploadedAt: Date;
  uploadedBy: string;
  uploadedByName?: string;
}

export interface FamilyRelation {
  id: string;
  memberId: string;
  relativeId: string;
  relativeName?: string;
  relationType: FamilyRelationType | string;
  isActive: boolean;
}

export interface FamilyIndex {
  id: string;
  memberId: string;
  relationType: FamilyRelationType | string;
  relativeIds: string[];
  lastUpdated: Date;
}

export interface MemberActivity {
  id: string;
  memberId: string;
  date: Date;
  activityType: string;
  activityTypeLabel?: string;
  details: string;
  relatedId?: string;
  relatedType?: string;
  relatedName?: string;
}

export interface InactivityConfig {
  id: string;
  name: string;
  description?: string;
  inactivePeriodDays: number;
  actions: string[];
  isActive: boolean;
  churchId: string;
}
