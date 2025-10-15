import { getLanguages } from '@/lib/supabase/queries/languages'
import { LanguagesManager } from './LanguagesManager'

export const metadata = {
  title: 'Language Management | Admin',
  description: 'Manage website languages',
}

export default async function LanguagesPage() {
  const languages = await getLanguages(false) // Get all languages

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Language Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add, edit, or disable languages. Translation files will be auto-created for new languages.
        </p>
      </div>

      <LanguagesManager languages={languages} />
    </div>
  )
}
