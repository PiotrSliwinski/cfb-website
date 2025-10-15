import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Locale } from '@/types'

export default async function TreatmentsPage() {
  const supabase = await createServerClient()

  // Fetch all treatments with PT translations
  const { data: treatments, error } = await supabase
    .from('treatments')
    .select(`
      id,
      slug,
      is_published,
      display_order,
      created_at,
      treatment_translations!inner (
        title,
        language_code
      )
    `)
    .eq('treatment_translations.language_code', 'pt')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching treatments:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treatments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage dental treatments and services
          </p>
        </div>
        <Link
          href="/admin/treatments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Treatment
        </Link>
      </div>

      {/* Treatments Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {treatments?.map((treatment) => {
              const translation = treatment.treatment_translations[0]
              return (
                <tr key={treatment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {treatment.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {translation?.title || 'Untitled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {treatment.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        treatment.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {treatment.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/treatments/${treatment.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/pt/tratamentos/${treatment.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {treatments && treatments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No treatments found</p>
            <Link
              href="/admin/treatments/new"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Create your first treatment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
