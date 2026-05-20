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

export type TransactionCategory =
  | "OFFRANDE"
  | "DIXIME"
  | "DON"
  | "COTISATION"
  | "ACHAT"
  | "PRESTATAIRE"
  | "AUTRE";

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
  churchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: Date;
  reference?: string;
  notes?: string;
  churchId: string;
  createdAt: Date;
  updatedAt: Date;
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

// --- Auth ---
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  churchId: string;
  roles: string[];
}
