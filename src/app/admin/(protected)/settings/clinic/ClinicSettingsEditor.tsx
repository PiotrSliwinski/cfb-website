'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, MapPin, Phone, Mail, Clock, Building, FileText } from 'lucide-react'
import Link from 'next/link'

type ClinicSettings = {
  id: string
  clinic_name: string
  phone: string
  email: string
  address_line1: string
  address_line2: string | null
  postal_code: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  google_place_id: string | null
  operating_hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  ers_number: string | null
  establishment_number: string | null
  licence_number: string | null
  booking_url: string | null
}

type Props = {
  settings: ClinicSettings
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

export function ClinicSettingsEditor({ settings: initialSettings }: Props) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/clinic-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      alert('Clinic settings saved successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error saving:', error)
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value,
        },
      },
    }))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/settings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-auto inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                value={settings.clinic_name}
                onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking URL
              </label>
              <input
                type="url"
                value={settings.booking_url || ''}
                onChange={(e) => setSettings({ ...settings, booking_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://booking.example.com"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={settings.address_line1}
                onChange={(e) => setSettings({ ...settings, address_line1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={settings.address_line2 || ''}
                onChange={(e) => setSettings({ ...settings, address_line2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={settings.postal_code}
                  onChange={(e) => setSettings({ ...settings, postal_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={settings.latitude || ''}
                  onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={settings.longitude || ''}
                  onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Place ID
                </label>
                <input
                  type="text"
                  value={settings.google_place_id || ''}
                  onChange={(e) => setSettings({ ...settings, google_place_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
          </div>

          <div className="space-y-3">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <span className="text-sm font-medium text-gray-700">{day.label}</span>
                </div>
                <div className="col-span-3">
                  <input
                    type="time"
                    value={settings.operating_hours[day.key]?.open || ''}
                    onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                    disabled={settings.operating_hours[day.key]?.closed}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="time"
                    value={settings.operating_hours[day.key]?.close || ''}
                    onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                    disabled={settings.operating_hours[day.key]?.closed}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="col-span-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.operating_hours[day.key]?.closed || false}
                      onChange={(e) => updateHours(day.key, 'closed', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Regulatory Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ERS Number
              </label>
              <input
                type="text"
                value={settings.ers_number || ''}
                onChange={(e) => setSettings({ ...settings, ers_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="N.º Registo ERS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Establishment Number
              </label>
              <input
                type="text"
                value={settings.establishment_number || ''}
                onChange={(e) => setSettings({ ...settings, establishment_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Estabelecimento Fixo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Licence Number
              </label>
              <input
                type="text"
                value={settings.licence_number || ''}
                onChange={(e) => setSettings({ ...settings, licence_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Licença nº"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
