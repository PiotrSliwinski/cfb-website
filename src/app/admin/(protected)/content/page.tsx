import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Globe } from 'lucide-react'
import fs from 'fs/promises'
import path from 'path'

type PageDefinition = {
  key: string
  name: string
  description: string
}

const pages: PageDefinition[] = [
  { key: 'home', name: 'Home Page', description: 'Main landing page content' },
  { key: 'team', name: 'Team Page', description: 'Team members and descriptions' },
  { key: 'technology', name: 'Technology Page', description: 'Equipment and technology' },
  { key: 'payments', name: 'Payments Page', description: 'Pricing and financing options' },
  { key: 'contact', name: 'Contact Page', description: 'Contact information and form' },
  { key: 'termsConditions', name: 'Terms & Conditions', description: 'Legal terms and policies' },
]

const languages = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export default async function ContentEditorPage() {
  const supabase = await createServerClient()

  // Check if translation files exist
  const messagesDir = path.join(process.cwd(), 'src', 'messages')

  let ptExists = false
  let enExists = false

  try {
    await fs.access(path.join(messagesDir, 'pt.json'))
    ptExists = true
  } catch {}

  try {
    await fs.access(path.join(messagesDir, 'en.json'))
    enExists = true
  } catch {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Page Content Editor</h1>
        <p className="mt-2 text-sm text-gray-600">
          Edit page content for each language using translation files
        </p>
      </div>

      {/* Language Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {languages.map((lang) => {
          const exists = lang.code === 'pt' ? ptExists : enExists
          return (
            <div
              key={lang.code}
              className={`p-4 rounded-lg border-2 ${
                exists
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{lang.name}</h3>
                  <p className="text-sm text-gray-600">
                    {exists ? 'Translation file exists' : 'Translation file missing'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.key}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{page.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{page.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`/admin/content/${page.key}/${lang.code}`}
                  className="flex items-center justify-between p-3 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {lang.flag} {lang.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Edit →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
