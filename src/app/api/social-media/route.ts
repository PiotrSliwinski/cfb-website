import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: socialMediaLinks, error } = await supabase
    .from('social_media_links')
    .select(`
      *,
      social_media_link_translations(*)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching social media links:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Return all translations for admin panel editing
  // Frontend will filter by locale if needed
  const socialMediaLinksWithTranslations = socialMediaLinks?.map(link => ({
    ...link,
    social_media_link_translations: link.social_media_link_translations || []
  }));

  return NextResponse.json(socialMediaLinksWithTranslations || []);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const platform = formData.get('platform') as string;
  const url = formData.get('url') as string;
  const icon = formData.get('icon') as string;
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

  // Insert social media link
  const { data: socialMediaLink, error: socialMediaLinkError } = await supabase
    .from('social_media_links')
    .insert({
      platform,
      url,
      icon: icon || null,
      display_order,
      is_published,
    })
    .select()
    .single();

  if (socialMediaLinkError) {
    console.error('Error creating social media link:', socialMediaLinkError);
    return NextResponse.json({ error: socialMediaLinkError.message }, { status: 500 });
  }

  // Insert translations
  const translationsData = Object.values(translations).map((t: any) => ({
    social_media_link_id: socialMediaLink.id,
    language_code: t.language_code,
    label: t.label || null,
  }));

  const { error: translationsError } = await supabase
    .from('social_media_link_translations')
    .insert(translationsData);

  if (translationsError) {
    console.error('Error creating translations:', translationsError);
    return NextResponse.json({ error: translationsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: socialMediaLink });
}

export async function PUT(request: NextRequest) {
  const formData = await request.formData();

  const id = formData.get('id') as string;
  const platform = formData.get('platform') as string;
  const url = formData.get('url') as string;
  const icon = formData.get('icon') as string;
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

  // Update social media link
  const { error: socialMediaLinkError } = await supabase
    .from('social_media_links')
    .update({
      platform,
      url,
      icon: icon || null,
      display_order,
      is_published,
    })
    .eq('id', id);

  if (socialMediaLinkError) {
    console.error('Error updating social media link:', socialMediaLinkError);
    return NextResponse.json({ error: socialMediaLinkError.message }, { status: 500 });
  }

  // Update translations
  for (const translation of Object.values(translations)) {
    const t = translation as any;
    const { error: translationError } = await supabase
      .from('social_media_link_translations')
      .upsert({
        social_media_link_id: id,
        language_code: t.language_code,
        label: t.label || null,
      }, {
        onConflict: 'social_media_link_id,language_code'
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
    .from('social_media_links')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting social media link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
