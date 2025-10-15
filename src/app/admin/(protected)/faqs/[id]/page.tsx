import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FAQEditor from './FAQEditor'

export default async function FAQEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch all treatments for the treatment selector
  const { data: treatments } = await supabase
    .from('treatments')
    .select('id, slug, treatment_translations!inner(title, language_code)')
    .eq('treatment_translations.language_code', 'pt')
    .order('display_order')

  // If id is 'new', show empty form
  if (id === 'new') {
    return <FAQEditor faq={null} treatments={treatments || []} />
  }

  // Fetch FAQ with translations
  const { data: faq, error } = await supabase
    .from('treatment_faqs')
    .select(`
      *,
      treatment_faq_translations (*)
    `)
    .eq('id', id)
    .single()

  if (error || !faq) {
    notFound()
  }

  return <FAQEditor faq={faq} treatments={treatments || []} />
}
