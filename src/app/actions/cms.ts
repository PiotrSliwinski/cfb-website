'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// PAGE ACTIONS
// ============================================================================

export interface PageData {
  id?: string;
  slug: string;
  template: string;
  is_published: boolean;
  is_homepage?: boolean;
  display_order?: number;
  translations: Array<{
    language_code: string;
    title: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
  }>;
  sections?: Array<{
    id?: string;
    section_type: string;
    display_order: number;
    is_active: boolean;
    settings?: Record<string, any>;
    translations: Array<{
      language_code: string;
      content: Record<string, any>;
    }>;
  }>;
}

export async function createPage(pageData: PageData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    // Create page
    const { data: page, error: pageError } = await supabase
      .from('cms_pages')
      .insert({
        slug: pageData.slug,
        template: pageData.template,
        is_published: pageData.is_published,
        is_homepage: pageData.is_homepage || false,
        display_order: pageData.display_order || 0,
      })
      .select()
      .single();

    if (pageError || !page) {
      throw new Error(pageError?.message || 'Failed to create page');
    }

    // Create translations
    for (const translation of pageData.translations) {
      const { error: transError } = await supabase
        .from('cms_page_translations')
        .insert({
          page_id: page.id,
          ...translation,
        });

      if (transError) throw new Error(transError.message);
    }

    // Create sections if provided
    if (pageData.sections && pageData.sections.length > 0) {
      for (const section of pageData.sections) {
        const { data: newSection, error: sectionError } = await supabase
          .from('cms_page_sections')
          .insert({
            page_id: page.id,
            section_type: section.section_type,
            display_order: section.display_order,
            is_active: section.is_active,
            settings: section.settings || {},
          })
          .select()
          .single();

        if (sectionError || !newSection) {
          throw new Error(sectionError?.message || 'Failed to create section');
        }

        // Create section translations
        if (section.translations) {
          for (const sectionTrans of section.translations) {
            const { error: sectionTransError } = await supabase
              .from('cms_section_translations')
              .insert({
                section_id: newSection.id,
                language_code: sectionTrans.language_code,
                content: sectionTrans.content,
              });

            if (sectionTransError) throw new Error(sectionTransError.message);
          }
        }
      }
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true, data: page };
  } catch (error: any) {
    console.error('Error creating page:', error);
    return { success: false, error: error.message || 'Failed to create page' };
  }
}

export async function updatePage(id: string, pageData: PageData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    // Update page
    const { error: pageError } = await supabase
      .from('cms_pages')
      .update({
        slug: pageData.slug,
        template: pageData.template,
        is_published: pageData.is_published,
        is_homepage: pageData.is_homepage || false,
        display_order: pageData.display_order || 0,
      })
      .eq('id', id);

    if (pageError) throw new Error(pageError.message);

    // Update translations
    for (const translation of pageData.translations) {
      const { error: transError } = await supabase
        .from('cms_page_translations')
        .upsert(
          {
            page_id: id,
            ...translation,
          },
          {
            onConflict: 'page_id,language_code',
          }
        );

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating page:', error);
    return { success: false, error: error.message || 'Failed to update page' };
  }
}

export async function deletePage(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('cms_pages').delete().eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return { success: false, error: error.message || 'Failed to delete page' };
  }
}

export async function getAllPagesForAdmin(): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*, cms_page_translations(*)')
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return { success: false, error: error.message || 'Failed to fetch pages' };
  }
}

// ============================================================================
// FEATURE ACTIONS
// ============================================================================

export interface FeatureData {
  id?: string;
  slug: string;
  icon: string;
  icon_color: string;
  display_order: number;
  is_active: boolean;
  translations: Array<{
    language_code: string;
    title: string;
    description?: string;
  }>;
}

