'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Code, Layout } from 'lucide-react'
import Link from 'next/link'
import { JsonEditor } from '@/components/admin/JsonEditor'

type Props = {
  page: string
  pageName: string
  lang: string
  langName: string
  langFlag: string
  content: any
  fullContent: any
  fileExists: boolean
}

export function PageContentEditor({
  page,
  pageName,
  lang,
  langName,
  langFlag,
  content: initialContent,
  fullContent: initialFullContent,
  fileExists,
}: Props) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')
  const [codeValue, setCodeValue] = useState(JSON.stringify(initialContent, null, 2))
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleCodeChange = (newCode: string) => {
    setCodeValue(newCode)
    try {
      const parsed = JSON.parse(newCode)
      setCodeError(null)
      setContent(parsed)
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  const handleVisualChange = (newValue: any) => {
    setContent(newValue)
    setCodeValue(JSON.stringify(newValue, null, 2))
  }

  const handleSave = async () => {
    if (codeError) {
      alert('Please fix JSON errors before saving')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/content/${lang}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      alert('Content saved successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error saving:', error)
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Pages
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {langFlag} {pageName} - {langName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Editing: <code className="bg-gray-100 px-2 py-1 rounded">src/messages/{lang}.json</code> → <code className="bg-blue-100 px-2 py-1 rounded">{page}</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !!codeError}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {!fileExists && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> The translation file for {langName} doesn't exist yet. It will be created when you save.
          </p>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* View Mode Toggle */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'visual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layout className="w-4 h-4" />
              Visual Editor
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4" />
              Code Editor
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6">
          {viewMode === 'visual' ? (
            <JsonEditor
              value={content}
              onChange={handleVisualChange}
              label=""
            />
          ) : (
            <div>
              <textarea
                value={codeValue}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`w-full h-[600px] font-mono text-sm p-4 border rounded-lg ${
                  codeError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                spellCheck={false}
              />
              {codeError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>JSON Error:</strong> {codeError}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use <strong>Visual Editor</strong> for easy point-and-click editing</li>
          <li>• Use <strong>Code Editor</strong> for bulk changes or when you need precise control</li>
          <li>• Changes are saved to <code className="bg-blue-100 px-1 rounded">src/messages/{lang}.json</code></li>
          <li>• The page will automatically reload with new content after saving</li>
        </ul>
      </div>
    </div>
  )
}
