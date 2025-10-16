import { NextResponse } from 'next/server'
import { updateLanguage, deleteLanguage } from '@/lib/supabase/queries/languages'
import { clearLocaleCache } from '@/lib/i18n/config'
import type { LanguageUpdate } from '@/types/admin/language'
import { requireAdminApi } from '@/lib/auth/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params
    const body: LanguageUpdate = await request.json()

    const result = await updateLanguage(id, body)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Clear locale cache when language is updated
    clearLocaleCache()

    return NextResponse.json(result)
  } catch (error) {
    console.error('[PUT /api/admin/languages/[id]] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update language',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params

    const result = await deleteLanguage(id)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Clear locale cache when language is deleted
    clearLocaleCache()

    return NextResponse.json(result)
  } catch (error) {
    console.error('[DELETE /api/admin/languages/[id]] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete language',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
