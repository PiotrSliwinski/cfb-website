import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getLanguageByCode, getDefaultLanguage } from '@/lib/supabase/queries/languages'

export async function POST(request: Request) {
  try {
    const { language_code } = await request.json()

    if (!language_code) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'language_code is required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // Verify language exists in database
    const language = await getLanguageByCode(language_code)
    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Language '${language_code}' not found in database`,
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }

    const messagesDir = path.join(process.cwd(), 'src', 'messages')
    const newFilePath = path.join(messagesDir, `${language_code}.json`)

    // Check if file already exists
    try {
      await fs.access(newFilePath)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Translation file ${language_code}.json already exists`,
            code: 'DUPLICATE_ERROR',
          },
        },
        { status: 400 }
      )
    } catch {
      // File doesn't exist, which is what we want
    }

    // Get default language to copy from
    const defaultLang = await getDefaultLanguage()
    if (!defaultLang) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No default language found',
            code: 'NOT_FOUND',
          },
        },
        { status: 500 }
      )
    }

    // Read default language file
    const defaultFilePath = path.join(messagesDir, `${defaultLang.code}.json`)
    let defaultContent: any = {}

    try {
      const fileContent = await fs.readFile(defaultFilePath, 'utf-8')
      defaultContent = JSON.parse(fileContent)
    } catch (error) {
      console.error('[createTranslation] Error reading default file:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Could not read default language file ${defaultLang.code}.json`,
            code: 'FILE_ERROR',
          },
        },
        { status: 500 }
      )
    }

    // Create new translation file with default content
    // Add a comment to indicate it's auto-generated
    const newContent = {
      _metadata: {
        language_code: language_code,
        language_name: language.name,
        created_from: defaultLang.code,
        created_at: new Date().toISOString(),
        note: 'This file was auto-generated. Please translate all values to ' + language.native_name,
      },
      ...defaultContent,
    }

    await fs.writeFile(
      newFilePath,
      JSON.stringify(newContent, null, 2) + '\n',
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      data: {
        file_path: `src/messages/${language_code}.json`,
        copied_from: defaultLang.code,
        keys_count: Object.keys(defaultContent).length,
      },
      message: `Translation file ${language_code}.json created successfully`,
    })
  } catch (error) {
    console.error('[POST /api/admin/translations/create] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create translation file',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
