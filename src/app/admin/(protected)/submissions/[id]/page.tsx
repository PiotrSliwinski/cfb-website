import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SubmissionDetail from './SubmissionDetail'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch submission
  const { data: submission, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !submission) {
    notFound()
  }

  return <SubmissionDetail submission={submission} />
}
