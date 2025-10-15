// Pages Service - Handles page and section operations with polymorphic relations

import { createClient } from '@/lib/supabase/server';
import type {
  Page,
  PageSection,
  SectionType,
  SectionData,
  CreatePageInput,
  UpdatePageInput,
  CreatePageSectionInput,
  UpdatePageSectionInput,
  SectionTypeDefinition,
} from '@/types/pages';

// Map section type UIDs to component table names
const SECTION_TABLE_MAP: Record<SectionType, string> = {
  'sections.hero': 'components_sections_heroes',
  'sections.feature_rows': 'components_sections_feature_rows',
  'sections.feature_columns': 'components_sections_feature_columns',
  'sections.testimonials': 'components_sections_testimonials',
  'sections.rich_text': 'components_sections_rich_text',
  'sections.pricing': 'components_sections_pricing',
  'sections.lead_form': 'components_sections_lead_form',
  'sections.large_video': 'components_sections_large_video',
  'sections.bottom_actions': 'components_sections_bottom_actions',
  'sections.team': 'components_sections_team',
  'sections.technology': 'components_sections_technology',
  'sections.contact': 'components_sections_contact',
};

export class PagesService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // ============================================================================
  // PAGE OPERATIONS
  // ============================================================================

  /**
   * Get all pages with optional filtering
   */
  async findPages(params?: {
    status?: string;
    locale?: string;
    page?: number;
    pageSize?: number;
  }) {
    let query = this.supabase
      .from('pages')
      .select('*', { count: 'exact' });

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.locale) {
      query = query.eq('locale', params.locale);
    }

    // Apply pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 25;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil((count || 0) / pageSize),
          total: count || 0,
        },
      },
    };
  }

  /**
   * Get a single page by ID or slug with populated sections
   */
  async findPage(identifier: string, populate: boolean = true) {
    let query = this.supabase.from('pages').select('*');

    // Check if identifier is UUID or slug
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) throw new Error('Page not found');

    // Populate sections if requested
    if (populate) {
      const sections = await this.getPageSections(data.id);
      return { ...data, content_sections: sections };
    }

    return data;
  }

  /**
   * Create a new page
   */
  async createPage(input: CreatePageInput) {
    const { data, error } = await this.supabase
      .from('pages')
      .insert({
        title: input.title,
        slug: input.slug,
        short_name: input.short_name,
        status: input.status || 'draft',
        metadata: input.metadata || {},
        locale: input.locale || 'en',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a page
   */
  async updatePage(id: string, input: UpdatePageInput) {
    const { data, error } = await this.supabase
      .from('pages')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a page (cascades to sections)
   */
  async deletePage(id: string) {
    const { error } = await this.supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Publish a page
   */
  async publishPage(id: string) {
    return this.updatePage(id, {
      status: 'published',
      published_at: new Date().toISOString(),
    });
  }

  /**
   * Unpublish a page
   */
  async unpublishPage(id: string) {
    return this.updatePage(id, {
      status: 'draft',
      published_at: null,
    });
  }

  // ============================================================================
  // SECTION OPERATIONS
  // ============================================================================

  /**
   * Get all sections for a page (ordered)
   */
  async getPageSections(pageId: string): Promise<SectionData[]> {
    // Get section links from junction table
    const { data: links, error: linksError } = await this.supabase
      .from('pages_sections')
      .select('*')
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

    if (linksError) throw linksError;
    if (!links || links.length === 0) return [];

    // Fetch actual section data for each link (polymorphic query)
    const sections = await Promise.all(
      links.map(async (link) => {
        const tableName = SECTION_TABLE_MAP[link.section_type as SectionType];
        if (!tableName) {
          console.warn(`Unknown section type: ${link.section_type}`);
          return null;
        }

        const { data, error } = await this.supabase
          .from(tableName)
          .select('*')
          .eq('id', link.section_id)
          .single();

        if (error) {
          console.error(`Error fetching section ${link.section_id}:`, error);
          return null;
        }

        return {
          ...data,
          __section_type: link.section_type,
          __display_order: link.display_order,
          __junction_id: link.id,
        };
      })
    );

    return sections.filter((s) => s !== null) as SectionData[];
  }

  /**
   * Add a section to a page
   */
  async addSection(input: CreatePageSectionInput) {
    const tableName = SECTION_TABLE_MAP[input.section_type];
    if (!tableName) {
      throw new Error(`Unknown section type: ${input.section_type}`);
    }

    // 1. Create the section in the component table
    const { data: sectionData, error: sectionError } = await this.supabase
      .from(tableName)
      .insert(input.section_data)
      .select()
      .single();

    if (sectionError) throw sectionError;

    // 2. Get the max order for this page
    const { data: maxOrderData } = await this.supabase
      .from('pages_sections')
      .select('display_order')
      .eq('page_id', input.page_id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = input.display_order ?? (maxOrderData?.display_order ?? 0) + 1;

    // 3. Create the link in the junction table
    const { data: linkData, error: linkError } = await this.supabase
      .from('pages_sections')
      .insert({
        page_id: input.page_id,
        section_id: sectionData.id,
        section_type: input.section_type,
        field: 'content_sections',
        display_order: nextOrder,
      })
      .select()
      .single();

    if (linkError) throw linkError;

    return { ...sectionData, ...linkData };
  }

  /**
   * Update a section
   */
  async updateSection(
    sectionId: string,
    sectionType: SectionType,
    updates: Partial<SectionData>
  ) {
    const tableName = SECTION_TABLE_MAP[sectionType];
    if (!tableName) {
      throw new Error(`Unknown section type: ${sectionType}`);
    }

    const { data, error } = await this.supabase
      .from(tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a section
   */
  async deleteSection(sectionId: string, sectionType: SectionType) {
    // 1. Delete from junction table
    const { error: linkError } = await this.supabase
      .from('pages_sections')
      .delete()
      .eq('section_id', sectionId)
      .eq('section_type', sectionType);

    if (linkError) throw linkError;

    // 2. Delete from component table
    const tableName = SECTION_TABLE_MAP[sectionType];
    if (!tableName) {
      throw new Error(`Unknown section type: ${sectionType}`);
    }

    const { error: sectionError } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', sectionId);

    if (sectionError) throw sectionError;

    return { success: true };
  }

  /**
   * Reorder sections for a page
   */
  async reorderSections(
    pageId: string,
    sectionOrders: Array<{ junctionId: string; order: number }>
  ) {
    // Update each section's display_order
    const updates = sectionOrders.map((item) =>
      this.supabase
        .from('pages_sections')
        .update({ display_order: item.order })
        .eq('id', item.junctionId)
        .eq('page_id', pageId)
    );

    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      throw new Error(`Failed to reorder sections: ${errors.map(e => e.error?.message).join(', ')}`);
    }

    return { success: true };
  }

  // ============================================================================
  // SECTION TYPE DEFINITIONS
  // ============================================================================

  /**
   * Get all available section types
   */
  async getSectionTypes() {
    const { data, error } = await this.supabase
      .from('section_types')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single section type by UID
   */
  async getSectionType(uid: SectionType) {
    const { data, error } = await this.supabase
      .from('section_types')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const pagesService = new PagesService();
