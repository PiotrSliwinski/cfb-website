import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { ClinicSettings, ClinicSettingsUpdate } from '@/types/admin/clinic';
import type { ApiResponse } from '@/types/api/responses';

// Re-export types for backward compatibility
export type { ClinicSettings, ClinicSettingsUpdate };

/**
 * Get clinic settings (there should only be one record)
 * Memoized for the duration of the request to avoid duplicate queries
 * @returns ClinicSettings or null if not found or error occurs
 */
export const getClinicSettings = cache(async (): Promise<ClinicSettings | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (error) {
      console.error('[getClinicSettings] Database error:', error);
      return null;
    }

    return data as ClinicSettings;
  } catch (error) {
    console.error('[getClinicSettings] Unexpected error:', error);
    return null;
  }
});

/**
 * Update clinic settings
 * @param id - Clinic settings record ID
 * @param updates - Partial updates to apply
 * @returns ApiResponse indicating success or failure
 */
export async function updateClinicSettings(
  id: string,
  updates: ClinicSettingsUpdate
): Promise<ApiResponse<ClinicSettings>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('clinic_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateClinicSettings] Database error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update clinic settings',
          code: 'DATABASE_ERROR',
          details: error,
        },
      };
    }

    return {
      success: true,
      data: data as ClinicSettings,
      message: 'Clinic settings updated successfully',
    };
  } catch (error) {
    console.error('[updateClinicSettings] Unexpected error:', error);
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
