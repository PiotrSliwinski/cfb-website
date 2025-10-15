'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'

const contactInfoSchema = z.object({
  info_type: z.string().min(1, 'Type is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  google_maps_embed_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_primary: z.boolean(),
  pt_business_hours: z.string().optional(),
  pt_additional_notes: z.string().optional(),
  en_business_hours: z.string().optional(),
  en_additional_notes: z.string().optional(),
})

type ContactInfoFormData = z.infer<typeof contactInfoSchema>

interface ContactInfoEditorProps {
  contactInfo: any
}

export default function ContactInfoEditor({ contactInfo }: ContactInfoEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find existing translations
  const ptTranslation = contactInfo?.contact_information_translations?.find(
    (t: any) => t.language_code === 'pt'
  )
  const enTranslation = contactInfo?.contact_information_translations?.find(
    (t: any) => t.language_code === 'en'
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      info_type: contactInfo?.info_type || 'primary',
      phone: contactInfo?.phone || '',
      email: contactInfo?.email || '',
      address_line1: contactInfo?.address_line1 || '',
      address_line2: contactInfo?.address_line2 || '',
      city: contactInfo?.city || '',
      postal_code: contactInfo?.postal_code || '',
      latitude: contactInfo?.latitude?.toString() || '',
      longitude: contactInfo?.longitude?.toString() || '',
      google_maps_embed_url: contactInfo?.google_maps_embed_url || '',
      is_primary: contactInfo?.is_primary ?? true,
      pt_business_hours: ptTranslation?.business_hours || '',
      pt_additional_notes: ptTranslation?.additional_notes || '',
      en_business_hours: enTranslation?.business_hours || '',
      en_additional_notes: enTranslation?.additional_notes || '',
    },
  })

  const onSubmit = async (data: ContactInfoFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/settings/contact', {
        method: contactInfo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contactInfo?.id,
          info_type: data.info_type,
          phone: data.phone,
          email: data.email,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          postal_code: data.postal_code,
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null,
          google_maps_embed_url: data.google_maps_embed_url,
          is_primary: data.is_primary,
          translations: {
            pt: {
              business_hours: data.pt_business_hours,
              additional_notes: data.pt_additional_notes,
            },
            en: {
              business_hours: data.en_business_hours,
              additional_notes: data.en_additional_notes,
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save contact information')
      }

      router.push('/admin/settings/contact')
      router.refresh()
    } catch (error) {
      console.error('Error saving contact info:', error)
      alert(error instanceof Error ? error.message : 'Failed to save contact information')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!contactInfo) return
    if (!confirm('Are you sure you want to delete this contact information?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/settings/contact?id=${contactInfo.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete contact information')
      }

      router.push('/admin/settings/contact')
      router.refresh()
    } catch (error) {
      console.error('Error deleting contact info:', error)
      alert('Failed to delete contact information')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin/settings" className="text-gray-600 hover:text-gray-900">
            Settings
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/admin/settings/contact" className="text-gray-600 hover:text-gray-900">
            Contact Information
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">
            {contactInfo ? 'Edit' : 'New'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {contactInfo ? 'Edit Contact Information' : 'New Contact Information'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type *
              </label>
              <select
                {...register('info_type')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="emergency">Emergency</option>
              </select>
              {errors.info_type && (
                <p className="mt-1 text-sm text-red-600">{errors.info_type.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_primary')}
                id="is_primary"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">
                Primary Contact
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+351 21 123 4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="info@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Address</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 1
            </label>
            <input
              type="text"
              {...register('address_line1')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <input
              type="text"
              {...register('address_line2')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Lisboa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                {...register('postal_code')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1000-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="text"
                {...register('latitude')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="38.7223"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="text"
                {...register('longitude')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="-9.1393"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Google Maps Embed URL
            </label>
            <input
              type="text"
              {...register('google_maps_embed_url')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://www.google.com/maps/embed?..."
            />
            {errors.google_maps_embed_url && (
              <p className="mt-1 text-sm text-red-600">{errors.google_maps_embed_url.message}</p>
            )}
          </div>
        </div>

        {/* Language Tabs for Business Hours */}
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
                    Business Hours (PT)
                  </label>
                  <textarea
                    {...register('pt_business_hours')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Segunda-Sexta: 9:00-18:00&#10;Sábado: 9:00-13:00&#10;Domingo: Fechado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Notes (PT)
                  </label>
                  <textarea
                    {...register('pt_additional_notes')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Additional information in Portuguese..."
                  />
                </div>
              </>
            )}

            {activeTab === 'en' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Hours (EN)
                  </label>
                  <textarea
                    {...register('en_business_hours')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Monday-Friday: 9:00-18:00&#10;Saturday: 9:00-13:00&#10;Sunday: Closed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Notes (EN)
                  </label>
                  <textarea
                    {...register('en_additional_notes')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Additional information in English..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {contactInfo && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/settings/contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : contactInfo ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
