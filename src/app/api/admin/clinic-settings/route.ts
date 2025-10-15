import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()
    const settings = await request.json()

    // Remove read-only fields
    const { id, created_at, updated_at, ...updateData } = settings

    // Update the settings
    const { error } = await supabase
      .from('clinic_settings')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating clinic settings:', error)
      return NextResponse.json(
        { error: 'Failed to update clinic settings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Clinic settings updated successfully' })
  } catch (error) {
    console.error('Error in PUT /api/admin/clinic-settings:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
