// Fallback static configuration
export const fallbackLocales = ['pt', 'en'] as const;
export const fallbackDefaultLocale = 'pt';
export const fallbackLocaleNames: Record<string, string> = {
  pt: 'Português',
  en: 'English',
};

// Dynamic locale fetching from database (server-side only)
let cachedLocales: string[] | null = null;
let cachedDefaultLocale: string | null = null;
let cachedLocaleNames: Record<string, string> | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export async function getLocales(): Promise<string[]> {
  // Only import server-side code when actually needed
  const { getEnabledLanguages } = await import('@/lib/supabase/queries/languages');

  const now = Date.now();

  if (cachedLocales && now < cacheExpiry) {
    return cachedLocales;
  }

  try {
    const languages = await getEnabledLanguages();

    if (languages.length === 0) {
      cachedLocales = [...fallbackLocales];
    } else {
      cachedLocales = languages
        .sort((a, b) => a.display_order - b.display_order)
        .map(lang => lang.code);
    }

    cacheExpiry = now + CACHE_DURATION;
    return cachedLocales;
  } catch (error) {
    console.error('[getLocales] Error fetching locales:', error);
    return [...fallbackLocales];
  }
}

export async function getDefaultLocaleValue(): Promise<string> {
  // Only import server-side code when actually needed
  const { getDefaultLanguage } = await import('@/lib/supabase/queries/languages');

  const now = Date.now();

  if (cachedDefaultLocale && now < cacheExpiry) {
    return cachedDefaultLocale;
  }

  try {
    const defaultLang = await getDefaultLanguage();
    cachedDefaultLocale = defaultLang?.code || fallbackDefaultLocale;
    cacheExpiry = now + CACHE_DURATION;
    return cachedDefaultLocale;
  } catch (error) {
    console.error('[getDefaultLocaleValue] Error fetching default locale:', error);
    return fallbackDefaultLocale;
  }
}

export async function getLocaleNames(): Promise<Record<string, string>> {
  // Only import server-side code when actually needed
  const { getEnabledLanguages } = await import('@/lib/supabase/queries/languages');

  const now = Date.now();

  if (cachedLocaleNames && now < cacheExpiry) {
    return cachedLocaleNames;
  }

  try {
    const languages = await getEnabledLanguages();

    if (languages.length === 0) {
      cachedLocaleNames = { ...fallbackLocaleNames };
    } else {
      cachedLocaleNames = languages.reduce((acc, lang) => {
        acc[lang.code] = lang.native_name;
        return acc;
      }, {} as Record<string, string>);
    }

    cacheExpiry = now + CACHE_DURATION;
    return cachedLocaleNames;
  } catch (error) {
    console.error('[getLocaleNames] Error fetching locale names:', error);
    return { ...fallbackLocaleNames };
  }
}

// Helper to clear cache (useful when languages are updated)
export function clearLocaleCache(): void {
  cachedLocales = null;
  cachedDefaultLocale = null;
  cachedLocaleNames = null;
  cacheExpiry = 0;
}

// Backward compatibility exports (for static usage)
export const locales = fallbackLocales;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = fallbackDefaultLocale;
export const localeNames = fallbackLocaleNames;
