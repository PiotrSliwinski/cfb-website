import { createServerClient } from '@/lib/supabase/server'
import { ClinicSettingsEditor } from './ClinicSettingsEditor'
import { redirect } from 'next/navigation'

export default async function ClinicSettingsPage() {
  const supabase = await createServerClient()

  // Fetch clinic settings
  const { data: settings, error } = await supabase
    .from('clinic_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching clinic settings:', error)
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Clinic Settings</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading clinic settings: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Clinic Settings</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No clinic settings found. Please run migrations.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinic Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage clinic contact information, address, and operating hours
        </p>
      </div>

      <ClinicSettingsEditor settings={settings} />
    </div>
  )
}
