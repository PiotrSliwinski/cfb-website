'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/server';

export interface TreatmentTranslation {
  language_code: string;
  title: string;
  subtitle?: string;
  description?: string;
  short_description?: string;
  benefits?: string;
  procedure?: string;
  aftercare?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface TreatmentData {
  id?: string;
  slug: string;
  category: string;
  icon_name?: string;
  icon_url?: string;
  hero_image_url?: string;
  display_order: number;
  is_published: boolean;
  treatment_translations: TreatmentTranslation[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export async function saveTreatment(treatmentData: TreatmentData): Promise<ActionResult> {
  // Require authentication
  await requireAuth();

  const supabase = await createClient();

  try {
    console.log('💾 Saving treatment:', treatmentData.slug);

    if (treatmentData.id) {
      // UPDATE existing treatment
      console.log('📝 Updating existing treatment:', treatmentData.id);

      const { error: treatmentError } = await supabase
        .from('treatments')
        .update({
          slug: treatmentData.slug,
          category: treatmentData.category,
          icon_name: treatmentData.icon_name,
          icon_url: treatmentData.icon_url,
          hero_image_url: treatmentData.hero_image_url,
          display_order: treatmentData.display_order,
          is_published: treatmentData.is_published,
        })
        .eq('id', treatmentData.id);

      if (treatmentError) {
        console.error('❌ Error updating treatment:', treatmentError);
        throw treatmentError;
      }
      console.log('✅ Treatment updated');

      // Update translations
      for (const translation of treatmentData.treatment_translations) {
        console.log(`🌐 Updating translation: ${translation.language_code}`);

        const { error: transError } = await supabase
          .from('treatment_translations')
          .upsert(
            {
              treatment_id: treatmentData.id,
              language_code: translation.language_code,
              title: translation.title,
              subtitle: translation.subtitle,
              description: translation.description,
              short_description: translation.short_description,
              benefits: translation.benefits,
              procedure: translation.procedure,
              aftercare: translation.aftercare,
              meta_title: translation.meta_title,
              meta_description: translation.meta_description,
            },
            {
              onConflict: 'treatment_id,language_code',
            }
          );

        if (transError) {
          console.error('❌ Error updating translation:', transError);
          throw transError;
        }
      }
      console.log('✅ Translations updated');
    } else {
      // CREATE new treatment
      console.log('➕ Creating new treatment');

      const { data: newTreatment, error: treatmentError } = await supabase
        .from('treatments')
        .insert({
          slug: treatmentData.slug,
          category: treatmentData.category,
          icon_name: treatmentData.icon_name,
          icon_url: treatmentData.icon_url,
          hero_image_url: treatmentData.hero_image_url,
          display_order: treatmentData.display_order,
          is_published: treatmentData.is_published,
        })
        .select()
        .single();

      if (treatmentError || !newTreatment) {
        console.error('❌ Error creating treatment:', treatmentError);
        throw treatmentError;
      }
      console.log('✅ Treatment created:', newTreatment.id);

      // Create translations
      for (const translation of treatmentData.treatment_translations) {
        console.log(`🌐 Creating translation: ${translation.language_code}`);

        const { error: transError } = await supabase
          .from('treatment_translations')
          .insert({
            treatment_id: newTreatment.id,
            language_code: translation.language_code,
            title: translation.title,
            subtitle: translation.subtitle,
            description: translation.description,
            short_description: translation.short_description,
            benefits: translation.benefits,
            procedure: translation.procedure,
            aftercare: translation.aftercare,
            meta_title: translation.meta_title,
            meta_description: translation.meta_description,
          });

        if (transError) {
          console.error('❌ Error creating translation:', transError);
          throw transError;
        }
      }
      console.log('✅ Translations created');
    }

    // Revalidate pages
    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]/tratamentos');
    revalidatePath('/[locale]/tratamentos/[slug]');

    console.log('🎉 Treatment saved successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('💥 Save treatment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save treatment',
    };
  }
}

export async function deleteTreatment(id: string): Promise<ActionResult> {
  // Require authentication
  await requireAuth();

  const supabase = await createClient();

  try {
    console.log('🗑️ Deleting treatment:', id);

    const { error } = await supabase.from('treatments').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/[locale]/admin');
    revalidatePath('/[locale]/tratamentos');

    console.log('✅ Treatment deleted');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Delete treatment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete treatment',
    };
  }
}

export async function getTreatments(): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*, treatment_translations(*)')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Get treatments error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load treatments',
    };
  }
}

