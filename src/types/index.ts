/**
 * Shared TypeScript types and interfaces for the entire application
 * This file provides type safety and documentation across the codebase
 */

// ============================================================================
// Base Types
// ============================================================================

export type Locale = 'pt' | 'en';

export type UUID = string;

// ============================================================================
// Translation Types
// ============================================================================

export interface Translation {
  language_code: Locale;
}

export interface TreatmentTranslation extends Translation {
  title: string;
  subtitle?: string;
  description?: string;
  short_description?: string;
  benefits?: string;
  procedure?: string;
  aftercare?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface TeamMemberTranslation extends Translation {
  name: string;
  title: string;
  specialty: string;
  credentials?: string;
  bio?: string;
}

export interface FAQTranslation extends Translation {
  question: string;
  answer: string;
}

// ============================================================================
// Database Models
// ============================================================================

export interface Treatment {
  id: UUID;
  slug: string;
  category: string;
  icon_name?: string;
  icon_url?: string;
  hero_image_url?: string;
  display_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  treatment_translations?: TreatmentTranslation[];
}

export interface TeamMember {
  id: UUID;
  slug: string;
  photo_url: string;
  display_order: number;
  email?: string;
  phone?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  team_member_translations?: TeamMemberTranslation[];
  specialties?: UUID[];
  team_member_specialties?: TeamMemberSpecialty[];
}

export interface TeamMemberSpecialty {
  team_member_id: UUID;
  treatment_id: UUID;
  display_order: number;
  treatments?: {
    slug: string;
    treatment_translations?: TreatmentTranslation[];
  };
}

export interface FAQ {
  id: UUID;
  treatment_id?: UUID;
  display_order: number;
  is_published: boolean;
  created_at?: string;
  faq_translations?: FAQTranslation[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Form Data Types (for mutations)
// ============================================================================

export interface TreatmentFormData {
  id?: UUID;
  slug: string;
  category: string;
  icon_name?: string;
  icon_url?: string;
  hero_image_url?: string;
  display_order: number;
  is_published: boolean;
  treatment_translations: TreatmentTranslation[];
}

export interface TeamMemberFormData {
  id?: UUID;
  slug: string;
  photo_url: string;
  display_order: number;
  email?: string;
  phone?: string;
  is_published: boolean;
  team_member_translations: TeamMemberTranslation[];
  specialties?: UUID[];
}

// ============================================================================
// API Query Parameters
// ============================================================================

export interface TreatmentQueryParams {
  locale?: Locale;
  slug?: string;
  category?: string;
  is_published?: boolean;
  limit?: number;
  offset?: number;
}

export interface TeamQueryParams {
  locale?: Locale;
  is_published?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PageParams {
  locale: Locale;
}

export interface PageProps<T = {}> {
  params: Promise<PageParams & T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params: Promise<PageParams>;
}

// ============================================================================
// Storage/Upload Types
// ============================================================================

export type StorageBucket = 'treatment-images' | 'treatment-icons' | 'team-photos';

export interface UploadResult {
  url: string;
  path: string;
  bucket: StorageBucket;
}

export interface UploadError {
  message: string;
  code?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

// ============================================================================
// Filter/Sort Types
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

// ============================================================================
// Admin Types
// ============================================================================

export type AdminTab = 'treatments' | 'team' | 'settings';

export interface AdminState {
  activeTab: AdminTab;
  searchQuery: string;
  loading: boolean;
}

// ============================================================================
// Google Reviews Types
// ============================================================================

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description?: string;
}

export interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  rating?: number;
  user_ratings_total?: number;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isTreatment(obj: any): obj is Treatment {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.is_published === 'boolean'
  );
}

export function isTeamMember(obj: any): obj is TeamMember {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.photo_url === 'string'
  );
}

export function isLocale(value: string): value is Locale {
  return value === 'pt' || value === 'en';
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type AsyncFunction<T = void> = () => Promise<T>;

// ============================================================================
// Constants
// ============================================================================

export const LOCALES: Locale[] = ['pt', 'en'];

export const DEFAULT_LOCALE: Locale = 'pt';

export const STORAGE_BUCKETS: StorageBucket[] = [
  'treatment-images',
  'treatment-icons',
  'team-photos',
];
