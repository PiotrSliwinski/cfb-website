// =====================================================
// DYNAMIC CONTENT TYPES
// Type definitions for Strapi-inspired CMS
// =====================================================

// ============ Content Type System ============

export type ContentTypeKind = 'collectionType' | 'singleType';

export interface ContentType {
  id: string;
  name: string; // e.g., "blog_posts"
  display_name: string; // e.g., "Blog Posts"
  singular_name: string; // e.g., "Blog Post"
  description?: string;
  icon?: string; // Lucide icon name

  kind: ContentTypeKind;

  // Features
  draftable: boolean;
  publishable: boolean;
  reviewable: boolean;

  settings: Record<string, any>;

  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============ Field Types ============

export type FieldType =
  // Basic types
  | 'text'
  | 'richtext'
  | 'email'
  | 'password'
  | 'number'
  | 'decimal'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'enumeration'
  // Advanced types
  | 'media'
  | 'relation'
  | 'component'
  | 'dynamiczone'
  | 'json'
  | 'uid';

export type RelationType = 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';

export interface FieldValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  regex_pattern?: string;
}

export interface FieldOptions {
  // For enumeration
  choices?: Array<{ label: string; value: string }>;

  // For relation
  target_content_type?: string;
  relation_type?: RelationType;
  bidirectional?: boolean;

  // For media
  allowed_types?: Array<'images' | 'videos' | 'files' | 'audios'>;
  multiple?: boolean;

  // For component
  component_id?: string;
  repeatable?: boolean;

  // For UID
  target_field?: string; // Field to generate UID from
}

export interface ContentTypeField extends FieldValidation {
  id: string;
  content_type_id: string;

  name: string;
  display_name: string;
  type: FieldType;

  required: boolean;
  unique: boolean;
  translatable: boolean;

  placeholder?: string;
  help_text?: string;
  default_value?: string;

  display_order: number;
  visible_in_list: boolean;
  visible_in_form: boolean;

  options: FieldOptions;

  created_at: string;
  updated_at: string;
}

// ============ Components ============

export interface Component {
  id: string;
  name: string;
  display_name: string;
  category: string;
  icon?: string;
  description?: string;

  created_at: string;
  updated_at: string;
}

export interface ComponentField extends Omit<ContentTypeField, 'content_type_id'> {
  component_id: string;
}

// ============ Dynamic Content ============

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface DynamicContent {
  id: string;
  content_type_id: string;

  status: ContentStatus;
  published_at?: string;
  version: number;

  // The actual content data (flexible structure)
  data: Record<string, any>;

  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Joined data
  content_type?: ContentType;
  translations?: DynamicContentTranslation[];
}

export interface DynamicContentTranslation {
  id: string;
  content_id: string;
  language_code: string;

  data: Record<string, any>;

  created_at: string;
  updated_at: string;
}

// ============ Relations ============

export interface ContentTypeRelation {
  id: string;
  source_content_type_id: string;
  source_field_id: string;
  target_content_type_id: string;
  relation_type: RelationType;
  cascades: boolean;
  created_at: string;
}

// ============ Media Library ============

export interface MediaFormat {
  name: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

export interface MediaLibraryItem {
  id: string;

  name: string;
  alternative_text?: string;
  caption?: string;

  url: string;
  provider: string;
  provider_metadata: Record<string, any>;

  mime_type: string;
  size: number;
  width?: number;
  height?: number;

  formats: Record<string, MediaFormat>;

  folder_path?: string;
  tags?: string[];

  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ============ Content Type Builder ============

export interface ContentTypeSchema {
  contentType: ContentType;
  fields: ContentTypeField[];
  relations?: ContentTypeRelation[];
}

export interface CreateContentTypeInput {
  name: string;
  display_name: string;
  singular_name: string;
  description?: string;
  icon?: string;
  kind?: ContentTypeKind;
  draftable?: boolean;
  publishable?: boolean;
  reviewable?: boolean;
}

export interface CreateFieldInput {
  name: string;
  display_name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  translatable?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: FieldOptions;
  validation?: FieldValidation;
}

export interface UpdateFieldInput extends Partial<CreateFieldInput> {
  id: string;
}

// ============ Dynamic Form Generation ============

export interface FormField {
  field: ContentTypeField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface DynamicFormProps {
  contentType: ContentType;
  fields: ContentTypeField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

// ============ Content Manager List ============

export interface ContentListColumn {
  field: ContentTypeField;
  width?: number;
  sortable?: boolean;
}

export interface ContentListFilters {
  status?: ContentStatus;
  search?: string;
  dateRange?: { start: Date; end: Date };
  customFilters?: Record<string, any>;
}

export interface ContentListProps {
  contentType: ContentType;
  fields: ContentTypeField[];
  items: DynamicContent[];
  columns: ContentListColumn[];
  filters: ContentListFilters;
  onFilterChange: (filters: ContentListFilters) => void;
  onItemClick: (item: DynamicContent) => void;
}

// ============ Field Renderer Props ============

export interface FieldRendererProps {
  field: ContentTypeField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  locale?: string;
}

// ============ Query & API Types ============

export interface GetContentTypesResponse {
  data: ContentType[];
  total: number;
}

export interface GetContentTypeResponse {
  data: ContentType;
  fields: ContentTypeField[];
  relations: ContentTypeRelation[];
}

export interface GetDynamicContentResponse {
  data: DynamicContent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateDynamicContentInput {
  content_type_id: string;
  status?: ContentStatus;
  data: Record<string, any>;
  translations?: Array<{
    language_code: string;
    data: Record<string, any>;
  }>;
}

export interface UpdateDynamicContentInput extends Partial<CreateDynamicContentInput> {
  id: string;
}

// ============ Content Type Builder State ============

export interface ContentTypeBuilderState {
  currentType: ContentType | null;
  fields: ContentTypeField[];
  isEditing: boolean;
  isDirty: boolean;
  validationErrors: Record<string, string>;
}

export interface ContentTypeBuilderActions {
  setContentType: (type: ContentType) => void;
  addField: (field: CreateFieldInput) => void;
  updateField: (id: string, updates: Partial<ContentTypeField>) => void;
  removeField: (id: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  save: () => Promise<void>;
  reset: () => void;
}
