/**
 * Language management types
 */

export interface Language {
  id: string;
  code: string; // ISO 639-1 code (e.g., 'pt', 'en', 'fr')
  name: string; // English name (e.g., 'Portuguese')
  native_name: string; // Native name (e.g., 'Português')
  flag: string; // Emoji flag (e.g., '🇵🇹')
  enabled: boolean;
  is_default: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LanguageCreate {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  enabled?: boolean;
  is_default?: boolean;
  display_order?: number;
}

export interface LanguageUpdate {
  name?: string;
  native_name?: string;
  flag?: string;
  enabled?: boolean;
  is_default?: boolean;
  display_order?: number;
}

export interface TranslationStatus {
  language_code: string;
  total_keys: number;
  translated_keys: number;
  missing_keys: string[];
  completion_percentage: number;
  last_updated: string;
}

export interface LanguageWithStatus extends Language {
  translation_status: TranslationStatus;
}
