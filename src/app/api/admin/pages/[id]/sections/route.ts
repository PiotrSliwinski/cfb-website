import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper to get component table name from section type
function getComponentTableName(sectionType: string): string | null {
  const typeMap: Record<string, string> = {
    'sections.hero': 'components_sections_heroes',
    'sections.feature_rows': 'components_sections_feature_rows',
    'sections.feature_columns': 'components_sections_feature_columns',
    'sections.testimonials': 'components_sections_testimonials',
    'sections.rich_text': 'components_sections_rich_text',
    'sections.pricing': 'components_sections_pricing',
    'sections.lead_form': 'components_sections_lead_form',
    'sections.large_video': 'components_sections_large_video',
    'sections.bottom_actions': 'components_sections_bottom_actions',
    'sections.team': 'components_sections_team',
    'sections.technology': 'components_sections_technology',
    'sections.contact': 'components_sections_contact',
  }
  return typeMap[sectionType] || null
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const { sections } = await request.json()
    const supabase = await createServerClient()

    // Update each section's content and order
    for (const section of sections) {
      const tableName = getComponentTableName(section.section_type)
      if (!tableName) continue

      // Update the component table with new content
      const { error: contentError } = await supabase
        .from(tableName)
        .update({
          ...section.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', section.section_id)

      if (contentError) {
        console.error(`Error updating ${tableName}:`, contentError)
      }

      // Update display order in pages_sections
      const { error: orderError } = await supabase
        .from('pages_sections')
        .update({ display_order: section.display_order })
        .eq('id', section.id)

      if (orderError) {
        console.error('Error updating section order:', orderError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/admin/pages/[id]/sections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
