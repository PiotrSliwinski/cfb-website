import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Use service role key to bypass RLS
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
    const ortodontiaId = '4eeae29b-6b26-4acb-bb07-505096db097f';

    // Check current state
    const { data: before } = await supabaseAdmin
      .from('treatments')
      .select('id, slug, display_order')
      .eq('id', ortodontiaId)
      .single();

    console.log('📋 Before (admin):', before);

    // Update with admin client (bypasses RLS)
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('treatments')
      .update({ display_order: 1 })
      .eq('id', ortodontiaId)
      .select();

    console.log('✅ Update result (admin):', updateResult);
    console.log('❌ Update error:', updateError);

    // Check after
    const { data: after } = await supabaseAdmin
      .from('treatments')
      .select('id, slug, display_order')
      .eq('id', ortodontiaId)
      .single();

    console.log('📋 After (admin):', after);

    return NextResponse.json({
      before,
      updateResult,
      updateError,
      after,
      success: !updateError,
      changed: before?.display_order !== after?.display_order,
    });
  } catch (error: any) {
    console.error('💥 Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
