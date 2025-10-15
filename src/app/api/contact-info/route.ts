import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data: contactInfo, error } = await supabase
    .from('contact_information')
    .select(`
      *,
      contact_information_translations(*)
    `)
    .single();

  if (error) {
    console.error('Error fetching contact information:', error);
    return NextResponse.json(null, { status: 500 });
  }

  // Return all translations for admin panel editing
  // Frontend will filter by locale if needed
  const contactInfoWithTranslations = contactInfo ? {
    ...contactInfo,
    contact_information_translations: contactInfo.contact_information_translations || []
  } : null;

  // Wrap in array for CollectionManager compatibility
  return NextResponse.json(contactInfoWithTranslations ? [contactInfoWithTranslations] : []);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const emergency_phone = formData.get('emergency_phone') as string;

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

  // Insert contact info
  const { data: contactInfo, error: contactInfoError } = await supabase
    .from('contact_information')
    .insert({
      phone: phone || null,
      email: email || null,
      whatsapp: whatsapp || null,
      emergency_phone: emergency_phone || null,
    })
    .select()
    .single();

  if (contactInfoError) {
    console.error('Error creating contact information:', contactInfoError);
    return NextResponse.json({ error: contactInfoError.message }, { status: 500 });
  }

  // Insert translations
  const translationsData = Object.values(translations).map((t: any) => ({
    contact_information_id: contactInfo.id,
    language_code: t.language_code,
    address: t.address || null,
    hours_of_operation: t.hours_of_operation || null,
  }));

  const { error: translationsError } = await supabase
    .from('contact_information_translations')
    .insert(translationsData);

  if (translationsError) {
    console.error('Error creating translations:', translationsError);
    return NextResponse.json({ error: translationsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: contactInfo });
}

export async function PUT(request: NextRequest) {
  const formData = await request.formData();

  const id = formData.get('id') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const emergency_phone = formData.get('emergency_phone') as string;

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

  // Update contact info
  const { error: contactInfoError } = await supabase
    .from('contact_information')
    .update({
      phone: phone || null,
      email: email || null,
      whatsapp: whatsapp || null,
      emergency_phone: emergency_phone || null,
    })
    .eq('id', id);

  if (contactInfoError) {
    console.error('Error updating contact information:', contactInfoError);
    return NextResponse.json({ error: contactInfoError.message }, { status: 500 });
  }

  // Update translations
  for (const translation of Object.values(translations)) {
    const t = translation as any;
    const { error: translationError } = await supabase
      .from('contact_information_translations')
      .upsert({
        contact_information_id: id,
        language_code: t.language_code,
        address: t.address || null,
        hours_of_operation: t.hours_of_operation || null,
      }, {
        onConflict: 'contact_information_id,language_code'
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
    .from('contact_information')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact information:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
