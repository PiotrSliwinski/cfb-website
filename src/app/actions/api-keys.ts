'use server';

/**
 * Server Actions for API Keys Management
 *
 * @description
 * Provides server-side actions for managing API keys and credentials.
 * These are stored separately from settings for enhanced security.
 *
 * @module actions/api-keys
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * API key data structure
 */
export interface APIKey {
  id: string;
  name: string;
  key_value: string;
  service: string;
  description?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API key input for create/update
 */
export interface APIKeyInput {
  name: string;
  key_value: string;
  service: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Result of API key operations
 */
export interface APIKeyResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Gets all API keys, optionally filtered by service
 *
 * @param service - Optional service filter (google, supabase, email, etc.)
 * @returns Promise resolving to API keys result
 *
 * @example
 * ```typescript
 * const result = await getAPIKeys('google');
 * if (result.success) {
 *   console.log(result.data); // Array of Google API keys
 * }
 * ```
 */
export async function getAPIKeys(service?: string): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    let query = supabase.from('api_keys').select('*').order('service, name');

    if (service) {
      query = query.eq('service', service);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching API keys:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error in getAPIKeys:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets a single API key by name
 *
 * @param name - API key name (e.g., 'GOOGLE_PLACES_API_KEY')
 * @returns Promise resolving to API key result
 *
 * @example
 * ```typescript
 * const result = await getAPIKey('GOOGLE_PLACES_API_KEY');
 * if (result.success) {
 *   console.log(result.data.key_value);
 * }
 * ```
 */
export async function getAPIKey(name: string): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      console.error(`❌ Error fetching API key ${name}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error in getAPIKey(${name}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Updates an API key value
 *
 * @param name - API key name to update
 * @param keyValue - New key value
 * @returns Promise resolving to update result
 *
 * @example
 * ```typescript
 * const result = await updateAPIKey('GOOGLE_PLACES_API_KEY', 'new-key-value');
 * if (result.success) {
 *   console.log('API key updated');
 * }
 * ```
 */
export async function updateAPIKey(
  name: string,
  keyValue: string
): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    console.log(`💾 Updating API key: ${name}`);

    const { error } = await supabase
      .from('api_keys')
      .update({
        key_value: keyValue,
        updated_at: new Date().toISOString(),
      })
      .eq('name', name);

    if (error) {
      console.error(`❌ Error updating API key ${name}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ API key ${name} updated`);

    // Revalidate paths that might use this key
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error(`❌ Error in updateAPIKey(${name}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Creates or updates multiple API keys at once
 *
 * @param apiKeys - Array of API keys to upsert
 * @returns Promise resolving to batch update result
 *
 * @example
 * ```typescript
 * const result = await batchUpdateAPIKeys([
 *   { name: 'GOOGLE_PLACES_API_KEY', key_value: 'key1', service: 'google' },
 *   { name: 'GOOGLE_MAPS_API_KEY', key_value: 'key2', service: 'google' },
 * ]);
 * ```
 */
export async function batchUpdateAPIKeys(
  apiKeys: APIKeyInput[]
): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    console.log(`💾 Batch updating ${apiKeys.length} API keys`);

    const { error } = await supabase.from('api_keys').upsert(
      apiKeys.map((key) => ({
        name: key.name,
        key_value: key.key_value,
        service: key.service,
        description: key.description,
        is_active: key.is_active ?? true,
        updated_at: new Date().toISOString(),
      })),
      {
        onConflict: 'name',
      }
    );

    if (error) {
      console.error('❌ Error batch updating API keys:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Batch updated ${apiKeys.length} API keys`);

    // Revalidate paths
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error('❌ Error in batchUpdateAPIKeys:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Toggles an API key's active status
 *
 * @param name - API key name
 * @param isActive - New active status
 * @returns Promise resolving to toggle result
 *
 * @example
 * ```typescript
 * const result = await toggleAPIKeyStatus('OPENAI_API_KEY', false);
 * ```
 */
export async function toggleAPIKeyStatus(
  name: string,
  isActive: boolean
): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    console.log(`🔄 Toggling API key ${name} to ${isActive ? 'active' : 'inactive'}`);

    const { error } = await supabase
      .from('api_keys')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('name', name);

    if (error) {
      console.error(`❌ Error toggling API key ${name}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ API key ${name} toggled`);

    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error(`❌ Error in toggleAPIKeyStatus(${name}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deletes an API key
 *
 * @param name - API key name to delete
 * @returns Promise resolving to deletion result
 *
 * @example
 * ```typescript
 * const result = await deleteAPIKey('OLD_API_KEY');
 * ```
 */
export async function deleteAPIKey(name: string): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    console.log(`🗑️ Deleting API key: ${name}`);

    const { error } = await supabase.from('api_keys').delete().eq('name', name);

    if (error) {
      console.error(`❌ Error deleting API key ${name}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ API key ${name} deleted`);

    revalidatePath('/[locale]/admin');

    return { success: true };
  } catch (error) {
    console.error(`❌ Error in deleteAPIKey(${name}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets all unique services
 *
 * @returns Promise resolving to array of service names
 *
 * @example
 * ```typescript
 * const result = await getServices();
 * // result.data: ['google', 'supabase', 'email', 'payment', ...]
 * ```
 */
export async function getServices(): Promise<APIKeyResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('service')
      .order('service');

    if (error) {
      console.error('❌ Error fetching services:', error);
      return { success: false, error: error.message };
    }

    const services = [...new Set(data?.map((s) => s.service) || [])];

    return { success: true, data: services };
  } catch (error) {
    console.error('❌ Error in getServices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
