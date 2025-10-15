// Pages and Sections Types (Based on Strapi Architecture)

export type PageStatus = 'draft' | 'published' | 'archived';

export type SectionType =
  | 'sections.hero'
  | 'sections.feature_rows'
  | 'sections.feature_columns'
  | 'sections.testimonials'
  | 'sections.rich_text'
  | 'sections.pricing'
  | 'sections.lead_form'
  | 'sections.large_video'
  | 'sections.bottom_actions'
  | 'sections.team'
  | 'sections.technology'
  | 'sections.contact';

// ============================================================================
// PAGE TYPES
// ============================================================================

export interface Page {
  id: string;
  document_id: string;
  title: string;
  slug: string;
  short_name?: string;
  status: PageStatus;
  published_at?: string;
  metadata: PageMetadata;
  locale: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Populated sections (not stored in DB directly)
  content_sections?: PageSection[];
}

export interface PageMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
  shareImage?: string;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  short_name?: string;
  status?: PageStatus;
  metadata?: PageMetadata;
  locale?: string;
}

export interface UpdatePageInput extends Partial<CreatePageInput> {
  published_at?: string | null;
}

// ============================================================================
// SECTION TYPE DEFINITION
// ============================================================================

export interface SectionTypeDefinition {
  id: string;
  uid: SectionType;
  name: string;
  display_name: string;
  category: string;
  icon: string;
  description?: string;
  schema: Record<string, any>; // JSON Schema
  preview_template?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAGE-SECTION JUNCTION
// ============================================================================

export interface PageSection {
  id: string;
  page_id: string;
  section_id: string;
  section_type: SectionType;
  field: string;
  display_order: number;
  created_at: string;

  // Populated section data (not stored in pages_sections)
  data?: SectionData;
}

export interface CreatePageSectionInput {
  page_id: string;
  section_type: SectionType;
  section_data: Partial<SectionData>;
  display_order?: number;
}

export interface UpdatePageSectionInput {
  display_order?: number;
  section_data?: Partial<SectionData>;
}

// ============================================================================
// SECTION DATA TYPES (Component Tables)
// ============================================================================

export type SectionData =
  | HeroSection
  | FeatureRowsSection
  | FeatureColumnsSection
  | TestimonialsSection
  | RichTextSection
  | PricingSection
  | LeadFormSection
  | LargeVideoSection
  | BottomActionsSection
  | TeamSection
  | TechnologySection
  | ContactSection;

// Button Component (used in multiple sections)
export interface Button {
  text: string;
  url: string;
  type?: 'primary' | 'secondary' | 'tertiary';
  newTab?: boolean;
  icon?: string;
}

// Link Component
export interface Link {
  text: string;
  url: string;
  newTab?: boolean;
}

// Hero Section
export interface HeroSection {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  label?: string;
  buttons?: Button[];
  picture_id?: string;
  background_image_id?: string;
  small_text_with_link?: string;
  created_at: string;
  updated_at: string;
}

// Feature Rows Section
export interface FeatureRowsSection {
  id: string;
  heading?: string;
  subheading?: string;
  features?: FeatureRow[];
  created_at: string;
  updated_at: string;
}

export interface FeatureRow {
  title: string;
  description: string;
  icon?: string;
  link?: Link;
  media_id?: string;
}

// Feature Columns Section
export interface FeatureColumnsSection {
  id: string;
  heading?: string;
  subheading?: string;
  columns?: FeatureColumn[];
  created_at: string;
  updated_at: string;
}

export interface FeatureColumn {
  title: string;
  description: string;
  icon?: string;
  link?: Link;
}

// Testimonials Section
export interface TestimonialsSection {
  id: string;
  heading?: string;
  subheading?: string;
  testimonials?: Testimonial[];
  logos?: Logo[];
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  company?: string;
  content: string;
  avatar_id?: string;
  rating?: number;
}

export interface Logo {
  name: string;
  image_id?: string;
  url?: string;
}

// Rich Text Section
export interface RichTextSection {
  id: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

// Pricing Section
export interface PricingSection {
  id: string;
  heading?: string;
  subheading?: string;
  plans?: PricingPlan[];
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  interval?: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  cta_text?: string;
  cta_url?: string;
}

// Lead Form Section
export interface LeadFormSection {
  id: string;
  heading?: string;
  subheading?: string;
  submit_button_text?: string;
  fields?: FormField[];
  created_at: string;
  updated_at: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
}

// Large Video Section
export interface LargeVideoSection {
  id: string;
  title?: string;
  description?: string;
  video_url?: string;
  thumbnail_id?: string;
  created_at: string;
  updated_at: string;
}

// Bottom Actions (CTA) Section
export interface BottomActionsSection {
  id: string;
  title?: string;
  description?: string;
  buttons?: Button[];
  created_at: string;
  updated_at: string;
}

// Team Section
export interface TeamSection {
  id: string;
  heading?: string;
  subheading?: string;
  members?: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  social_links?: SocialLink[];
}

// Technology Section
export interface TechnologySection {
  id: string;
  heading?: string;
  subheading?: string;
  technologies?: Technology[];
  created_at: string;
  updated_at: string;
}

export interface Technology {
  name: string;
  description?: string;
  icon?: string;
  url?: string;
  category?: string;
}

// Contact Section
export interface ContactSection {
  id: string;
  heading?: string;
  subheading?: string;
  email?: string;
  phone?: string;
  address?: string;
  social_links?: SocialLink[];
  show_map?: boolean;
  map_latitude?: number;
  map_longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PagesResponse {
  data: Page[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface PageResponse {
  data: Page;
}

export interface SectionTypesResponse {
  data: SectionTypeDefinition[];
}

export interface PageSectionResponse {
  data: PageSection;
}
