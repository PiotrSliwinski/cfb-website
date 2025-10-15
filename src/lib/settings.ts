/**
 * Database-backed Settings Management
 *
 * @description
 * Provides functions to read application settings from the database.
 * Settings are cached for performance and fall back to environment variables.
 *
 * Use this instead of hardcoded config values for settings that admins should
 * be able to change via the admin panel.
 */

'use server';

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Settings Cache
// ============================================================================

let settingsCache: Record<string, any> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Clears the settings cache
 * Call this after updating settings to ensure fresh data
 */
export function clearSettingsCache() {
  settingsCache = {};
  cacheTimestamp = 0;
}

/**
 * Loads all settings from database with caching
 *
 * @returns Promise resolving to settings object
 * @internal
 */
async function loadSettings(): Promise<Record<string, any>> {
  const now = Date.now();

  // Return cache if valid
  if (cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    return settingsCache;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('settings').select('key, value');

    if (!error && data) {
      // Convert array to key-value object
      settingsCache = data.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        {} as Record<string, any>
      );
      cacheTimestamp = now;
    } else {
      console.warn('Failed to load settings from database:', error);
    }
  } catch (error) {
    console.warn('Exception loading settings from database:', error);
  }

  return settingsCache;
}

/**
 * Gets a setting value from database or falls back to environment variable
 *
 * @template T - The expected return type
 * @param key - Setting key (e.g., 'app.name')
 * @param fallback - Optional fallback value
 * @returns Promise resolving to setting value
 *
 * @example
 * ```typescript
 * const appName = await getSetting('app.name', 'Default Clinic');
 * const enableReviews = await getSetting<boolean>('features.enableReviews', true);
 * ```
 */
export async function getSetting<T = any>(key: string, fallback?: T): Promise<T> {
  const settings = await loadSettings();

  // Return from cache if available
  if (settings[key] !== undefined) {
    return settings[key] as T;
  }

  // Fallback to environment variable
  const envKey = `NEXT_PUBLIC_${key.toUpperCase().replace(/\./g, '_')}`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    // Try to parse JSON for complex types
    try {
      return JSON.parse(envValue) as T;
    } catch {
      return envValue as T;
    }
  }

  // Return fallback if provided
  if (fallback !== undefined) {
    return fallback;
  }

  console.warn(`Setting ${key} not found in database or environment`);
  return undefined as T;
}

/**
 * Gets multiple settings at once
 *
 * @param keys - Array of setting keys
 * @returns Promise resolving to object with requested settings
 *
 * @example
 * ```typescript
 * const { 'app.name': name, 'contact.email': email } = await getSettings([
 *   'app.name',
 *   'contact.email'
 * ]);
 * ```
 */
export async function getSettings(keys: string[]): Promise<Record<string, any>> {
  const settings = await loadSettings();
  const result: Record<string, any> = {};

  for (const key of keys) {
    result[key] = settings[key];
  }

  return result;
}

/**
 * Gets all settings in a category
 *
 * @param category - Category name (e.g., 'contact', 'features')
 * @returns Promise resolving to settings in that category
 *
 * @example
 * ```typescript
 * const contactSettings = await getSettingsByCategory('contact');
 * // Returns: { 'contact.email': '...', 'contact.phone': '...' }
 * ```
 */
export async function getSettingsByCategory(category: string): Promise<Record<string, any>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', category);

    if (error) {
      console.warn(`Failed to load settings for category ${category}:`, error);
      return {};
    }

    return (
      data?.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        {} as Record<string, any>
      ) || {}
    );
  } catch (error) {
    console.warn(`Exception loading settings for category ${category}:`, error);
    return {};
  }
}

// ============================================================================
// Convenience Functions for Common Settings
// ============================================================================

/**
 * Gets application configuration
 */
export async function getAppConfig() {
  return {
    name: await getSetting('app.name', 'Clínica Ferreira Borges'),
    defaultLocale: await getSetting('app.defaultLocale', 'pt'),
    supportedLocales: await getSetting('app.supportedLocales', ['pt', 'en']),
  };
}

/**
 * Gets contact information
 */
export async function getContactInfo() {
  return {
    email: await getSetting('contact.email', ''),
    phone: await getSetting('contact.phone', ''),
    address: await getSetting('contact.address', ''),
    hours: await getSetting('contact.hours', ''),
  };
}

/**
 * Gets social media links
 */
export async function getSocialLinks() {
  return {
    facebook: await getSetting('social.facebook', ''),
    instagram: await getSetting('social.instagram', ''),
    linkedin: await getSetting('social.linkedin', ''),
  };
}

/**
 * Checks if a feature is enabled
 *
 * @param feature - Feature name (e.g., 'enableReviews')
 * @returns Promise resolving to true if enabled
 *
 * @example
 * ```typescript
 * if (await isFeatureEnabled('enableReviews')) {
 *   // Show reviews section
 * }
 * ```
 */
export async function isFeatureEnabled(feature: string): Promise<boolean> {
  const value = await getSetting(`features.${feature}`, false);
  return Boolean(value);
}

/**
 * Gets SEO configuration
 */
export async function getSEOConfig() {
  return {
    metaTitle: await getSetting('seo.metaTitle', 'Clínica Ferreira Borges'),
    metaDescription: await getSetting(
      'seo.metaDescription',
      'Clínica dentária de excelência no Porto'
    ),
    keywords: await getSetting('seo.keywords', []),
  };
}

/**
 * Gets Google services configuration
 */
export async function getGoogleConfig() {
  return {
    reviewsPlaceId: await getSetting('google.reviewsPlaceId', ''),
    analyticsId: await getSetting('google.analyticsId', ''),
    mapsApiKey: await getSetting('google.mapsApiKey', ''),
  };
}
