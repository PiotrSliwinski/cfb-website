'use server';

/**
 * Server Actions for Settings Management
 *
 * @description
 * Provides server-side actions for CRUD operations on application settings.
 * Settings are stored in the database and can be managed via the admin panel.
 *
 * @module actions/settings
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Setting data structure
 */
export interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Setting input for create/update
 */
export interface SettingInput {
  key: string;
  value: any;
  category: string;
  description?: string;
  is_public?: boolean;
}

/**
 * Result of settings operations
 */
export interface SettingsResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Gets all settings, optionally filtered by category
 *
 * @param category - Optional category filter
 * @returns Promise resolving to settings result
 *
 * @example
 * ```typescript
 * const result = await getSettings('contact');
 * if (result.success) {
 *   console.log(result.data); // Array of contact settings
 * }
 * ```
 */
export async function getSettings(category?: string): Promise<SettingsResult> {
  const supabase = await createClient();

  try {
    let query = supabase.from('settings').select('*').order('category, key');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching settings:', error);
      return { success: false, error: error.message };
    }

    // Parse JSON values
    const settings = data?.map((setting) => ({
      ...setting,
      value: setting.value,
    })) || [];

    return { success: true, data: settings };
  } catch (error) {
    console.error('❌ Error in getSettings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets a single setting by key
 *
 * @param key - Setting key (e.g., 'app.name')
 * @returns Promise resolving to setting value or null
 *
 * @example
 * ```typescript
 * const result = await getSetting('app.name');
 * if (result.success) {
 *   console.log(result.data); // "Clínica Ferreira Borges"
 * }
 * ```
 */
export async function getSetting(key: string): Promise<SettingsResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`❌ Error fetching setting ${key}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.value };
  } catch (error) {
    console.error(`❌ Error in getSetting(${key}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Updates a setting value
 *
 * @param key - Setting key to update
 * @param value - New value (will be JSON stringified)
 * @returns Promise resolving to update result
 *
 * @example
 * ```typescript
 * const result = await updateSetting('app.name', 'New Clinic Name');
 * if (result.success) {
 *   console.log('Setting updated');
 * }
 * ```
 */
export async function updateSetting(key: string, value: any): Promise<SettingsResult> {
  const supabase = await createClient();

  try {
    console.log(`💾 Updating setting: ${key}`);

    const { error } = await supabase
      .from('settings')
      .update({
        value: value,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key);

    if (error) {
      console.error(`❌ Error updating setting ${key}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Setting ${key} updated`);

    // Revalidate paths that might use this setting
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error(`❌ Error in updateSetting(${key}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Creates or updates multiple settings at once
 *
 * @param settings - Array of settings to upsert
 * @returns Promise resolving to batch update result
 *
 * @example
 * ```typescript
 * const result = await batchUpdateSettings([
 *   { key: 'app.name', value: 'New Name', category: 'app' },
 *   { key: 'contact.email', value: 'new@email.com', category: 'contact' },
 * ]);
 * ```
 */
export async function batchUpdateSettings(
  settings: SettingInput[]
): Promise<SettingsResult> {
  const supabase = await createClient();

  try {
    console.log(`💾 Batch updating ${settings.length} settings`);

    const { error } = await supabase.from('settings').upsert(
      settings.map((setting) => ({
        key: setting.key,
        value: setting.value,
        category: setting.category,
        description: setting.description,
        is_public: setting.is_public ?? false,
        updated_at: new Date().toISOString(),
      })),
      {
        onConflict: 'key',
      }
    );

    if (error) {
      console.error('❌ Error batch updating settings:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Batch updated ${settings.length} settings`);

    // Revalidate paths
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error('❌ Error in batchUpdateSettings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deletes a setting
 *
 * @param key - Setting key to delete
 * @returns Promise resolving to deletion result
 *
 * @example
 * ```typescript
 * const result = await deleteSetting('custom.setting');
 * if (result.success) {
 *   console.log('Setting deleted');
 * }
 * ```
 */
export async function deleteSetting(key: string): Promise<SettingsResult> {
  const supabase = await createClient();

  try {
    console.log(`🗑️ Deleting setting: ${key}`);

    const { error } = await supabase.from('settings').delete().eq('key', key);

    if (error) {
      console.error(`❌ Error deleting setting ${key}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Setting ${key} deleted`);

    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error(`❌ Error in deleteSetting(${key}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets all setting categories
 *
 * @returns Promise resolving to array of unique categories
 *
 * @example
 * ```typescript
 * const result = await getCategories();
 * // result.data: ['app', 'contact', 'features', 'social', ...]
 * ```
 */
export async function getCategories(): Promise<SettingsResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('category')
      .order('category');

    if (error) {
      console.error('❌ Error fetching categories:', error);
      return { success: false, error: error.message };
    }

    const categories = [...new Set(data?.map((s) => s.category) || [])];

    return { success: true, data: categories };
  } catch (error) {
    console.error('❌ Error in getCategories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
