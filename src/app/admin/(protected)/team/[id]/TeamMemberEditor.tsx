'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { saveTeamMemberFromEditor, type EditorTeamMemberData } from '@/app/actions/team'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { AITextAssist } from '@/components/admin/AITextAssist'

const teamMemberSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  display_order: z.number().min(0),
  is_published: z.boolean(),
  photo_url: z.string().nullable().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  // Portuguese translations
  pt_name: z.string().min(1, 'Portuguese name is required'),
  pt_title: z.string().optional(),
  pt_specialty: z.string().optional(),
  pt_bio: z.string().optional(),
  pt_credentials: z.string().optional(),
  // English translations
  en_name: z.string().min(1, 'English name is required'),
  en_title: z.string().optional(),
  en_specialty: z.string().optional(),
  en_bio: z.string().optional(),
  en_credentials: z.string().optional(),
  // Specialties (treatment IDs)
  specialties: z.array(z.string()).optional(),
})

type TeamMemberFormData = z.infer<typeof teamMemberSchema>

interface TeamMemberEditorProps {
  member: any | null
  treatments: any[]
}

export default function TeamMemberEditor({ member, treatments }: TeamMemberEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Find translations
  const ptTranslation = member?.team_member_translations?.find(
    (t: any) => t.language_code === 'pt'
  )
  const enTranslation = member?.team_member_translations?.find(
    (t: any) => t.language_code === 'en'
  )

  // Get current specialties
  const currentSpecialties = member?.team_member_specialties?.map(
    (s: any) => s.treatment_id
  ) || []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      slug: member?.slug || '',
      display_order: member?.display_order || 0,
      is_published: member?.is_published ?? false,
      photo_url: member?.photo_url || '',
      email: member?.email || '',
      phone: member?.phone || '',
      pt_name: ptTranslation?.name || '',
      pt_title: ptTranslation?.title || '',
      pt_specialty: ptTranslation?.specialty || '',
      pt_bio: ptTranslation?.bio || '',
      pt_credentials: ptTranslation?.credentials || '',
      en_name: enTranslation?.name || '',
      en_title: enTranslation?.title || '',
      en_specialty: enTranslation?.specialty || '',
      en_bio: enTranslation?.bio || '',
      en_credentials: enTranslation?.credentials || '',
      specialties: currentSpecialties,
    },
  })

  const specialties = watch('specialties') || []
  const watchedPhotoUrl = watch('photo_url')
  const watchedPtName = watch('pt_name')
  const watchedPtTitle = watch('pt_title')
  const watchedPtSpecialty = watch('pt_specialty')
  const watchedEnName = watch('en_name')
  const watchedEnTitle = watch('en_title')
  const watchedEnSpecialty = watch('en_specialty')

  const toggleSpecialty = (treatmentId: string) => {
    const current = specialties || []
    if (current.includes(treatmentId)) {
      setValue('specialties', current.filter(id => id !== treatmentId), { shouldDirty: true })
    } else {
      setValue('specialties', [...current, treatmentId], { shouldDirty: true })
    }
  }

  const onSubmit = async (data: TeamMemberFormData) => {
    setSaving(true)
    setError(null)

    try {
      // Prepare data for server action
      const editorData: EditorTeamMemberData = {
        id: member?.id,
        slug: data.slug,
        display_order: data.display_order,
        is_published: data.is_published,
        photo_url: data.photo_url || null,
        email: data.email,
        phone: data.phone,
        pt_name: data.pt_name,
        pt_title: data.pt_title,
        pt_specialty: data.pt_specialty,
        pt_bio: data.pt_bio,
        pt_credentials: data.pt_credentials,
        en_name: data.en_name,
        en_title: data.en_title,
        en_specialty: data.en_specialty,
        en_bio: data.en_bio,
        en_credentials: data.en_credentials,
        specialties: data.specialties,
      }

      // Call server action
      const result = await saveTeamMemberFromEditor(editorData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save team member')
      }

      // Success - redirect to team list
      router.push('/admin/team')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save team member')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {member ? 'Edit Team Member' : 'New Team Member'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {member ? `Editing: ${ptTranslation?.name || 'Untitled'}` : 'Add a new staff member or doctor'}
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
                placeholder="dr-joao-silva"
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

            <div className="md:col-span-2">
              <ImageUpload
                label="Team Member Photo"
                value={watchedPhotoUrl}
                onChange={(url) => setValue('photo_url', url, { shouldDirty: true })}
                onRemove={() => setValue('photo_url', null, { shouldDirty: true })}
                bucket="team"
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={5}
                showAIGenerate={true}
                aiPromptHint={`Professional headshot photo of ${watchedPtName || 'dental professional'}, modern dental clinic setting, warm professional lighting`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="doctor@clinica.pt"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+351 123 456 789"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_published')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Published</span>
            </label>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the treatments this team member specializes in
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {treatments.map((treatment) => {
              const translation = treatment.treatment_translations[0]
              const isSelected = specialties.includes(treatment.id)

              return (
                <button
                  key={treatment.id}
                  type="button"
                  onClick={() => toggleSpecialty(treatment.id)}
                  className={`p-3 border rounded-md text-sm text-left transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {translation?.title || treatment.slug}
                </button>
              )
            })}
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
                    Name (PT) *
                  </label>
                  <input
                    type="text"
                    {...register('pt_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. João Silva"
                  />
                  {errors.pt_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.pt_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (PT)
                  </label>
                  <input
                    type="text"
                    {...register('pt_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Médico Dentista"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty (PT)
                  </label>
                  <input
                    type="text"
                    {...register('pt_specialty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ortodontia e Implantologia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography (PT)
                  </label>
                  <textarea
                    {...register('pt_bio')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Informação sobre a experiência profissional..."
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Write a professional biography in Portuguese for ${watchedPtName || 'a dental professional'}, ${watchedPtTitle || ''}, specializing in ${watchedPtSpecialty || 'dentistry'}. Include their expertise, approach to patient care, and professional background.`}
                      contextType="team_bio"
                      onApply={(text) => setValue('pt_bio', text, { shouldDirty: true })}
                      maxTokens={600}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credentials (PT)
                  </label>
                  <textarea
                    {...register('pt_credentials')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Licenciatura, Mestrado, Certificações..."
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`List professional credentials in Portuguese for ${watchedPtName || 'a dental professional'}, ${watchedPtTitle || ''}. Include relevant degrees, certifications, and professional memberships.`}
                      contextType="team_credentials"
                      onApply={(text) => setValue('pt_credentials', text, { shouldDirty: true })}
                      maxTokens={300}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (EN) *
                  </label>
                  <input
                    type="text"
                    {...register('en_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. João Silva"
                  />
                  {errors.en_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.en_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    {...register('en_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dental Surgeon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty (EN)
                  </label>
                  <input
                    type="text"
                    {...register('en_specialty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Orthodontics and Implantology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography (EN)
                  </label>
                  <textarea
                    {...register('en_bio')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Professional experience information..."
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`Write a professional biography in English for ${watchedEnName || watchedPtName || 'a dental professional'}, ${watchedEnTitle || ''}, specializing in ${watchedEnSpecialty || 'dentistry'}. Include their expertise, approach to patient care, and professional background.`}
                      contextType="team_bio"
                      onApply={(text) => setValue('en_bio', text, { shouldDirty: true })}
                      maxTokens={600}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credentials (EN)
                  </label>
                  <textarea
                    {...register('en_credentials')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Degree, Masters, Certifications..."
                  />
                  <div className="mt-2">
                    <AITextAssist
                      prompt={`List professional credentials in English for ${watchedEnName || watchedPtName || 'a dental professional'}, ${watchedEnTitle || ''}. Include relevant degrees, certifications, and professional memberships.`}
                      contextType="team_credentials"
                      onApply={(text) => setValue('en_credentials', text, { shouldDirty: true })}
                      maxTokens={300}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push('/admin/team')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Team Member'}
          </button>
        </div>
      </form>
    </div>
  )
}
