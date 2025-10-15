import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'pt';

    const supabase = await createClient();

    // Fetch team members
    let { data: members, error } = await supabase
      .from('team_members')
      .select(
        `
        *,
        team_member_translations!inner(*)
      `
      )
      .eq('team_member_translations.language_code', locale)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Fetch specialties separately
    if (members && members.length > 0) {
      try {
        const memberIds = members.map((m) => m.id);
        const { data: specialties } = await supabase
          .from('team_member_specialties')
          .select(
            `
            team_member_id,
            treatment_id,
            treatments(
              slug,
              treatment_translations!inner(title, language_code)
            )
          `
          )
          .in('team_member_id', memberIds)
          .eq('treatments.treatment_translations.language_code', locale)
          .order('display_order', { ascending: true });

        if (specialties) {
          members = members.map((member) => ({
            ...member,
            team_member_specialties: specialties.filter(
              (s) => s.team_member_id === member.id
            ),
          }));
        }
      } catch (e) {
        console.warn('Specialties table not found, continuing without them');
      }
    }

    return NextResponse.json(members || []);
  } catch (error: any) {
    console.error('API /team error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
