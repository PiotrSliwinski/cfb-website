import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: heroSections, error } = await supabase
    .from('hero_sections')
    .select(`
      *,
      hero_section_translations(*)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching hero sections:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Return all translations for admin panel editing
  // Frontend will filter by locale if needed
  const heroSectionsWithTranslations = heroSections?.map(section => ({
    ...section,
    hero_section_translations: section.hero_section_translations || []
  }));

  return NextResponse.json(heroSectionsWithTranslations || []);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const slug = formData.get('slug') as string;
  const image_url = formData.get('image_url') as string;
  const video_url = formData.get('video_url') as string;
  const cta_text = formData.get('cta_text') as string;
  const cta_link = formData.get('cta_link') as string;
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

  // Insert hero section
  const { data: heroSection, error: heroSectionError } = await supabase
    .from('hero_sections')
    .insert({
      slug,
      image_url: image_url || null,
      video_url: video_url || null,
      cta_text: cta_text || null,
      cta_link: cta_link || null,
      display_order,
      is_published,
    })
    .select()
    .single();

  if (heroSectionError) {
    console.error('Error creating hero section:', heroSectionError);
    return NextResponse.json({ error: heroSectionError.message }, { status: 500 });
  }

  // Insert translations
  const translationsData = Object.values(translations).map((t: any) => ({
    hero_section_id: heroSection.id,
    language_code: t.language_code,
    title: t.title || null,
    subtitle: t.subtitle || null,
    description: t.description || null,
  }));

  const { error: translationsError } = await supabase
    .from('hero_section_translations')
    .insert(translationsData);

  if (translationsError) {
    console.error('Error creating translations:', translationsError);
    return NextResponse.json({ error: translationsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: heroSection });
}

export async function PUT(request: NextRequest) {
  const formData = await request.formData();

  const id = formData.get('id') as string;
  const slug = formData.get('slug') as string;
  const image_url = formData.get('image_url') as string;
  const video_url = formData.get('video_url') as string;
  const cta_text = formData.get('cta_text') as string;
  const cta_link = formData.get('cta_link') as string;
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

  // Update hero section
  const { error: heroSectionError } = await supabase
    .from('hero_sections')
    .update({
      slug,
      image_url: image_url || null,
      video_url: video_url || null,
      cta_text: cta_text || null,
      cta_link: cta_link || null,
      display_order,
      is_published,
    })
    .eq('id', id);

  if (heroSectionError) {
    console.error('Error updating hero section:', heroSectionError);
    return NextResponse.json({ error: heroSectionError.message }, { status: 500 });
  }

  // Update translations
  for (const translation of Object.values(translations)) {
    const t = translation as any;
    const { error: translationError } = await supabase
      .from('hero_section_translations')
      .upsert({
        hero_section_id: id,
        language_code: t.language_code,
        title: t.title || null,
        subtitle: t.subtitle || null,
        description: t.description || null,
      }, {
        onConflict: 'hero_section_id,language_code'
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
    .from('hero_sections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting hero section:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
