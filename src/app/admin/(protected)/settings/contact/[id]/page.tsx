import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ContactInfoEditor from './ContactInfoEditor'

export default async function ContactInfoEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // If id is 'new', show empty form
  if (id === 'new') {
    return <ContactInfoEditor contactInfo={null} />
  }

  // Fetch contact info with translations
  const { data: contactInfo, error } = await supabase
    .from('contact_information')
    .select(`
      *,
      contact_information_translations (*)
    `)
    .eq('id', id)
    .single()

  if (error || !contactInfo) {
    notFound()
  }

  return <ContactInfoEditor contactInfo={contactInfo} />
}
