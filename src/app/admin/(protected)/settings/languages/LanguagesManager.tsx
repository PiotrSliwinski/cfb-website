'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Globe,
  Star,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
} from 'lucide-react'
import type { Language } from '@/types/admin/language'

type Props = {
  languages: Language[]
}

export function LanguagesManager({ languages: initialLanguages }: Props) {
  const router = useRouter()
  const [languages, setLanguages] = useState(initialLanguages)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    native_name: '',
    flag: '',
    enabled: true,
    is_default: false,
  })

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      native_name: '',
      flag: '',
      enabled: true,
      is_default: false,
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleAdd = () => {
    setIsAdding(true)
    resetForm()
  }

  const handleEdit = (language: Language) => {
    setEditingId(language.id)
    setFormData({
      code: language.code,
      name: language.name,
      native_name: language.native_name,
      flag: language.flag,
      enabled: language.enabled,
      is_default: language.is_default,
    })
  }

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/admin/languages/${editingId}`
        : '/api/admin/languages'

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error?.message || 'Failed to save language')
        return
      }

      alert(result.message || 'Language saved successfully!')
      resetForm()
      router.refresh()
    } catch (error) {
      console.error('Error saving language:', error)
      alert('Failed to save language')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this language? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/languages/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error?.message || 'Failed to delete language')
        return
      }

      alert('Language deleted successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error deleting language:', error)
      alert('Failed to delete language')
    }
  }

  const handleToggleEnabled = async (language: Language) => {
    try {
      const response = await fetch(`/api/admin/languages/${language.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !language.enabled }),
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error?.message || 'Failed to update language')
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Error toggling language:', error)
      alert('Failed to update language')
    }
  }

  const handleSetDefault = async (language: Language) => {
    if (language.is_default) return

    try {
      const response = await fetch(`/api/admin/languages/${language.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error?.message || 'Failed to set default language')
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Error setting default:', error)
      alert('Failed to set default language')
    }
  }

  const handleCreateTranslationFile = async (code: string) => {
    if (!confirm(`Create translation file for ${code}.json? This will copy from the default language.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/translations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_code: code }),
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error?.message || 'Failed to create translation file')
        return
      }

      alert(`Translation file ${code}.json created successfully!`)
      router.refresh()
    } catch (error) {
      console.error('Error creating translation file:', error)
      alert('Failed to create translation file')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Language' : 'Add New Language'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language Code * (e.g., 'fr', 'es')
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                maxLength={10}
                disabled={!!editingId} // Can't change code when editing
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flag Emoji * (e.g., '🇫🇷')
              </label>
              <input
                type="text"
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🇫🇷"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Name * (e.g., 'French')
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="French"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Native Name * (e.g., 'Français')
              </label>
              <input
                type="text"
                value={formData.native_name}
                onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Français"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enabled</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Set as Default</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!formData.code || !formData.name || !formData.native_name || !formData.flag}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Languages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Translation File
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {languages.map((language) => (
                <tr key={language.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {language.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {language.native_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {language.code}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {language.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      )}
                      {language.enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          <Eye className="w-3 h-3" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          <EyeOff className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleCreateTranslationFile(language.code)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      title="Create or regenerate translation file"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">{language.code}.json</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {!language.is_default && (
                        <button
                          onClick={() => handleSetDefault(language)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleEnabled(language)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title={language.enabled ? 'Disable' : 'Enable'}
                      >
                        {language.enabled ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(language)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!language.is_default && (
                        <button
                          onClick={() => handleDelete(language.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">How Language Management Works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Add new languages to make website multilingual</li>
              <li>Click the file icon to create translation files automatically</li>
              <li>New translation files will copy content from the default language</li>
              <li>Edit translations via <code className="bg-blue-100 px-1 rounded">/admin/content</code></li>
              <li>Only one language can be set as default at a time</li>
              <li>Cannot delete the default language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
