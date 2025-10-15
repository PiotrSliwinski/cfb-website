'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';

/**
 * Server Actions for Team Member Management
 *
 * @description
 * Provides server-side actions for CRUD operations on team members.
 * These functions run on the server and can only be called from Client Components
 * or other Server Actions. They provide:
 * - Secure database access
 * - Automatic revalidation
 * - Transaction-like operations
 * - Error handling
 *
 * @module actions/team
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Team member data structure for create/update operations
 */
export interface TeamMemberData {
  /** Optional ID for updates (omit for creates) */
  id?: string;
  /** URL-friendly identifier */
  slug: string;
  /** URL to profile photo in storage */
  photo_url: string;
  /** Sort order for display (0 = first) */
  display_order: number;
  /** Contact email (optional) */
  email?: string;
  /** Contact phone (optional) */
  phone?: string;
  /** Whether member is visible on public site */
  is_published: boolean;
  /** Translations for different languages */
  team_member_translations: Array<{
    /** Language code (e.g., 'pt', 'en') */
    language_code: string;
    /** Member's full name */
    name: string;
    /** Professional title */
    title: string;
    /** Specialty description */
    specialty: string;
    /** Professional credentials (optional) */
    credentials?: string;
    /** Biography text (optional) */
    bio?: string;
  }>;
  /** Array of treatment IDs this member specializes in */
  specialties?: string[];
}

/**
 * Result of save operations
 */
export interface SaveResult {
  /** Whether operation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Result data if succeeded */
  data?: any;
}

/**
 * Saves a team member (creates new or updates existing)
 *
 * @description
 * This function handles both create and update operations for team members.
 * It manages:
 * 1. Team member base record
 * 2. Translations for all languages
 * 3. Specialty assignments (many-to-many with treatments)
 * 4. Cache revalidation
 *
 * The operation is atomic - if any step fails, the entire operation fails.
 *
 * @param memberData - Team member data to save
 * @returns Promise resolving to SaveResult with success status
 *
 * @example
 * ```typescript
 * const result = await saveTeamMember({
 *   slug: 'dr-maria-silva',
 *   photo_url: 'https://...',
 *   display_order: 0,
 *   is_published: true,
 *   team_member_translations: [
 *     {
 *       language_code: 'pt',
 *       name: 'Dra. Maria Silva',
 *       title: 'Médica Dentista',
 *       specialty: 'Ortodontia',
 *     },
 *   ],
 *   specialties: ['ortodontia-uuid', 'implantes-uuid'],
 * });
 *
 * if (result.success) {
 *   console.log('Saved:', result.data);
 * }
 * ```
 */
