import { createClient } from '@/lib/supabase/server';

export async function getTeamMembers(locale: string) {
  const supabase = await createClient();

  // Try to fetch with specialties (if migration is applied)
  let { data: members, error } = await supabase
    .from('team_members')
    .select(`
      *,
      team_member_translations!inner(*)
    `)
    .eq('team_member_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  // Try to fetch specialties separately (gracefully handle if table doesn't exist yet)
  if (members && members.length > 0) {
    try {
      const memberIds = members.map(m => m.id);
      const { data: specialties } = await supabase
        .from('team_member_specialties')
        .select(`
          team_member_id,
          treatment_id,
          treatments(
            slug,
            treatment_translations!inner(title, language_code)
          )
        `)
        .in('team_member_id', memberIds)
        .eq('treatments.treatment_translations.language_code', locale)
        .order('display_order', { ascending: true });

      // Attach specialties to members
      if (specialties) {
        members = members.map(member => ({
          ...member,
          team_member_specialties: specialties.filter(s => s.team_member_id === member.id)
        }));
      }
    } catch (e) {
      // Table doesn't exist yet - that's ok, will work without specialties
      console.warn('Team member specialties table not found - migration may not be applied yet');
    }
  }

  return members || [];
}
