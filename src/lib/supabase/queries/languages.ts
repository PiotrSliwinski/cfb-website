import { createClient } from '@/lib/supabase/server';
import type { Language, LanguageCreate, LanguageUpdate } from '@/types/admin/language';
import type { ApiResponse } from '@/types/api/responses';

/**
 * Get all supported languages
 * @param enabledOnly - If true, return only enabled languages
 * @returns Array of languages sorted by display_order
 */
export async function getLanguages(enabledOnly: boolean = false): Promise<Language[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('supported_languages')
      .select('*')
      .order('display_order', { ascending: true });

    if (enabledOnly) {
      query = query.eq('enabled', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getLanguages] Database error:', error);
      return [];
    }

    return (data as Language[]) || [];
  } catch (error) {
    console.error('[getLanguages] Unexpected error:', error);
    return [];
  }
}

/**
 * Get enabled languages (for public use)
 * @returns Array of enabled languages
 */
export async function getEnabledLanguages(): Promise<Language[]> {
  return getLanguages(true);
}

/**
 * Get default language
 * @returns Default language or null
 */
export async function getDefaultLanguage(): Promise<Language | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('supported_languages')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error) {
      console.error('[getDefaultLanguage] Database error:', error);
      return null;
    }

    return data as Language;
  } catch (error) {
    console.error('[getDefaultLanguage] Unexpected error:', error);
    return null;
  }
}

/**
 * Get language by code
 * @param code - Language code (e.g., 'pt', 'en')
 * @returns Language or null
 */
export async function getLanguageByCode(code: string): Promise<Language | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('supported_languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('[getLanguageByCode] Database error:', error);
      return null;
    }

    return data as Language;
  } catch (error) {
    console.error('[getLanguageByCode] Unexpected error:', error);
    return null;
  }
}

/**
 * Create a new language
 * @param language - Language data
 * @returns ApiResponse with created language
 */
export async function createLanguage(
  language: LanguageCreate
): Promise<ApiResponse<Language>> {
  try {
    const supabase = await createClient();

    // Check if language code already exists
    const existing = await getLanguageByCode(language.code);
    if (existing) {
      return {
        success: false,
        error: {
          message: `Language with code '${language.code}' already exists`,
          code: 'DUPLICATE_ERROR',
        },
      };
    }

    // If this is being set as default, unset other defaults first
    if (language.is_default) {
      await supabase
        .from('supported_languages')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('supported_languages')
      .insert([language])
      .select()
      .single();

    if (error) {
      console.error('[createLanguage] Database error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to create language',
          code: 'DATABASE_ERROR',
          details: error,
        },
      };
    }

    return {
      success: true,
      data: data as Language,
      message: 'Language created successfully',
    };
  } catch (error) {
    console.error('[createLanguage] Unexpected error:', error);
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error,
      },
    };
  }
}

/**
 * Update an existing language
 * @param id - Language ID
 * @param updates - Partial language updates
 * @returns ApiResponse with updated language
 */
export async function updateLanguage(
  id: string,
  updates: LanguageUpdate
): Promise<ApiResponse<Language>> {
  try {
    const supabase = await createClient();

    // If setting as default, unset other defaults first
    if (updates.is_default) {
      await supabase
        .from('supported_languages')
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('supported_languages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateLanguage] Database error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update language',
          code: 'DATABASE_ERROR',
          details: error,
        },
      };
    }

    return {
      success: true,
      data: data as Language,
      message: 'Language updated successfully',
    };
  } catch (error) {
    console.error('[updateLanguage] Unexpected error:', error);
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error,
      },
    };
  }
}

/**
 * Delete a language
 * @param id - Language ID
 * @returns ApiResponse indicating success
 */
export async function deleteLanguage(id: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    // Check if this is the default language
    const { data: lang } = await supabase
      .from('supported_languages')
      .select('is_default, code')
      .eq('id', id)
      .single();

    if (lang?.is_default) {
      return {
        success: false,
        error: {
          message: 'Cannot delete the default language',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const { error } = await supabase
      .from('supported_languages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteLanguage] Database error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to delete language',
          code: 'DATABASE_ERROR',
          details: error,
        },
      };
    }

    return {
      success: true,
      data: undefined,
      message: 'Language deleted successfully',
    };
  } catch (error) {
    console.error('[deleteLanguage] Unexpected error:', error);
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error,
      },
    };
  }
}
