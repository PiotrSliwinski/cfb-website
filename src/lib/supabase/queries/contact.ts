/**
 * Contact Information Query Functions
 * Server-side functions for fetching contact information from Supabase
 */

import { createClient } from '@/lib/supabase/server';
import { Locale } from '@/types';

export interface ContactInformation {
  id: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  google_maps_embed_url?: string;
  is_primary: boolean;
  translations?: Array<{
    language_code: string;
    business_hours?: string;
    additional_notes?: string;
  }>;
}

/**
 * Get primary contact information for a given locale
 */
export async function getContactInformation(locale: Locale): Promise<ContactInformation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contact_information')
    .select(
      `
      *,
      contact_information_translations!inner(*)
    `
    )
    .eq('contact_information_translations.language_code', locale)
    .eq('is_primary', true)
    .single();

  if (error) {
    console.error('Error fetching contact information:', error);
    return null;
  }

  return data as unknown as ContactInformation;
}
