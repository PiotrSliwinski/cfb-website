'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { saveTreatmentFromEditor, type EditorTreatmentData } from '@/app/actions/treatments'
import { JsonEditor } from '@/components/admin/JsonEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { AITextAssist } from '@/components/admin/AITextAssist'

const treatmentSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  display_order: z.number().min(0),
  is_published: z.boolean(),
  is_featured: z.boolean().optional(),
  icon_url: z.string().nullable().optional(),
  hero_image_url: z.string().nullable().optional(),
  // Portuguese translations
  pt_title: z.string().min(1, 'Portuguese title is required'),
  pt_subtitle: z.string().optional(),
  pt_description: z.string().optional(),
  pt_benefits: z.any().optional(), // JSON object/array
  pt_process_steps: z.any().optional(), // JSON object/array
  pt_section_content: z.any().optional(), // JSON object
  // English translations
  en_title: z.string().min(1, 'English title is required'),
  en_subtitle: z.string().optional(),
  en_description: z.string().optional(),
  en_benefits: z.any().optional(), // JSON object/array
  en_process_steps: z.any().optional(), // JSON object/array
  en_section_content: z.any().optional(), // JSON object
})

type TreatmentFormData = z.infer<typeof treatmentSchema>

interface TreatmentEditorProps {
  treatment: any | null
}

