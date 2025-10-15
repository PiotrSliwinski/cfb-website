import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'pt';
    const slug = searchParams.get('slug');

    const supabase = await createClient();

    if (slug) {
      // Get single treatment by slug
      const { data, error } = await supabase
        .from('treatments')
        .select(
          `
          *,
          treatment_translations!inner(*)
        `
        )
        .eq('slug', slug)
        .eq('treatment_translations.language_code', locale)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    } else {
      // Get all treatments
      const { data, error } = await supabase
        .from('treatments')
        .select(
          `
          *,
          treatment_translations!inner(*)
        `
        )
        .eq('treatment_translations.language_code', locale)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return NextResponse.json(data || []);
    }
  } catch (error: any) {
    console.error('API /treatments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch treatments' },
      { status: 500 }
    );
  }
}
