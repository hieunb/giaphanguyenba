// ==========================================
// EXTENDED TYPES FOR NEW FEATURES
// Achievements, Funds, Events, Documents
// ==========================================

// ==========================================
// ACHIEVEMENTS MODULE
// ==========================================

export type AchievementType =
  | "education"
  | "career"
  | "culture"
  | "sports"
  | "social"
  | "clan_contribution";

export interface Achievement {
  id: string;
  member_id: string;
  title: string;
  description: string | null;
  achievement_type: AchievementType;
  year: number | null;
  organization: string | null;
  certificate_url: string | null;
  image_url: string | null;
  verified_by: string | null;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementWithMember extends Achievement {
  member: {
    id: string;
    full_name: string;
    generation: number | null;
    avatar_url: string | null;
  };
}

export interface AchievementFormData {
  member_id: string;
  title: string;
  description?: string;
  achievement_type: AchievementType;
  year?: number;
  organization?: string;
  certificate_url?: string;
  image_url?: string;
  is_featured?: boolean;
}

// ==========================================
// FUNDS MODULE
// ==========================================

export type FundType = "clan_fund" | "scholarship_fund";

export type TransactionType = "donation" | "expense" | "scholarship" | "support";

export interface Fund {
  id: string;
  name: string;
  description: string | null;
  fund_type: FundType;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface FundTransaction {
  id: string;
  fund_id: string;
  member_id: string | null;
  amount: number;
  transaction_type: TransactionType;
  description: string | null;
  receipt_url: string | null;
  transaction_date: string;
  recorded_by: string | null;
  created_at: string;
}

export interface FundTransactionWithDetails extends FundTransaction {
  fund: {
    id: string;
    name: string;
    fund_type: FundType;
  };
  member?: {
    id: string;
    full_name: string;
  } | null;
}

export interface FundSummary {
  id: string;
  name: string;
  fund_type: FundType;
  balance: number;
  donor_count: number;
  total_donations: number;
  total_expenses: number;
}

export interface FundTransactionFormData {
  fund_id: string;
  member_id?: string;
  amount: number;
  transaction_type: TransactionType;
  description?: string;
  receipt_url?: string;
  transaction_date: string;
}

// ==========================================
// EVENTS MODULE
// ==========================================

export type EventType =
  | "ancestor_memorial"
  | "clan_meeting"
  | "inauguration"
  | "scholarship"
  | "wedding"
  | "sports"
  | "other";

export type RSVPStatus = "confirmed" | "declined" | "maybe";

export type RecurrenceType = "yearly" | "monthly" | "weekly" | null;

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_lunar: boolean;
  recurrence: RecurrenceType;
  max_attendees: number | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  member_id: string;
  status: RSVPStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendeeWithMember extends EventAttendee {
  member: {
    id: string;
    full_name: string;
    generation: number | null;
    avatar_url: string | null;
  };
}

export interface EventPhoto {
  id: string;
  event_id: string;
  photo_url: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface EventWithAttendance extends Event {
  confirmed_count: number;
  declined_count: number;
  maybe_count: number;
  total_rsvp: number;
  attendees?: EventAttendeeWithMember[];
  photos?: EventPhoto[];
}

export interface EventFormData {
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  location?: string;
  is_lunar?: boolean;
  recurrence?: RecurrenceType;
  max_attendees?: number;
  image_url?: string;
}

export interface RSVPFormData {
  event_id: string;
  member_id: string;
  status: RSVPStatus;
  note?: string;
}

// ==========================================
// DOCUMENTS MODULE
// ==========================================

export type DocumentType =
  | "genealogy"
  | "decree"
  | "stele"
  | "history"
  | "photo"
  | "video"
  | "regulation"
  | "other";

export interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategoryWithChildren extends DocumentCategory {
  children?: DocumentCategory[];
  document_count?: number;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentTag {
  id: string;
  document_id: string;
  tag: string;
  created_at: string;
}

export interface DocumentWithDetails extends Document {
  category?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  tags?: DocumentTag[];
  uploader?: {
    id: string;
    role: string;
  } | null;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  category_id?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  thumbnail_url?: string;
  is_public?: boolean;
  tags?: string[];
}

// ==========================================
// UTILITY TYPES
// ==========================================

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface FilterParams {
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  type: string;
}

// ==========================================
// STATISTICS & ANALYTICS
// ==========================================

export interface AchievementStats {
  achievement_type: AchievementType;
  count: number;
  unique_members: number;
  earliest_year: number | null;
  latest_year: number | null;
}

export interface EventAttendanceStats {
  id: string;
  title: string;
  start_date: string;
  event_type: EventType;
  confirmed_count: number;
  declined_count: number;
  maybe_count: number;
  total_rsvp: number;
}

export interface FundReport {
  fund: Fund;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    opening_balance: number;
    total_donations: number;
    total_expenses: number;
    closing_balance: number;
  };
  transactions: FundTransactionWithDetails[];
  top_donors?: {
    member_id: string;
    full_name: string;
    total_amount: number;
    transaction_count: number;
  }[];
}

// ==========================================
// DASHBOARD WIDGETS
// ==========================================

export interface DashboardStats {
  total_members: number;
  total_achievements: number;
  upcoming_events: number;
  total_documents: number;
  fund_balance: number;
}

export interface UpcomingEvent {
  event: Event;
  days_until: number;
  confirmed_attendees: number;
}

export interface RecentAchievement {
  achievement: Achievement;
  member: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

// ==========================================
// EXPORT FORMATS
// ==========================================

export interface ExportOptions {
  format: "json" | "csv" | "pdf" | "excel";
  include_private?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  filters?: FilterParams;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: {
    row: number;
    error: string;
  }[];
}
