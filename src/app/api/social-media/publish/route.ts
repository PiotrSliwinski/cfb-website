import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { id, is_published } = await request.json();

  const supabase = await createClient();

  const { error } = await supabase
    .from('social_media_links')
    .update({ is_published })
    .eq('id', id);

  if (error) {
    console.error('Error toggling publish status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
