/**
 * Dynamic Content Service
 * Generic CRUD service that works with any content type dynamically
 * Inspired by Strapi's service factory pattern
 */

import { createClient } from '@/lib/supabase/server';
import type {
  ContentType,
  ContentTypeField,
  DynamicContent,
  ContentStatus,
} from '@/types/dynamic-content';

export interface QueryParams {
  filters?: Record<string, any>;
  populate?: string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  sort?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

export interface QueryResult<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export class DynamicContentService {
  private contentType: ContentType;
  private fields: ContentTypeField[];

  constructor(contentType: ContentType, fields: ContentTypeField[]) {
    this.contentType = contentType;
    this.fields = fields;
  }

  /**
   * Find multiple entries
   */
  async find(params: QueryParams = {}): Promise<QueryResult<DynamicContent[]>> {
    const supabase = await createClient();
    let query = supabase
      .from('dynamic_content')
      .select('*, dynamic_content_translations(*)', { count: 'exact' })
      .eq('content_type_id', this.contentType.id);

    // Apply publication state filter
    if (params.publicationState === 'live') {
      query = query.eq('status', 'published');
    }

    // Apply filters
    if (params.filters) {
      query = this.applyFilters(query, params.filters);
    }

    // Apply sorting
    if (params.sort) {
      query = this.applySort(query, params.sort);
    }

    // Apply pagination
    const page = params.pagination?.page || 1;
    const pageSize = params.pagination?.pageSize || 25;
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch ${this.contentType.display_name}: ${error.message}`);
    }

    // Transform data
    const transformedData = data?.map((item) => this.transformResponse(item, params.locale)) || [];

    return {
      data: transformedData,
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
   * Find one entry by ID
   */
  async findOne(id: string, params: QueryParams = {}): Promise<DynamicContent | null> {
    const supabase = await createClient();
    let query = supabase
      .from('dynamic_content')
      .select('*, dynamic_content_translations(*)')
      .eq('id', id)
      .eq('content_type_id', this.contentType.id);

    // Apply publication state filter
    if (params.publicationState === 'live') {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch ${this.contentType.singular_name}: ${error.message}`);
    }

