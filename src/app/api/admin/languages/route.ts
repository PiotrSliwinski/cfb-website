import { NextResponse } from 'next/server'
import { getLanguages, createLanguage } from '@/lib/supabase/queries/languages'
import { clearLocaleCache } from '@/lib/i18n/config'
import type { LanguageCreate } from '@/types/admin/language'

export async function GET() {
  try {
    const languages = await getLanguages(false)

    return NextResponse.json({
      success: true,
      data: languages,
    })
  } catch (error) {
    console.error('[GET /api/admin/languages] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch languages',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: LanguageCreate = await request.json()

    // Basic validation
    if (!body.code || !body.name || !body.native_name || !body.flag) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required fields: code, name, native_name, flag',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // Validate code format (lowercase, 2-10 chars)
    if (!/^[a-z]{2,10}$/.test(body.code)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Language code must be 2-10 lowercase letters',
            code: 'VALIDATION_ERROR',
            field: 'code',
          },
        },
        { status: 400 }
      )
    }

    const result = await createLanguage(body)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Clear locale cache so new language is immediately available
    clearLocaleCache()

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/languages] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create language',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
