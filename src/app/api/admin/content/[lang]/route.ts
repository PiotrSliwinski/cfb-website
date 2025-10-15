import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang } = await params
    const { page, content } = await request.json()

    // Validate language
    if (!['pt', 'en'].includes(lang)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    // Validate page key
    const validPages = ['home', 'team', 'technology', 'payments', 'contact', 'termsConditions']
    if (!validPages.includes(page)) {
      return NextResponse.json({ error: 'Invalid page' }, { status: 400 })
    }

    // Read the existing translation file
    const messagesDir = path.join(process.cwd(), 'src', 'messages')
    const filePath = path.join(messagesDir, `${lang}.json`)

    let existingContent: any = {}

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      existingContent = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist yet, that's ok
      console.log(`Creating new translation file: ${lang}.json`)
    }

    // Update the specific page section
    existingContent[page] = content

    // Write back to file with pretty formatting
    await fs.writeFile(
      filePath,
      JSON.stringify(existingContent, null, 2) + '\n',
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: `Updated ${page} content for ${lang}`,
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/content/[lang]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
