'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const faqSchema = z.object({
  treatment_id: z.string().uuid('Please select a treatment'),
  display_order: z.number().min(0),
  is_published: z.boolean(),
  pt_question: z.string().min(1, 'Portuguese question is required'),
  pt_answer: z.string().min(1, 'Portuguese answer is required'),
  en_question: z.string().min(1, 'English question is required'),
  en_answer: z.string().min(1, 'English answer is required'),
})

type FAQFormData = z.infer<typeof faqSchema>

interface FAQEditorProps {
  faq: any
  treatments: any[]
}

export default function FAQEditor({ faq, treatments }: FAQEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find existing translations
  const ptTranslation = faq?.treatment_faq_translations?.find(
    (t: any) => t.language_code === 'pt'
  )
  const enTranslation = faq?.treatment_faq_translations?.find(
    (t: any) => t.language_code === 'en'
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      treatment_id: faq?.treatment_id || '',
      display_order: faq?.display_order ?? 0,
      is_published: faq?.is_published ?? false,
      pt_question: ptTranslation?.question || '',
      pt_answer: ptTranslation?.answer || '',
      en_question: enTranslation?.question || '',
      en_answer: enTranslation?.answer || '',
    },
  })

  const onSubmit = async (data: FAQFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/faqs', {
        method: faq ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: faq?.id,
          treatment_id: data.treatment_id,
          display_order: data.display_order,
          is_published: data.is_published,
          translations: {
            pt: {
              question: data.pt_question,
              answer: data.pt_answer,
            },
            en: {
              question: data.en_question,
              answer: data.en_answer,
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save FAQ')
      }

      router.push('/admin/faqs')
      router.refresh()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert(error instanceof Error ? error.message : 'Failed to save FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!faq) return
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/faqs?id=${faq.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      router.push('/admin/faqs')
      router.refresh()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Failed to delete FAQ')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {faq ? 'Edit FAQ' : 'New FAQ'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {faq ? 'Update FAQ details and translations' : 'Add a new FAQ'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">General Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Treatment *
            </label>
            <select
              {...register('treatment_id')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a treatment...</option>
              {treatments.map((treatment) => {
                const translation = treatment.treatment_translations[0]
                return (
                  <option key={treatment.id} value={treatment.id}>
                    {translation?.title || treatment.slug}
                  </option>
                )
              })}
            </select>
            {errors.treatment_id && (
              <p className="mt-1 text-sm text-red-600">{errors.treatment_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Order
              </label>
              <input
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.display_order && (
                <p className="mt-1 text-sm text-red-600">{errors.display_order.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_published')}
                id="is_published"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                Published
              </label>
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                type="button"
                onClick={() => setActiveTab('pt')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'pt'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Portuguese
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'en'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                English
              </button>
            </nav>
          </div>

          <div className="p-6 space-y-4">
            {activeTab === 'pt' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question (PT) *
                  </label>
                  <input
                    type="text"
                    {...register('pt_question')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Quanto tempo dura o tratamento?"
                  />
                  {errors.pt_question && (
                    <p className="mt-1 text-sm text-red-600">{errors.pt_question.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Answer (PT) *
                  </label>
                  <textarea
                    {...register('pt_answer')}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Detailed answer in Portuguese..."
                  />
                  {errors.pt_answer && (
                    <p className="mt-1 text-sm text-red-600">{errors.pt_answer.message}</p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'en' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question (EN) *
                  </label>
                  <input
                    type="text"
                    {...register('en_question')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., How long does the treatment take?"
                  />
                  {errors.en_question && (
                    <p className="mt-1 text-sm text-red-600">{errors.en_question.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Answer (EN) *
                  </label>
                  <textarea
                    {...register('en_answer')}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Detailed answer in English..."
                  />
                  {errors.en_answer && (
                    <p className="mt-1 text-sm text-red-600">{errors.en_answer.message}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {faq && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
              >
                Delete FAQ
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : faq ? 'Save Changes' : 'Create FAQ'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
