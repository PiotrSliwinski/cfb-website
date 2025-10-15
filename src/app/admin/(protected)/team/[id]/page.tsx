import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TeamMemberEditor from './TeamMemberEditor'

export default async function TeamMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // If id is 'new', show empty form
  if (id === 'new') {
    // Fetch treatments for specialties selector
    const { data: treatments } = await supabase
      .from('treatments')
      .select('id, slug, treatment_translations!inner(title, language_code)')
      .eq('treatment_translations.language_code', 'pt')
      .order('display_order')

    return <TeamMemberEditor member={null} treatments={treatments || []} />
  }

  // Fetch team member with translations and specialties
  const { data: member, error } = await supabase
    .from('team_members')
    .select(`
      *,
      team_member_translations (*),
      team_member_specialties (
        treatment_id,
        treatments (
          slug,
          treatment_translations!inner(title, language_code)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  // Fetch all treatments for specialties selector
  const { data: treatments } = await supabase
    .from('treatments')
    .select('id, slug, treatment_translations!inner(title, language_code)')
    .eq('treatment_translations.language_code', 'pt')
    .order('display_order')

  return <TeamMemberEditor member={member} treatments={treatments || []} />
}