export async function createFeature(featureData: FeatureData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: feature, error: featureError } = await supabase
      .from('cms_features')
      .insert({
        slug: featureData.slug,
        icon: featureData.icon,
        icon_color: featureData.icon_color,
        display_order: featureData.display_order,
        is_active: featureData.is_active,
      })
      .select()
      .single();

    if (featureError || !feature) {
      throw new Error(featureError?.message || 'Failed to create feature');
    }

    for (const translation of featureData.translations) {
      const { error: transError } = await supabase
        .from('cms_feature_translations')
        .insert({
          feature_id: feature.id,
          ...translation,
        });

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true, data: feature };
  } catch (error: any) {
    console.error('Error creating feature:', error);
    return { success: false, error: error.message || 'Failed to create feature' };
  }
}

export async function updateFeature(id: string, featureData: FeatureData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error: featureError } = await supabase
      .from('cms_features')
      .update({
        slug: featureData.slug,
        icon: featureData.icon,
        icon_color: featureData.icon_color,
        display_order: featureData.display_order,
        is_active: featureData.is_active,
      })
      .eq('id', id);

    if (featureError) throw new Error(featureError.message);

    for (const translation of featureData.translations) {
      const { error: transError } = await supabase
        .from('cms_feature_translations')
        .upsert(
          {
            feature_id: id,
            ...translation,
          },
          {
            onConflict: 'feature_id,language_code',
          }
        );

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating feature:', error);
    return { success: false, error: error.message || 'Failed to update feature' };
  }
}

export async function deleteFeature(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('cms_features').delete().eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting feature:', error);
    return { success: false, error: error.message || 'Failed to delete feature' };
  }
}

export async function getAllFeaturesForAdmin(): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('cms_features')
      .select('*, cms_feature_translations(*)')
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching features:', error);
    return { success: false, error: error.message || 'Failed to fetch features' };
  }
}

// ============================================================================
// CTA ACTIONS
// ============================================================================

export interface CTAData {
  id?: string;
  slug: string;
  style: string;
  button_style: string;
  background_color?: string;
  display_order: number;
  is_active: boolean;
  translations: Array<{
    language_code: string;
    badge?: string;
    title: string;
    subtitle?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    secondary_button_text?: string;
    secondary_button_url?: string;
  }>;
}

export async function createCTA(ctaData: CTAData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: cta, error: ctaError } = await supabase
      .from('cms_cta_sections')
      .insert({
        slug: ctaData.slug,
        style: ctaData.style,
        button_style: ctaData.button_style,
        background_color: ctaData.background_color,
        display_order: ctaData.display_order,
        is_active: ctaData.is_active,
      })
      .select()
      .single();

    if (ctaError || !cta) {
      throw new Error(ctaError?.message || 'Failed to create CTA');
    }

    for (const translation of ctaData.translations) {
      const { error: transError } = await supabase
        .from('cms_cta_translations')
        .insert({
          cta_id: cta.id,
          ...translation,
        });

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true, data: cta };
  } catch (error: any) {
    console.error('Error creating CTA:', error);
    return { success: false, error: error.message || 'Failed to create CTA' };
  }
}

export async function updateCTA(id: string, ctaData: CTAData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error: ctaError } = await supabase
      .from('cms_cta_sections')
      .update({
        slug: ctaData.slug,
        style: ctaData.style,
        button_style: ctaData.button_style,
        background_color: ctaData.background_color,
        display_order: ctaData.display_order,
        is_active: ctaData.is_active,
      })
      .eq('id', id);

    if (ctaError) throw new Error(ctaError.message);

    for (const translation of ctaData.translations) {
      const { error: transError } = await supabase
        .from('cms_cta_translations')
        .upsert(
          {
            cta_id: id,
            ...translation,
          },
          {
            onConflict: 'cta_id,language_code',
          }
        );

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating CTA:', error);
    return { success: false, error: error.message || 'Failed to update CTA' };
  }
}

export async function deleteCTA(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('cms_cta_sections').delete().eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting CTA:', error);
    return { success: false, error: error.message || 'Failed to delete CTA' };
  }
}

