/**
 * TypeScript types for Strapi-like CMS system
 * Comprehensive type definitions for dynamic content management
 */

// ============================================================================
// CONTENT TYPES
// ============================================================================

export type ContentTypeKind = 'collectionType' | 'singleType';

export interface ContentType {
  id: string;
  name: string; // Internal name (e.g., 'blog_posts')
  display_name: string; // Display name (e.g., 'Blog Posts')
  singular_name: string; // Singular name (e.g., 'Blog Post')
  description?: string;
  icon?: string; // Lucide icon name
  kind: ContentTypeKind;
  draftable: boolean;
  publishable: boolean;
  reviewable: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FIELD TYPES
// ============================================================================

export type FieldType =
  // Basic types
  | 'text'
  | 'richtext'
  | 'email'
  | 'password'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'float'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'enumeration'
  | 'json'
  // Advanced types
  | 'media'
  | 'relation'
  | 'component'
  | 'dynamiczone'
  | 'uid';

export interface ContentTypeField {
  id: string;
  content_type_id: string;
  name: string; // Field name (e.g., 'title')
  display_name: string; // Display name for UI
  type: FieldType;
  required: boolean;
  is_unique: boolean;
  translatable: boolean; // Whether this field supports i18n
  default_value?: string;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  regex_pattern?: string;
  options: FieldOptions;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Field-specific options
export interface FieldOptions {
  // For enumeration
  choices?: Array<{ label: string; value: string }>;

  // For media
  allowed_types?: ('images' | 'videos' | 'files' | 'audios')[];
  multiple?: boolean;

  // For relation
  target_content_type?: string;
  relation_type?: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  inverse_name?: string;

  // For component
  component_id?: string;
  repeatable?: boolean;
  min_items?: number;
  max_items?: number;

  // For dynamiczone
  allowed_components?: string[];

  // For uid
  target_field?: string; // Field to generate slug from

  // For richtext
  editor_toolbar?: string[];

  // Additional options
  [key: string]: any;
}

// ============================================================================
// DYNAMIC CONTENT
// ============================================================================

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface DynamicContent {
  id: string;
  content_type_id: string;
  status: ContentStatus;
  published_at?: string;
  data: Record<string, any>; // Non-translatable fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;

  // Relations (populated on fetch)
  content_type?: ContentType;
  translations?: DynamicContentTranslation[];
}

export interface DynamicContentTranslation {
  id: string;
  content_id: string;
  language_code: string;
  data: Record<string, any>; // Translatable fields
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export interface Component {
  id: string;
  name: string; // e.g., 'seo_metadata'
  display_name: string;
  category?: string; // e.g., 'shared', 'page-sections'
  icon?: string;
  description?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Relations (populated on fetch)
  fields?: ComponentField[];
}

export interface ComponentField {
  id: string;
  component_id: string;
  name: string;
  display_name: string;
  type: FieldType;
  required: boolean;
  translatable: boolean;
  default_value?: string;
  options: FieldOptions;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// RELATIONS
// ============================================================================

export type RelationType = 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';

export interface ContentTypeRelation {
  id: string;
  source_content_type_id: string;
  target_content_type_id: string;
  relation_name: string; // Field name on source
  relation_type: RelationType;
  inverse_relation_name?: string; // Field name on target
  created_at: string;
  updated_at: string;
}

export interface DynamicContentRelation {
  id: string;
  relation_id: string;
  source_content_id: string;
  target_content_id: string;
  order_index: number;
  created_at: string;
}

// ============================================================================
// MEDIA LIBRARY
// ============================================================================

export interface MediaLibraryItem {
  id: string;
  name: string;
  alternative_text?: string;
  caption?: string;
  file_name: string;
  mime_type: string;
  file_size: number; // In bytes
  width?: number; // For images
  height?: number; // For images
  url: string; // Supabase Storage URL
  formats?: MediaFormats; // Different image sizes
  folder_path?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFormats {
  thumbnail?: MediaFormat;
  small?: MediaFormat;
  medium?: MediaFormat;
  large?: MediaFormat;
}

export interface MediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
}

// ============================================================================
// USERS & PERMISSIONS
// ============================================================================

export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  role: UserRole;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish';

export interface Permission {
  id: string;
  role: UserRole;
  content_type_id?: string;
  action: PermissionAction;
  allowed: boolean;
  created_at: string;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Generic API response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

// Content type creation request
export interface CreateContentTypeRequest {
  name: string;
  display_name: string;
  singular_name: string;
  description?: string;
  icon?: string;
  kind?: ContentTypeKind;
  draftable?: boolean;
  publishable?: boolean;
  reviewable?: boolean;
  settings?: Record<string, any>;
}

// Field creation request
export interface CreateFieldRequest {
  name: string;
  display_name: string;
  type: FieldType;
  required?: boolean;
  is_unique?: boolean;
  translatable?: boolean;
  default_value?: string;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  regex_pattern?: string;
  options?: FieldOptions;
  display_order?: number;
}

// Content creation request
export interface CreateContentRequest {
  content_type_id: string;
  status?: ContentStatus;
  data: Record<string, any>;
  translations?: Array<{
    language_code: string;
    data: Record<string, any>;
  }>;
}

// Content update request
export interface UpdateContentRequest {
  status?: ContentStatus;
  data?: Record<string, any>;
  translations?: Array<{
    language_code: string;
    data: Record<string, any>;
  }>;
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

// Content Type with populated fields
export interface ContentTypeWithFields extends ContentType {
  fields: ContentTypeField[];
  field_count?: number;
}

// Content with populated relations
export interface ContentWithRelations extends DynamicContent {
  content_type: ContentType;
  translations: DynamicContentTranslation[];
}

// Field validation error
export interface FieldValidationError {
  field: string;
  message: string;
}

// Form field state
export interface FormFieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}