export default function TreatmentEditor({ treatment }: TreatmentEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Find translations
  const ptTranslation = treatment?.treatment_translations?.find(
    (t: any) => t.language_code === 'pt'
  )
  const enTranslation = treatment?.treatment_translations?.find(
    (t: any) => t.language_code === 'en'
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      slug: treatment?.slug || '',
      display_order: treatment?.display_order || 0,
      is_published: treatment?.is_published ?? false,
      is_featured: treatment?.is_featured ?? false,
      icon_url: treatment?.icon_url || '',
      hero_image_url: treatment?.hero_image_url || '',
      pt_title: ptTranslation?.title || '',
      pt_subtitle: ptTranslation?.subtitle || '',
      pt_description: ptTranslation?.description || '',
      pt_benefits: ptTranslation?.benefits || [],
      pt_process_steps: ptTranslation?.process_steps || [],
      pt_section_content: ptTranslation?.section_content || {},
      en_title: enTranslation?.title || '',
      en_subtitle: enTranslation?.subtitle || '',
      en_description: enTranslation?.description || '',
      en_benefits: enTranslation?.benefits || [],
      en_process_steps: enTranslation?.process_steps || [],
      en_section_content: enTranslation?.section_content || {},
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: TreatmentFormData) => {
    setSaving(true)
    setError(null)

    try {
      // Prepare data for server action
      const editorData: EditorTreatmentData = {
        id: treatment?.id,
        slug: data.slug,
        display_order: data.display_order,
        is_published: data.is_published,
        is_featured: data.is_featured,
        icon_url: data.icon_url || null,
        hero_image_url: data.hero_image_url || null,
        pt_title: data.pt_title,
        pt_subtitle: data.pt_subtitle,
        pt_description: data.pt_description,
        pt_benefits: data.pt_benefits,
        pt_process_steps: data.pt_process_steps,
        pt_section_content: data.pt_section_content,
        en_title: data.en_title,
        en_subtitle: data.en_subtitle,
        en_description: data.en_description,
        en_benefits: data.en_benefits,
        en_process_steps: data.en_process_steps,
        en_section_content: data.en_section_content,
      }

      // Call server action
      const result = await saveTreatmentFromEditor(editorData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save treatment')
      }

      // Success - redirect to treatments list
      router.push('/admin/treatments')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save treatment')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {treatment ? 'Edit Treatment' : 'New Treatment'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {treatment ? `Editing: ${ptTranslation?.title || 'Untitled'}` : 'Create a new dental treatment'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="implantes-dentarios"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <ImageUpload
                label="Treatment Icon"
                value={watchedValues.icon_url}
                onChange={(url) => setValue('icon_url', url, { shouldDirty: true })}
                onRemove={() => setValue('icon_url', null, { shouldDirty: true })}
                bucket="treatments"
                accept="image/svg+xml,image/png,image/webp"
                maxSizeMB={2}
                showAIGenerate={true}
                aiPromptHint={`A simple, clean icon representing ${watchedValues.pt_title || watchedValues.slug || 'dental treatment'}, suitable for a modern dental clinic website`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: SVG icon, 64x64px or larger
              </p>
            </div>

            <div>
              <ImageUpload
                label="Hero Image"
                value={watchedValues.hero_image_url}
                onChange={(url) => setValue('hero_image_url', url, { shouldDirty: true })}
                onRemove={() => setValue('hero_image_url', null, { shouldDirty: true })}
                bucket="treatments"
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={5}
                showAIGenerate={true}
                aiPromptHint={`A professional hero image for ${watchedValues.pt_title || watchedValues.slug || 'dental treatment'} - modern dental clinic, warm lighting, professional atmosphere`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1200x600px or larger, JPG/WebP format
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_published')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Published</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                type="button"
                onClick={() => setActiveTab('pt')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'pt'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Portuguese
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'en'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                English
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pt' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (PT) *
                  </label>
                  <input
                    type="text"
                    {...register('pt_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.pt_title && (
                    <p className="mt-1 text-sm text-red-600">{errors.pt_title.message}</p>
                  )}
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Suggest a compelling title for a dental treatment about: ${watchedValues.slug || 'dental treatment'}`}
                      contextType="treatment_title"
                      onApply={(text) => setValue('pt_title', text, { shouldDirty: true })}
                      maxTokens={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle (PT)
                  </label>
                  <input
                    type="text"
                    {...register('pt_subtitle')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Write a subtitle for a dental treatment titled "${watchedValues.pt_title || watchedValues.slug}"`}
                      contextType="treatment_subtitle"
                      onApply={(text) => setValue('pt_subtitle', text, { shouldDirty: true })}
                      maxTokens={150}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (PT)
                  </label>
                  <textarea
                    {...register('pt_description')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Write a detailed, patient-friendly description in Portuguese for the dental treatment "${watchedValues.pt_title || watchedValues.slug}". Include what the treatment is, who it's for, and key benefits.`}
                      contextType="treatment_description"
                      onApply={(text) => setValue('pt_description', text, { shouldDirty: true })}
                      maxTokens={800}
                    />
                  </div>
                </div>

                <Controller
                  name="pt_benefits"
                  control={control}
                  render={({ field }) => (
                    <JsonEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Benefits (PT)"
                      description="List of treatment benefits"
                    />
                  )}
                />

                <Controller
                  name="pt_process_steps"
                  control={control}
                  render={({ field }) => (
                    <JsonEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Process Steps (PT)"
                      description="Treatment process steps"
                    />
                  )}
                />

                <Controller
                  name="pt_section_content"
                  control={control}
                  render={({ field }) => (
                    <JsonEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Section Content (PT)"
                      description="Additional content sections (FAQs, pricing, urgency, etc.)"
                    />
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (EN) *
                  </label>
                  <input
                    type="text"
                    {...register('en_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.en_title && (
                    <p className="mt-1 text-sm text-red-600">{errors.en_title.message}</p>
                  )}
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Suggest a compelling title in English for a dental treatment about: ${watchedValues.slug || 'dental treatment'}`}
                      contextType="treatment_title"
                      onApply={(text) => setValue('en_title', text, { shouldDirty: true })}
                      maxTokens={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle (EN)
                  </label>
                  <input
                    type="text"
                    {...register('en_subtitle')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Write a subtitle in English for a dental treatment titled "${watchedValues.en_title || watchedValues.slug}"`}
                      contextType="treatment_subtitle"
                      onApply={(text) => setValue('en_subtitle', text, { shouldDirty: true })}
                      maxTokens={150}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (EN)
                  </label>
                  <textarea
                    {...register('en_description')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Write a detailed, patient-friendly description in English for the dental treatment "${watchedValues.en_title || watchedValues.slug}". Include what the treatment is, who it's for, and key benefits.`}
                      contextType="treatment_description"
                      onApply={(text) => setValue('en_description', text, { shouldDirty: true })}
                      maxTokens={800}
                    />
                  </div>
                </div>

                <Controller
                  name="en_benefits"
                  control={control}
                  render={({ field }) => (
                    <JsonEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Benefits (EN)"
                      description="List of treatment benefits"
                    />
                  )}
                />

                <Controller
                  name="en_process_steps"
                  control={control}
                  render={({ field }) => (
                    <JsonEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Process Steps (EN)"
                      description="Treatment process steps"
                    />
                  )}
                />

                <Controller
                  name="en_section_content"
                  control={control}
                  render={({ field }) => (
                    <JsonEditor
                      value={field.value}
                      onChange={field.onChange}
                      label="Section Content (EN)"
                      description="Additional content sections (FAQs, pricing, urgency, etc.)"
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push('/admin/treatments')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Treatment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