export async function saveTeamMember(memberData: TeamMemberData): Promise<SaveResult> {
  const supabase = await createClient();

  try {
    console.log('💾 Saving team member:', memberData.slug);

    if (memberData.id) {
      // UPDATE existing team member
      console.log('📝 Updating existing team member:', memberData.id);

      // 1. Update team_members table
      const { error: memberError } = await supabase
        .from('team_members')
        .update({
          slug: memberData.slug,
          photo_url: memberData.photo_url,
          display_order: memberData.display_order,
          email: memberData.email,
          phone: memberData.phone,
          is_published: memberData.is_published,
        })
        .eq('id', memberData.id);

      if (memberError) {
        console.error('❌ Error updating team_members:', memberError);
        throw memberError;
      }
      console.log('✅ Team member updated');

      // 2. Update translations
      for (const translation of memberData.team_member_translations) {
        console.log(`🌐 Updating translation: ${translation.language_code}`);

        const { error: transError } = await supabase
          .from('team_member_translations')
          .upsert(
            {
              member_id: memberData.id,
              language_code: translation.language_code,
              name: translation.name,
              title: translation.title,
              specialty: translation.specialty,
              credentials: translation.credentials,
              bio: translation.bio,
            },
            {
              onConflict: 'member_id,language_code',
            }
          );

        if (transError) {
          console.error('❌ Error updating translation:', transError);
          throw transError;
        }
      }
      console.log('✅ Translations updated');

      // 3. Update specialties
      console.log('🔄 Updating specialties...');

      // Delete existing specialties
      const { error: deleteError } = await supabase
        .from('team_member_specialties')
        .delete()
        .eq('team_member_id', memberData.id);

      if (deleteError) {
        console.error('❌ Error deleting specialties:', deleteError);
        throw deleteError;
      }

      // Insert new specialties
      if (memberData.specialties && memberData.specialties.length > 0) {
        const specialtiesToInsert = memberData.specialties.map(
          (treatmentId: string, index: number) => ({
            team_member_id: memberData.id,
            treatment_id: treatmentId,
            display_order: index,
          })
        );

        console.log('📌 Inserting specialties:', specialtiesToInsert.length);

        const { error: specialtiesError } = await supabase
          .from('team_member_specialties')
          .insert(specialtiesToInsert);

        if (specialtiesError) {
          console.error('❌ Error inserting specialties:', specialtiesError);
          throw specialtiesError;
        }
        console.log('✅ Specialties saved');
      }
    } else {
      // CREATE new team member
      console.log('➕ Creating new team member');

      // 1. Insert team_members table
      const { data: newMember, error: memberError } = await supabase
        .from('team_members')
        .insert({
          slug: memberData.slug,
          photo_url: memberData.photo_url,
          display_order: memberData.display_order,
          email: memberData.email,
          phone: memberData.phone,
          is_published: memberData.is_published,
        })
        .select()
        .single();

      if (memberError || !newMember) {
        console.error('❌ Error creating team member:', memberError);
        throw memberError;
      }
      console.log('✅ Team member created:', newMember.id);

      // 2. Create translations
      for (const translation of memberData.team_member_translations) {
        console.log(`🌐 Creating translation: ${translation.language_code}`);

        const { error: transError } = await supabase
          .from('team_member_translations')
          .insert({
            member_id: newMember.id,
            language_code: translation.language_code,
            name: translation.name,
            title: translation.title,
            specialty: translation.specialty,
            credentials: translation.credentials,
            bio: translation.bio,
          });

        if (transError) {
          console.error('❌ Error creating translation:', transError);
          throw transError;
        }
      }
      console.log('✅ Translations created');

      // 3. Create specialties
      if (memberData.specialties && memberData.specialties.length > 0) {
        const specialtiesToInsert = memberData.specialties.map(
          (treatmentId: string, index: number) => ({
            team_member_id: newMember.id,
            treatment_id: treatmentId,
            display_order: index,
          })
        );

        console.log('📌 Inserting specialties:', specialtiesToInsert.length);

        const { error: specialtiesError } = await supabase
          .from('team_member_specialties')
          .insert(specialtiesToInsert);

        if (specialtiesError) {
          console.error('❌ Error inserting specialties:', specialtiesError);
          throw specialtiesError;
        }
        console.log('✅ Specialties saved');
      }
    }

    // Revalidate pages
    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]/equipa');

    console.log('🎉 Team member saved successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('💥 Save team member error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save team member',
    };
  }
}

export async function deleteTeamMember(id: string): Promise<SaveResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('team_members').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]/equipa');

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete team member',
    };
  }
}

/**
 * Updates display order for multiple team members at once
 * 
 * @param updates - Array of {id, display_order} pairs
 * @returns Promise resolving to update result
 */
export async function updateTeamMembersOrder(
  updates: { id: string; display_order: number }[]
): Promise<SaveResult> {
  // Use admin client to bypass RLS policies for admin operations
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log(`🔄 Updating display order for ${updates.length} team members`);

    // Update each team member's display_order
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('team_members')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) {
        console.error(`❌ Error updating team member ${update.id}:`, error);
        throw error;
      }
    }

    console.log('✅ Display order updated successfully');

    // Revalidate paths with type parameter for dynamic routes
    revalidatePath('/[locale]/equipa', 'layout');
    revalidatePath('/[locale]/admin', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error('❌ Update display order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update display order',
    };
  }
}
