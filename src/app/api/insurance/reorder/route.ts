import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { updates } = await request.json();

  const supabase = await createClient();

  // Update each insurance provider's display_order
  for (const update of updates) {
    const { error } = await supabase
      .from('insurance_providers')
      .update({ display_order: update.display_order })
      .eq('id', update.id);

    if (error) {
      console.error('Error updating display order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
