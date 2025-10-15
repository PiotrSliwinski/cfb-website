import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      info_type,
      phone,
      email,
      address_line1,
      address_line2,
      city,
      postal_code,
      latitude,
      longitude,
      google_maps_embed_url,
      is_primary,
      translations,
    } = body

    // Insert contact information
    const { data: contactInfo, error: contactError } = await supabase
      .from('contact_information')
      .insert({
        info_type,
        phone,
        email,
        address_line1,
        address_line2,
        city,
        postal_code,
        latitude,
        longitude,
        google_maps_embed_url,
        is_primary,
      })
      .select()
      .single()

    if (contactError) throw contactError

    // Insert translations
    const translationsData = [
      {
        contact_info_id: contactInfo.id,
        language_code: 'pt',
        business_hours: translations.pt.business_hours,
        additional_notes: translations.pt.additional_notes,
      },
      {
        contact_info_id: contactInfo.id,
        language_code: 'en',
        business_hours: translations.en.business_hours,
        additional_notes: translations.en.additional_notes,
      },
    ]

    const { error: translationsError } = await supabase
      .from('contact_information_translations')
      .insert(translationsData)

    if (translationsError) throw translationsError

    return NextResponse.json({ success: true, data: contactInfo })
  } catch (error) {
    console.error('Error creating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to create contact information' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      info_type,
      phone,
      email,
      address_line1,
      address_line2,
      city,
      postal_code,
      latitude,
      longitude,
      google_maps_embed_url,
      is_primary,
      translations,
    } = body

    // Update contact information
    const { error: contactError } = await supabase
      .from('contact_information')
      .update({
        info_type,
        phone,
        email,
        address_line1,
        address_line2,
        city,
        postal_code,
        latitude,
        longitude,
        google_maps_embed_url,
        is_primary,
      })
      .eq('id', id)

    if (contactError) throw contactError

    // Update translations
    for (const [lang, data] of Object.entries(translations) as [string, any][]) {
      const { error: translationError } = await supabase
        .from('contact_information_translations')
        .upsert({
          contact_info_id: id,
          language_code: lang,
          business_hours: data.business_hours,
          additional_notes: data.additional_notes,
        })

      if (translationError) throw translationError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact information' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Contact info ID required' },
        { status: 400 }
      )
    }

    // Delete translations first (due to foreign key)
    const { error: translationsError } = await supabase
      .from('contact_information_translations')
      .delete()
      .eq('contact_info_id', id)

    if (translationsError) throw translationsError

    // Delete contact information
    const { error: contactError } = await supabase
      .from('contact_information')
      .delete()
      .eq('id', id)

    if (contactError) throw contactError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact info:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact information' },
      { status: 500 }
    )
  }
}
