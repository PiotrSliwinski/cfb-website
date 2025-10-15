import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: financing, error } = await supabase
    .from('financing_options')
    .select(`
      *,
      financing_option_translations(*)
    `)
    .order('display_order', { ascending: true});

  if (error) {
    console.error('Error fetching financing options:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Return all translations for admin panel editing
  // Frontend will filter by locale if needed
  const financingWithTranslations = financing?.map(option => ({
    ...option,
    financing_option_translations: option.financing_option_translations || []
  }));

  return NextResponse.json(financingWithTranslations || []);
}