    return this.transformResponse(data, params.locale);
  }

  /**
   * Create a new entry
   */
  async create(
    data: Record<string, any>,
    translations?: Array<{ language_code: string; data: Record<string, any> }>
  ): Promise<DynamicContent> {
    const supabase = await createClient();

    // Validate data
    this.validateData(data);

    // Separate translatable and non-translatable fields
    const { baseData, translatableData } = this.separateFields(data);

    // Create main entry
    const { data: created, error: createError } = await supabase
      .from('dynamic_content')
      .insert({
        content_type_id: this.contentType.id,
        status: 'draft',
        data: baseData,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create ${this.contentType.singular_name}: ${createError.message}`);
    }

    // Create translations
    if (translations && translations.length > 0) {
      const translationRecords = translations.map((t) => ({
        content_id: created.id,
        language_code: t.language_code,
        data: t.data,
      }));

      const { error: transError } = await supabase
        .from('dynamic_content_translations')
        .insert(translationRecords);

      if (transError) {
        console.error('Translation creation failed:', transError);
      }
    }

    return created;
  }

  /**
   * Update an existing entry
   */
  async update(
    id: string,
    data: Record<string, any>,
    translations?: Array<{ language_code: string; data: Record<string, any> }>
  ): Promise<DynamicContent> {
    const supabase = await createClient();

    // Validate data
    this.validateData(data, true);

    // Separate translatable and non-translatable fields
    const { baseData } = this.separateFields(data);

    // Update main entry
    const { data: updated, error: updateError } = await supabase
      .from('dynamic_content')
      .update({
        data: baseData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('content_type_id', this.contentType.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update ${this.contentType.singular_name}: ${updateError.message}`);
    }

    // Update translations
    if (translations && translations.length > 0) {
      for (const translation of translations) {
        const { error: transError } = await supabase
          .from('dynamic_content_translations')
          .upsert({
            content_id: id,
            language_code: translation.language_code,
            data: translation.data,
            updated_at: new Date().toISOString(),
          });

        if (transError) {
          console.error('Translation update failed:', transError);
        }
      }
    }

    return updated;
  }

  /**
   * Delete an entry
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('dynamic_content')
      .delete()
      .eq('id', id)
      .eq('content_type_id', this.contentType.id);

    if (error) {
      throw new Error(`Failed to delete ${this.contentType.singular_name}: ${error.message}`);
    }
  }

  /**
   * Publish/unpublish entry
   */
  async setStatus(id: string, status: ContentStatus): Promise<DynamicContent> {
    const supabase = await createClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('dynamic_content')
      .update(updateData)
      .eq('id', id)
      .eq('content_type_id', this.contentType.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }

    return data;
  }

  /**
   * Count entries
   */
  async count(filters?: Record<string, any>): Promise<number> {
    const supabase = await createClient();
    let query = supabase
      .from('dynamic_content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type_id', this.contentType.id);

    if (filters) {
      query = this.applyFilters(query, filters);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count entries: ${error.message}`);
    }

    return count || 0;
  }

  // ============ Helper Methods ============

  private applyFilters(query: any, filters: Record<string, any>): any {
    Object.entries(filters).forEach(([key, value]) => {
      // Handle nested data fields (stored in JSONB)
      const field = this.fields.find((f) => f.name === key);
      const dataPath = field ? `data->${key}` : key;

      if (typeof value === 'object' && value !== null) {
        // Handle operators
        Object.entries(value).forEach(([op, val]) => {
          switch (op) {
            case '$eq':
              query = query.eq(dataPath, val);
              break;
            case '$ne':
              query = query.neq(dataPath, val);
              break;
            case '$in':
              query = query.in(dataPath, val);
              break;
            case '$notIn':
              query = query.not(dataPath, 'in', val);
              break;
            case '$gt':
              query = query.gt(dataPath, val);
              break;
            case '$gte':
              query = query.gte(dataPath, val);
              break;
            case '$lt':
              query = query.lt(dataPath, val);
              break;
            case '$lte':
              query = query.lte(dataPath, val);
              break;
            case '$contains':
              query = query.ilike(dataPath, `%${val}%`);
              break;
            case '$notContains':
              query = query.not(dataPath, 'ilike', `%${val}%`);
              break;
            case '$startsWith':
              query = query.ilike(dataPath, `${val}%`);
              break;
            case '$endsWith':
              query = query.ilike(dataPath, `%${val}`);
              break;
            case '$null':
              if (val) {
                query = query.is(dataPath, null);
              } else {
                query = query.not(dataPath, 'is', null);
              }
              break;
          }
        });
      } else {
        // Direct equality
        query = query.eq(dataPath, value);
      }
    });

    return query;
  }

  private applySort(query: any, sort: string[]): any {
    sort.forEach((sortStr) => {
      const [field, order] = sortStr.split(':');
      const ascending = order !== 'desc';

      // Check if field is in data JSONB
      const fieldDef = this.fields.find((f) => f.name === field);
      if (fieldDef) {
        query = query.order(`data->${field}`, { ascending });
      } else {
        query = query.order(field, { ascending });
      }
    });

    return query;
  }

  private separateFields(data: Record<string, any>): {
    baseData: Record<string, any>;
    translatableData: Record<string, any>;
  } {
    const baseData: Record<string, any> = {};
    const translatableData: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      const field = this.fields.find((f) => f.name === key);
      if (field) {
        if (field.translatable) {
          translatableData[key] = value;
        } else {
          baseData[key] = value;
        }
      }
    });

    return { baseData, translatableData };
  }

  private transformResponse(item: any, locale?: string): DynamicContent {
    // Merge data from base and translations
    const baseData = item.data || {};
    const translations = item.dynamic_content_translations || [];

    // If locale specified, merge translation data
    if (locale) {
      const translation = translations.find((t: any) => t.language_code === locale);
      if (translation) {
        Object.assign(baseData, translation.data);
      }
    }

    return {
      ...item,
      data: baseData,
      translations,
    };
  }

  private validateData(data: Record<string, any>, isUpdate = false): void {
    // Validate required fields
    if (!isUpdate) {
      const requiredFields = this.fields.filter((f) => f.required);
      for (const field of requiredFields) {
        if (!(field.name in data) || data[field.name] === null || data[field.name] === undefined) {
          throw new Error(`Required field "${field.display_name}" is missing`);
        }
      }
    }

    // Validate field types
    for (const [key, value] of Object.entries(data)) {
      const field = this.fields.find((f) => f.name === key);
      if (!field) continue;

      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error(`Invalid email format for "${field.display_name}"`);
          }
          break;
        case 'number':
          if (value !== null && value !== undefined) {
            if (field.min_value !== undefined && value < field.min_value) {
              throw new Error(`"${field.display_name}" must be at least ${field.min_value}`);
            }
            if (field.max_value !== undefined && value > field.max_value) {
              throw new Error(`"${field.display_name}" must be at most ${field.max_value}`);
            }
          }
          break;
        case 'text':
          if (value) {
            if (field.min_length !== undefined && value.length < field.min_length) {
              throw new Error(`"${field.display_name}" must be at least ${field.min_length} characters`);
            }
            if (field.max_length !== undefined && value.length > field.max_length) {
              throw new Error(`"${field.display_name}" must be at most ${field.max_length} characters`);
            }
          }
          break;
      }
    }
  }
}

/**
 * Factory function to create a service for any content type
 */
export async function createDynamicContentService(
  contentTypeId: string
): Promise<DynamicContentService> {
  const supabase = await createClient();

  // Fetch content type
  const { data: contentType, error: typeError } = await supabase
    .from('content_types')
    .select('*')
    .eq('id', contentTypeId)
    .single();

  if (typeError || !contentType) {
    throw new Error('Content type not found');
  }

  // Fetch fields
  const { data: fields, error: fieldsError } = await supabase
    .from('content_type_fields')
    .select('*')
    .eq('content_type_id', contentTypeId)
    .order('display_order');

  if (fieldsError) {
    throw new Error('Failed to fetch content type fields');
  }

  return new DynamicContentService(contentType, fields || []);
}

/**
 * Factory function to create a service by content type name
 */
export async function createDynamicContentServiceByName(
  contentTypeName: string
): Promise<DynamicContentService> {
  const supabase = await createClient();

  // Fetch content type
  const { data: contentType, error: typeError } = await supabase
    .from('content_types')
    .select('*')
    .eq('name', contentTypeName)
    .single();

  if (typeError || !contentType) {
    throw new Error(`Content type "${contentTypeName}" not found`);
  }

  // Fetch fields
  const { data: fields, error: fieldsError } = await supabase
    .from('content_type_fields')
    .select('*')
    .eq('content_type_id', contentType.id)
    .order('display_order');

  if (fieldsError) {
    throw new Error('Failed to fetch content type fields');
  }

  return new DynamicContentService(contentType, fields || []);
}
