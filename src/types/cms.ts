/**
 * CMS (Content Management System) TypeScript types
 * Types for pages, sections, features, CTAs, and FAQs
 */

import { UUID, Locale, Translation } from './index';

// ============================================================================
// CMS Page Types
// ============================================================================

export type PageTemplate = 'home' | 'info' | 'legal' | 'custom';

export interface CMSPage {
  id: UUID;
  slug: string;
  template: PageTemplate;
  is_published: boolean;
  is_homepage: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  cms_page_translations?: CMSPageTranslation[];
  cms_page_sections?: CMSPageSection[];
}

export interface CMSPageTranslation extends Translation {
  id: UUID;
  page_id: UUID;
  title: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

// ============================================================================
// CMS Section Types
// ============================================================================

export type SectionType =
  | 'hero'
  | 'features'
  | 'cta'
  | 'text_block'
  | 'treatments_showcase'
  | 'treatments_grid'
  | 'team_showcase'
  | 'testimonials'
  | 'gallery'
  | 'two_column'
  | 'faq';

export interface CMSPageSection {
  id: UUID;
  page_id: UUID;
  section_type: SectionType;
  display_order: number;
  is_active: boolean;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  cms_section_translations?: CMSSectionTranslation[];
}

export interface CMSSectionTranslation extends Translation {
  id: UUID;
  section_id: UUID;
  content: Record<string, any>;
}

// ============================================================================
// Hero Section Content Types
// ============================================================================

export interface HeroSectionContent {
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  background_image?: string;
  background_color?: string;
}

// ============================================================================
// Feature Types
// ============================================================================

export interface CMSFeature {
  id: UUID;
  slug: string;
  icon?: string;
  icon_color?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  cms_feature_translations?: CMSFeatureTranslation[];
}

export interface CMSFeatureTranslation extends Translation {
  id: UUID;
  feature_id: UUID;
  title: string;
  description?: string;
}

// ============================================================================
// CTA Section Types
// ============================================================================

export type CTAStyle = 'primary' | 'secondary' | 'urgent';
export type ButtonStyle = 'filled' | 'outlined' | 'text';

export interface CMSCTASection {
  id: UUID;
  slug: string;
  style: CTAStyle;
  button_style: ButtonStyle;
  background_color?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  cms_cta_translations?: CMSCTATranslation[];
}

export interface CMSCTATranslation extends Translation {
  id: UUID;
  cta_id: UUID;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
}

// ============================================================================
// FAQ Types
// ============================================================================

export type FAQCategory = 'general' | 'payments' | 'appointments' | 'treatments';

export interface CMSFAQ {
  id: UUID;
  category?: FAQCategory;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  cms_faq_translations?: CMSFAQTranslation[];
}

export interface CMSFAQTranslation extends Translation {
  id: UUID;
  faq_id: UUID;
  question: string;
  answer: string;
}

// ============================================================================
// Query Response Types (with joined translations)
// ============================================================================

export interface CMSPageWithContent extends CMSPage {
  cms_page_translations: CMSPageTranslation[];
  cms_page_sections: CMSPageSectionWithContent[];
}

export interface CMSPageSectionWithContent extends CMSPageSection {
  cms_section_translations: CMSSectionTranslation[];
}

export interface CMSFeatureWithTranslations extends CMSFeature {
  cms_feature_translations: CMSFeatureTranslation[];
}

export interface CMSCTAWithTranslations extends CMSCTASection {
  cms_cta_translations: CMSCTATranslation[];
}

export interface CMSFAQWithTranslations extends CMSFAQ {
  cms_faq_translations: CMSFAQTranslation[];
}

// ============================================================================
// Component-Friendly Types (single locale)
// ============================================================================

export interface LocalizedPage {
  id: UUID;
  slug: string;
  template: PageTemplate;
  title: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  sections: LocalizedSection[];
}

export interface LocalizedSection {
  id: UUID;
  section_type: SectionType;
  display_order: number;
  settings?: Record<string, any>;
  content: Record<string, any>;
}

export interface LocalizedFeature {
  id: UUID;
  slug: string;
  icon?: string;
  icon_color?: string;
  title: string;
  description?: string;
}

export interface LocalizedCTA {
  id: UUID;
  slug: string;
  style: CTAStyle;
  button_style: ButtonStyle;
  background_color?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
}

export interface LocalizedFAQ {
  id: UUID;
  category?: FAQCategory;
  question: string;
  answer: string;
}

// ============================================================================
// Helper Functions for Localization
// ============================================================================

/**
 * Extract localized page data from database response
 */
export function localizePageData(
  page: CMSPageWithContent,
  locale: Locale
): LocalizedPage | null {
  const translation = page.cms_page_translations?.find(
    (t) => t.language_code === locale
  );

  if (!translation) return null;

  const sections = page.cms_page_sections
    ?.filter((section) => section.is_active)
    .map((section) => {
      const sectionTranslation = section.cms_section_translations?.find(
        (t) => t.language_code === locale
      );

      return {
        id: section.id,
        section_type: section.section_type,
        display_order: section.display_order,
        settings: section.settings,
        content: sectionTranslation?.content || {},
      };
    })
    .sort((a, b) => a.display_order - b.display_order) || [];

  return {
    id: page.id,
    slug: page.slug,
    template: page.template,
    title: translation.title,
    meta_title: translation.meta_title,
    meta_description: translation.meta_description,
    meta_keywords: translation.meta_keywords,
    og_title: translation.og_title,
    og_description: translation.og_description,
    og_image: translation.og_image,
    sections,
  };
}

/**
 * Extract localized feature data from database response
 */
export function localizeFeature(
  feature: CMSFeatureWithTranslations,
  locale: Locale
): LocalizedFeature | null {
  const translation = feature.cms_feature_translations?.find(
    (t) => t.language_code === locale
  );

  if (!translation) return null;

  return {
    id: feature.id,
    slug: feature.slug,
    icon: feature.icon,
    icon_color: feature.icon_color,
    title: translation.title,
    description: translation.description,
  };
}

/**
 * Extract localized CTA data from database response
 */
export function localizeCTA(
  cta: CMSCTAWithTranslations,
  locale: Locale
): LocalizedCTA | null {
  const translation = cta.cms_cta_translations?.find(
    (t) => t.language_code === locale
  );

  if (!translation) return null;

  return {
    id: cta.id,
    slug: cta.slug,
    style: cta.style,
    button_style: cta.button_style,
    background_color: cta.background_color,
    badge: translation.badge,
    title: translation.title,
    subtitle: translation.subtitle,
    description: translation.description,
    button_text: translation.button_text,
    button_url: translation.button_url,
    secondary_button_text: translation.secondary_button_text,
    secondary_button_url: translation.secondary_button_url,
  };
}

/**
 * Extract localized FAQ data from database response
 */
export function localizeFAQ(
  faq: CMSFAQWithTranslations,
  locale: Locale
): LocalizedFAQ | null {
  const translation = faq.cms_faq_translations?.find(
    (t) => t.language_code === locale
  );

  if (!translation) return null;

  return {
    id: faq.id,
    category: faq.category,
    question: translation.question,
    answer: translation.answer,
  };
}
