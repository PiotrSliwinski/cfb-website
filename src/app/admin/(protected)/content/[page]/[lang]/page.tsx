import { notFound } from 'next/navigation'
import { PageContentEditor } from './PageContentEditor'
import fs from 'fs/promises'
import path from 'path'

type PageParams = {
  page: string
  lang: string
}

const pageNames: Record<string, string> = {
  home: 'Home Page',
  team: 'Team Page',
  technology: 'Technology Page',
  payments: 'Payments Page',
  contact: 'Contact Page',
  termsConditions: 'Terms & Conditions',
}

const languageNames: Record<string, { name: string; flag: string }> = {
  pt: { name: 'Português', flag: '🇵🇹' },
  en: { name: 'English', flag: '🇬🇧' },
}

export default async function PageContentEditPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { page, lang } = await params

  // Validate page and language
  if (!pageNames[page] || !languageNames[lang]) {
    notFound()
  }

  // Read the translation file
  const messagesDir = path.join(process.cwd(), 'src', 'messages')
  const filePath = path.join(messagesDir, `${lang}.json`)

  let content: any = {}
  let fileExists = false

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    content = JSON.parse(fileContent)
    fileExists = true
  } catch (error) {
    console.error(`Error reading ${lang}.json:`, error)
    // File doesn't exist or is invalid, start with empty object
    content = {}
  }

  // Extract the section for this page
  const pageContent = content[page] || {}

  return (
    <PageContentEditor
      page={page}
      pageName={pageNames[page]}
      lang={lang}
      langName={languageNames[lang].name}
      langFlag={languageNames[lang].flag}
      content={pageContent}
      fullContent={content}
      fileExists={fileExists}
    />
  )
}