export async function getAllCTAsForAdmin(): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('cms_cta_sections')
      .select('*, cms_cta_translations(*)')
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching CTAs:', error);
    return { success: false, error: error.message || 'Failed to fetch CTAs' };
  }
}

// ============================================================================
// FAQ ACTIONS
// ============================================================================

export interface FAQData {
  id?: string;
  category: string;
  display_order: number;
  is_active: boolean;
  translations: Array<{
    language_code: string;
    question: string;
    answer: string;
  }>;
}

export async function createFAQ(faqData: FAQData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: faq, error: faqError } = await supabase
      .from('cms_faqs')
      .insert({
        category: faqData.category,
        display_order: faqData.display_order,
        is_active: faqData.is_active,
      })
      .select()
      .single();

    if (faqError || !faq) {
      throw new Error(faqError?.message || 'Failed to create FAQ');
    }

    for (const translation of faqData.translations) {
      const { error: transError } = await supabase
        .from('cms_faq_translations')
        .insert({
          faq_id: faq.id,
          ...translation,
        });

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true, data: faq };
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return { success: false, error: error.message || 'Failed to create FAQ' };
  }
}

export async function updateFAQ(id: string, faqData: FAQData): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error: faqError } = await supabase
      .from('cms_faqs')
      .update({
        category: faqData.category,
        display_order: faqData.display_order,
        is_active: faqData.is_active,
      })
      .eq('id', id);

    if (faqError) throw new Error(faqError.message);

    for (const translation of faqData.translations) {
      const { error: transError } = await supabase
        .from('cms_faq_translations')
        .upsert(
          {
            faq_id: id,
            ...translation,
          },
          {
            onConflict: 'faq_id,language_code',
          }
        );

      if (transError) throw new Error(transError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return { success: false, error: error.message || 'Failed to update FAQ' };
  }
}

export async function deleteFAQ(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('cms_faqs').delete().eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return { success: false, error: error.message || 'Failed to delete FAQ' };
  }
}

export async function getAllFAQsForAdmin(): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('cms_faqs')
      .select('*, cms_faq_translations(*)')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return { success: false, error: error.message || 'Failed to fetch FAQs' };
  }
}

// ============================================================================
// PAGE SECTION ACTIONS
// ============================================================================

export interface PageSectionData {
  id?: string;
  section_type: string;
  display_order: number;
  is_active: boolean;
  settings?: Record<string, any>;
  section_translations?: Array<{
    section_id?: string;
    language_code: string;
    content: Record<string, any>;
  }>;
}

export async function getPageSections(pageId: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('cms_page_sections')
      .select('*, section_translations:cms_section_translations(*)')
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching page sections:', error);
    return { success: false, error: error.message || 'Failed to fetch page sections' };
  }
}

// ============================================================================
// PUBLIC DATA FETCHING (for client components)
// ============================================================================

/**
 * Fetch active features with translations for a specific locale
 */
export async function getFeatures(locale: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: features, error } = await supabase
      .from('cms_features')
      .select(`
        *,
        cms_feature_translations!inner(*)
      `)
      .eq('cms_feature_translations.language_code', locale)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: features || [],
    };
  } catch (error: any) {
    console.error('Error loading features:', error);
    return {
      success: false,
      error: error.message || 'Failed to load features',
    };
  }
}

/**
 * Fetch a specific CTA section by slug with translations
 */
export async function getCTABySlug(slug: string, locale: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: cta, error } = await supabase
      .from('cms_cta_sections')
      .select(`
        *,
        cms_cta_translations!inner(*)
      `)
      .eq('slug', slug)
      .eq('cms_cta_translations.language_code', locale)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: cta,
    };
  } catch (error: any) {
    console.error('Error loading CTA:', error);
    return {
      success: false,
      error: error.message || 'Failed to load CTA',
    };
  }
}

/**
 * Fetch testimonials with translations, optionally filtered by source
 */
