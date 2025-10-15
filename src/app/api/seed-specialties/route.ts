import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseAdmin = createClient(
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
    // Get all treatments
    const { data: treatments } = await supabaseAdmin
      .from('treatments')
      .select('id, slug, treatment_translations(title, language_code)')
      .eq('treatment_translations.language_code', 'pt');

    // Get all team members
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select('id, slug, team_member_translations(name, language_code)')
      .eq('team_member_translations.language_code', 'pt');

    console.log('📋 Treatments:', treatments);
    console.log('👥 Team members:', teamMembers);

    // Create a mapping of slug to treatment ID
    const treatmentMap: Record<string, string> = {};
    treatments?.forEach((t: any) => {
      treatmentMap[t.slug] = t.id;
    });

    // Create a mapping of name to team member ID
    const memberMap: Record<string, string> = {};
    teamMembers?.forEach((m: any) => {
      const name = m.team_member_translations?.[0]?.name;
      if (name) {
        memberMap[name] = m.id;
      }
    });

    // Specialty mappings based on the website
    const specialtyMappings: Record<string, string[]> = {
      'Dra. Anna Carolina Ribeiro': [
        'consulta-dentaria',
        'ortodontia',
        'aparelho-invisivel',
        'dentisteria'
      ],
      'Dr. Carlos Sousa': [
        'consulta-dentaria',
        'ortodontia',
        'aparelho-invisivel',
        'medicina-dentaria-do-sono',
        'dor-orofacial'
      ],
      'Dra. Filipa Caeiro': [
        'consulta-dentaria',
        'implantes-dentarios',
        'cirurgia-oral',
        'reabilitacao-oral'
      ],
      'Filipa Cunha': [
        'limpeza-dentaria'
      ],
      'Dra. Filipa Marques': [
        'odontopediatria'
      ],
      'Dr. Ronite Harjivan': [
        'consulta-dentaria',
        'implantes-dentarios',
        'cirurgia-oral'
      ],
      'Samira Soares': [
        'limpeza-dentaria'
      ],
      'Ângela Lino': [
        'limpeza-dentaria'
      ],
      'Tomás Godinho': [
        'limpeza-dentaria'
      ]
    };

    const results = [];

    // Clear existing specialties
    await supabaseAdmin.from('team_member_specialties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new specialties
    for (const [memberName, specialtySlugs] of Object.entries(specialtyMappings)) {
      const memberId = memberMap[memberName];
      if (!memberId) {
        console.log(`⚠️  Member not found: ${memberName}`);
        continue;
      }

      for (const slug of specialtySlugs) {
        const treatmentId = treatmentMap[slug];
        if (!treatmentId) {
          console.log(`⚠️  Treatment not found: ${slug}`);
          continue;
        }

        const { error } = await supabaseAdmin
          .from('team_member_specialties')
          .insert({
            team_member_id: memberId,
            treatment_id: treatmentId
          });

        if (error) {
          console.error(`❌ Error inserting ${memberName} - ${slug}:`, error);
        } else {
          console.log(`✅ Added ${memberName} -> ${slug}`);
          results.push({ member: memberName, specialty: slug, success: true });
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      treatmentMap,
      memberMap
    });
  } catch (error: any) {
    console.error('💥 Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed specialties',
    method: 'POST'
  });
}