export async function getTeamMembers(): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, team_member_translations(*)')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Load specialties for each member
    if (data && data.length > 0) {
      const memberIds = data.map((m) => m.id);
      const { data: specialties } = await supabase
        .from('team_member_specialties')
        .select('team_member_id, treatment_id')
        .in('team_member_id', memberIds);

      // Attach specialties to members
      const membersWithSpecialties = data.map((member) => ({
        ...member,
        specialties: specialties
          ?.filter((s) => s.team_member_id === member.id)
          .map((s) => s.treatment_id) || [],
      }));

      return { success: true, data: membersWithSpecialties };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Get team members error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load team members',
    };
  }
}

/**
 * Updates display order for multiple treatments at once
 * 
 * @param updates - Array of {id, display_order} pairs
 * @returns Promise resolving to update result
 */
export async function updateTreatmentsOrder(
  updates: { id: string; display_order: number }[]
): Promise<ActionResult> {
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
    console.log(`🔄 Updating display order for ${updates.length} treatments`);
    console.log('📝 Updates:', JSON.stringify(updates, null, 2));

    // Update each treatment's display_order
    for (const update of updates) {
      console.log(`   Updating ${update.id} to display_order: ${update.display_order}`);
      const { data, error } = await supabaseAdmin
        .from('treatments')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
        .select();

      if (error) {
        console.error(`❌ Error updating treatment ${update.id}:`, error);
        throw error;
      }
      console.log(`   ✓ Updated:`, data);
    }

    console.log('✅ Display order updated successfully');

    // Verify the updates
    const { data: verification } = await supabaseAdmin
      .from('treatments')
      .select('id, slug, display_order')
      .order('display_order', { ascending: true });
    console.log('🔍 Verification - Current order in DB:', verification);

    // Revalidate paths with type parameter for dynamic routes
    revalidatePath('/[locale]/tratamentos', 'layout');
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

/**
 * Save treatment from editor (handles the flattened form structure)
 * Used by TreatmentEditor component
 */
export interface EditorTreatmentData {
  id?: string;
  slug: string;
  display_order: number;
  is_published: boolean;
  is_featured?: boolean;
  icon_url?: string | null;
  hero_image_url?: string | null;
  // Portuguese fields
  pt_title: string;
  pt_subtitle?: string;
  pt_description?: string;
  pt_benefits?: any;
  pt_process_steps?: any;
  pt_section_content?: any;
  // English fields
  en_title: string;
  en_subtitle?: string;
  en_description?: string;
  en_benefits?: any;
  en_process_steps?: any;
  en_section_content?: any;
}

export async function saveTreatmentFromEditor(data: EditorTreatmentData): Promise<ActionResult> {
  // Require authentication
  await requireAuth();

  const supabase = await createClient();

  try {
    console.log('💾 Saving treatment from editor:', data.slug);

    // Prepare treatment data
    const treatmentData = {
      id: data.id,
      slug: data.slug,
      display_order: data.display_order,
      is_published: data.is_published,
      is_featured: data.is_featured ?? false,
      icon_url: data.icon_url || null,
      hero_image_url: data.hero_image_url || null,
    };

    let treatmentId = data.id;

    if (treatmentId) {
      // UPDATE existing treatment
      const { error: treatmentError } = await supabase
        .from('treatments')
        .update(treatmentData)
        .eq('id', treatmentId);

      if (treatmentError) throw treatmentError;
    } else {
      // CREATE new treatment
      const { data: newTreatment, error: treatmentError } = await supabase
        .from('treatments')
        .insert(treatmentData)
        .select()
        .single();

      if (treatmentError || !newTreatment) throw treatmentError;
      treatmentId = newTreatment.id;
    }

    // Upsert Portuguese translation
    const { error: ptError } = await supabase
      .from('treatment_translations')
      .upsert(
        {
          treatment_id: treatmentId,
          language_code: 'pt',
          title: data.pt_title,
          subtitle: data.pt_subtitle || null,
          description: data.pt_description || null,
          benefits: data.pt_benefits || null,
          process_steps: data.pt_process_steps || null,
          section_content: data.pt_section_content || null,
        },
        {
          onConflict: 'treatment_id,language_code',
        }
      );

    if (ptError) throw ptError;

    // Upsert English translation
    const { error: enError } = await supabase
      .from('treatment_translations')
      .upsert(
        {
          treatment_id: treatmentId,
          language_code: 'en',
          title: data.en_title,
          subtitle: data.en_subtitle || null,
          description: data.en_description || null,
          benefits: data.en_benefits || null,
          process_steps: data.en_process_steps || null,
          section_content: data.en_section_content || null,
        },
        {
          onConflict: 'treatment_id,language_code',
        }
      );

    if (enError) throw enError;

    // Revalidate pages
    revalidatePath('/admin/treatments');
    revalidatePath('/[locale]/tratamentos');
    revalidatePath('/[locale]/tratamentos/[slug]');

    console.log('✅ Treatment saved successfully!');
    return { success: true, data: { id: treatmentId } };
  } catch (error: any) {
    console.error('❌ Save treatment from editor error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save treatment',
    };
  }
}
