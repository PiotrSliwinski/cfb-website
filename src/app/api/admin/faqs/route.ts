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
    const { treatment_id, display_order, is_published, translations } = body

    // Insert FAQ
    const { data: faq, error: faqError } = await supabase
      .from('treatment_faqs')
      .insert({
        treatment_id,
        display_order,
        is_published,
      })
      .select()
      .single()

    if (faqError) throw faqError

    // Insert translations
    const translationsData = [
      {
        faq_id: faq.id,
        language_code: 'pt',
        question: translations.pt.question,
        answer: translations.pt.answer,
      },
      {
        faq_id: faq.id,
        language_code: 'en',
        question: translations.en.question,
        answer: translations.en.answer,
      },
    ]

    const { error: translationsError } = await supabase
      .from('treatment_faq_translations')
      .insert(translationsData)

    if (translationsError) throw translationsError

    return NextResponse.json({ success: true, data: faq })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
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
    const { id, treatment_id, display_order, is_published, translations } = body

    // Update FAQ
    const { error: faqError } = await supabase
      .from('treatment_faqs')
      .update({
        treatment_id,
        display_order,
        is_published,
      })
      .eq('id', id)

    if (faqError) throw faqError

    // Update translations
    for (const [lang, data] of Object.entries(translations) as [
      string,
      any
    ][]) {
      const { error: translationError } = await supabase
        .from('treatment_faq_translations')
        .upsert({
          faq_id: id,
          language_code: lang,
          question: data.question,
          answer: data.answer,
        })

      if (translationError) throw translationError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
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
      return NextResponse.json({ error: 'FAQ ID required' }, { status: 400 })
    }

    // Delete translations first (due to foreign key)
    const { error: translationsError } = await supabase
      .from('treatment_faq_translations')
      .delete()
      .eq('faq_id', id)

    if (translationsError) throw translationsError

    // Delete FAQ
    const { error: faqError } = await supabase
      .from('treatment_faqs')
      .delete()
      .eq('id', id)

    if (faqError) throw faqError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    )
  }
}
