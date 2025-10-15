import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: providers, error } = await supabase
    .from('insurance_providers')
    .select(`
      *,
      insurance_provider_translations(*)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching insurance providers:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Return all translations for admin panel editing
  // Frontend will filter by locale if needed
  const providersWithTranslations = providers?.map(provider => ({
    ...provider,
    insurance_provider_translations: provider.insurance_provider_translations || []
  }));

  return NextResponse.json(providersWithTranslations || []);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const slug = formData.get('slug') as string;
  const logo_url = formData.get('logo_url') as string;
  const website_url = formData.get('website_url') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const display_order = parseInt(formData.get('display_order') as string);
  const is_published = formData.get('is_published') === 'true';

  // Get translations
  const translations: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('translations[')) {
      const match = key.match(/translations\[(\w+)\]\[(\w+)\]/);
      if (match) {
        const [, lang, field] = match;
        if (!translations[lang]) {
          translations[lang] = { language_code: lang };
        }
        translations[lang][field] = value;
      }
    }
  }

  const supabase = await createClient();

  // Insert provider
  const { data: provider, error: providerError } = await supabase
    .from('insurance_providers')
    .insert({
      slug,
      logo_url: logo_url || null,
      website_url: website_url || null,
      phone: phone || null,
      email: email || null,
      display_order,
      is_published,
    })
    .select()
    .single();

  if (providerError) {
    console.error('Error creating insurance provider:', providerError);
    return NextResponse.json({ error: providerError.message }, { status: 500 });
  }

  // Insert translations
  const translationsData = Object.values(translations).map((t: any) => ({
    insurance_provider_id: provider.id,
    language_code: t.language_code,
    name: t.name,
    description: t.description || null,
    coverage_details: t.coverage_details || null,
  }));

  const { error: translationsError } = await supabase
    .from('insurance_provider_translations')
    .insert(translationsData);

  if (translationsError) {
    console.error('Error creating translations:', translationsError);
    return NextResponse.json({ error: translationsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: provider });
}

export async function PUT(request: NextRequest) {
  const formData = await request.formData();

  const id = formData.get('id') as string;
  const slug = formData.get('slug') as string;
  const logo_url = formData.get('logo_url') as string;
  const website_url = formData.get('website_url') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const display_order = parseInt(formData.get('display_order') as string);
  const is_published = formData.get('is_published') === 'true';

  // Get translations
  const translations: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('translations[')) {
      const match = key.match(/translations\[(\w+)\]\[(\w+)\]/);
      if (match) {
        const [, lang, field] = match;
        if (!translations[lang]) {
          translations[lang] = { language_code: lang };
        }
        translations[lang][field] = value;
      }
    }
  }

  const supabase = await createClient();

  // Update provider
  const { error: providerError } = await supabase
    .from('insurance_providers')
    .update({
      slug,
      logo_url: logo_url || null,
      website_url: website_url || null,
      phone: phone || null,
      email: email || null,
      display_order,
      is_published,
    })
    .eq('id', id);

  if (providerError) {
    console.error('Error updating insurance provider:', providerError);
    return NextResponse.json({ error: providerError.message }, { status: 500 });
  }

  // Update translations
  for (const translation of Object.values(translations)) {
    const t = translation as any;
    const { error: translationError } = await supabase
      .from('insurance_provider_translations')
      .upsert({
        insurance_provider_id: id,
        language_code: t.language_code,
        name: t.name,
        description: t.description || null,
        coverage_details: t.coverage_details || null,
      }, {
        onConflict: 'insurance_provider_id,language_code'
      });

    if (translationError) {
      console.error('Error updating translation:', translationError);
      return NextResponse.json({ error: translationError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('insurance_providers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting insurance provider:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