export async function getTestimonials(
  locale: string,
  options?: { limit?: number; source?: string }
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('cms_testimonials')
      .select(`
        *,
        cms_testimonial_translations!inner(*)
      `)
      .eq('cms_testimonial_translations.language_code', locale)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (options?.source) {
      query = query.eq('source', options.source);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: testimonials, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: testimonials || [],
    };
  } catch (error: any) {
    console.error('Error loading testimonials:', error);
    return {
      success: false,
      error: error.message || 'Failed to load testimonials',
    };
  }
}

/**
 * Fetch gallery images with translations, optionally filtered by category
 */
export async function getGalleryImages(
  locale: string,
  options?: { category?: string }
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('cms_gallery_images')
      .select(`
        *,
        cms_gallery_image_translations!inner(*)
      `)
      .eq('cms_gallery_image_translations.language_code', locale)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    const { data: images, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: images || [],
    };
  } catch (error: any) {
    console.error('Error loading gallery images:', error);
    return {
      success: false,
      error: error.message || 'Failed to load gallery images',
    };
  }
}

/**
 * Fetch published treatments with translations
 */
export async function getTreatmentsForGrid(locale: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: treatments, error } = await supabase
      .from('treatments')
      .select(`
        *,
        treatment_translations!inner(*)
      `)
      .eq('treatment_translations.language_code', locale)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: treatments || [],
    };
  } catch (error: any) {
    console.error('Error loading treatments:', error);
    return {
      success: false,
      error: error.message || 'Failed to load treatments',
    };
  }
}

export async function updatePageSections(
  pageId: string,
  sections: PageSectionData[]
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    // Get existing sections
    const { data: existingSections } = await supabase
      .from('cms_page_sections')
      .select('id')
      .eq('page_id', pageId);

    const existingIds = new Set(existingSections?.map((s) => s.id) || []);
    const updatedIds = new Set<string>();

    // Process each section
    for (const section of sections) {
      if (section.id && section.id.startsWith('temp-')) {
        // New section - create it
        const { data: newSection, error: sectionError } = await supabase
          .from('cms_page_sections')
          .insert({
            page_id: pageId,
            section_type: section.section_type,
            display_order: section.display_order,
            is_active: section.is_active,
            settings: section.settings || {},
          })
          .select()
          .single();

        if (sectionError || !newSection) {
          throw new Error(sectionError?.message || 'Failed to create section');
        }

        updatedIds.add(newSection.id);

        // Create section translations
        if (section.section_translations) {
          for (const trans of section.section_translations) {
            const { error: transError } = await supabase
              .from('cms_section_translations')
              .insert({
                section_id: newSection.id,
                language_code: trans.language_code,
                content: trans.content,
              });

            if (transError) throw new Error(transError.message);
          }
        }
      } else if (section.id) {
        // Existing section - update it
        updatedIds.add(section.id);

        const { error: updateError } = await supabase
          .from('cms_page_sections')
          .update({
            section_type: section.section_type,
            display_order: section.display_order,
            is_active: section.is_active,
            settings: section.settings || {},
          })
          .eq('id', section.id);

        if (updateError) throw new Error(updateError.message);

        // Update section translations
        if (section.section_translations) {
          for (const trans of section.section_translations) {
            const { error: transError } = await supabase
              .from('cms_section_translations')
              .upsert(
                {
                  section_id: section.id,
                  language_code: trans.language_code,
                  content: trans.content,
                },
                {
                  onConflict: 'section_id,language_code',
                }
              );

            if (transError) throw new Error(transError.message);
          }
        }
      }
    }

    // Delete sections that were removed
    const idsToDelete = Array.from(existingIds).filter((id) => !updatedIds.has(id));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('cms_page_sections')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) throw new Error(deleteError.message);
    }

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating page sections:', error);
    return { success: false, error: error.message || 'Failed to update page sections' };
  }
}
