import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function InsuranceProvidersPage() {
  const supabase = await createServerClient()

  const { data: insuranceProviders, error } = await supabase
    .from('insurance_providers')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching insurance providers:', error)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insurance Providers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage accepted insurance companies and coverage details
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Insurance Providers</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add New Provider
          </button>
        </div>

        {!insuranceProviders || insuranceProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🏥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insurance providers yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get started by adding your first insurance provider
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add First Provider
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {insuranceProviders.map((provider: any) => (
              <div
                key={provider.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {provider.logo_url && (
                      <img
                        src={provider.logo_url}
                        alt={provider.name}
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      {provider.description && (
                        <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        provider.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {provider.is_published ? 'Published' : 'Draft'}
                    </span>
                    <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
