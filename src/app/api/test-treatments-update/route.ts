import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  try {
    // First, get all treatments
    const { data: treatments, error: fetchError } = await supabase
      .from('treatments')
      .select('id, slug, display_order')
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError }, { status: 500 });
    }

    console.log('📋 Current treatments:', treatments);

    // Try to update the first one
    if (treatments && treatments.length > 0) {
      const firstTreatment = treatments[0];
      console.log(`🧪 Testing update for: ${firstTreatment.slug} (${firstTreatment.id})`);

      const { data: updateResult, error: updateError } = await supabase
        .from('treatments')
        .update({ display_order: firstTreatment.display_order })
        .eq('id', firstTreatment.id)
        .select();

      console.log('✅ Update result:', updateResult);
      console.log('❌ Update error:', updateError);

      return NextResponse.json({
        treatments,
        testUpdate: {
          id: firstTreatment.id,
          slug: firstTreatment.slug,
          result: updateResult,
          error: updateError,
        },
      });
    }

    return NextResponse.json({ treatments });
  } catch (error: any) {
    console.error('💥 Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
