import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: ctaSections, error } = await supabase
    .from('cta_sections')
    .select(`
      *,
      cta_section_translations(*)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching CTA sections:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Return all translations for admin panel editing
  // Frontend will filter by locale if needed
  const ctaSectionsWithTranslations = ctaSections?.map(section => ({
    ...section,
    cta_section_translations: section.cta_section_translations || []
  }));

  return NextResponse.json(ctaSectionsWithTranslations || []);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const slug = formData.get('slug') as string;
  const background_color = formData.get('background_color') as string;
  const background_image = formData.get('background_image') as string;
  const button_link = formData.get('button_link') as string;
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

  // Insert CTA section
  const { data: ctaSection, error: ctaSectionError } = await supabase
    .from('cta_sections')
    .insert({
      slug,
      background_color: background_color || null,
      background_image: background_image || null,
      button_link: button_link || null,
      display_order,
      is_published,
    })
    .select()
    .single();

  if (ctaSectionError) {
    console.error('Error creating CTA section:', ctaSectionError);
    return NextResponse.json({ error: ctaSectionError.message }, { status: 500 });
  }

  // Insert translations
  const translationsData = Object.values(translations).map((t: any) => ({
    cta_section_id: ctaSection.id,
    language_code: t.language_code,
    title: t.title || null,
    description: t.description || null,
    button_text: t.button_text || null,
  }));

  const { error: translationsError } = await supabase
    .from('cta_section_translations')
    .insert(translationsData);

  if (translationsError) {
    console.error('Error creating translations:', translationsError);
    return NextResponse.json({ error: translationsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: ctaSection });
}

export async function PUT(request: NextRequest) {
  const formData = await request.formData();

  const id = formData.get('id') as string;
  const slug = formData.get('slug') as string;
  const background_color = formData.get('background_color') as string;
  const background_image = formData.get('background_image') as string;
  const button_link = formData.get('button_link') as string;
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

  // Update CTA section
  const { error: ctaSectionError } = await supabase
    .from('cta_sections')
    .update({
      slug,
      background_color: background_color || null,
      background_image: background_image || null,
      button_link: button_link || null,
      display_order,
      is_published,
    })
    .eq('id', id);

  if (ctaSectionError) {
    console.error('Error updating CTA section:', ctaSectionError);
    return NextResponse.json({ error: ctaSectionError.message }, { status: 500 });
  }

  // Update translations
  for (const translation of Object.values(translations)) {
    const t = translation as any;
    const { error: translationError } = await supabase
      .from('cta_section_translations')
      .upsert({
        cta_section_id: id,
        language_code: t.language_code,
        title: t.title || null,
        description: t.description || null,
        button_text: t.button_text || null,
      }, {
        onConflict: 'cta_section_id,language_code'
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
    .from('cta_sections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting CTA section:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
