import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import TreatmentEditor from './TreatmentEditor'

export default async function TreatmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // If id is 'new', show empty form
  if (id === 'new') {
    return <TreatmentEditor treatment={null} />
  }

  // Fetch treatment with translations
  const { data: treatment, error } = await supabase
    .from('treatments')
    .select(`
      *,
      treatment_translations (
        *
      )
    `)
    .eq('id', id)
    .single()

  if (error || !treatment) {
    notFound()
  }

  return <TreatmentEditor treatment={treatment} />
}
