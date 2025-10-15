import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: prices, error } = await supabase
    .from('service_prices')
    .select(`
      *,
      service_price_translations(*)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Filter translations by locale for frontend, but return all for admin
  // Admin needs all translations to edit both PT and EN
  const pricesWithTranslations = prices?.map(price => ({
    ...price,
    service_price_translations: price.service_price_translations || []
  }));

  return NextResponse.json(pricesWithTranslations || []);
}
