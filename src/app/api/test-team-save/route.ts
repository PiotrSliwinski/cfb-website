import { NextResponse } from 'next/server';
import { saveTeamMember } from '@/app/actions/team';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get a test team member
    const { data: members } = await supabase
      .from('team_members')
      .select('*, team_member_translations(*)')
      .limit(1)
      .single();

    if (!members) {
      return NextResponse.json({ error: 'No team members found' }, { status: 404 });
    }

    // 2. Get a test treatment for specialty
    const { data: treatments } = await supabase
      .from('treatments')
      .select('id')
      .limit(2);

    const testData = {
      id: members.id,
      slug: members.slug,
      photo_url: members.photo_url,
      display_order: members.display_order,
      email: members.email,
      phone: members.phone,
      is_published: members.is_published,
      team_member_translations: members.team_member_translations,
      specialties: treatments?.map((t) => t.id) || [],
    };

    console.log('🧪 Testing save with data:', {
      id: testData.id,
      slug: testData.slug,
      specialties: testData.specialties.length,
    });

    // 3. Test save
    const result = await saveTeamMember(testData);

    if (result.success) {
      // 4. Verify the save by querying back
      const { data: savedMember } = await supabase
        .from('team_members')
        .select(
          `
          *,
          team_member_translations(*),
          team_member_specialties(
            treatment_id,
            treatments(slug)
          )
        `
        )
        .eq('id', members.id)
        .single();

      return NextResponse.json({
        success: true,
        message: 'Team member save test passed!',
        original: testData,
        saved: savedMember,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
