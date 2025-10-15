import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FAQsPage() {
  const supabase = await createServerClient()

  // Fetch all FAQs with PT translations and treatment info
  const { data: faqs, error } = await supabase
    .from('treatment_faqs')
    .select(`
      id,
      display_order,
      treatment_id,
      treatments (
        slug,
        treatment_translations!inner (
          title,
          language_code
        )
      ),
      treatment_faq_translations!inner (
        question,
        language_code
      )
    `)
    .eq('treatment_faq_translations.language_code', 'pt')
    .order('treatment_id')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching FAQs:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage frequently asked questions for treatments
          </p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add FAQ
        </Link>
      </div>

      {/* FAQs Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Treatment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question (PT)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faqs?.map((faq) => {
              const translation = faq.treatment_faq_translations[0]
              const treatment = Array.isArray(faq.treatments) ? faq.treatments[0] : faq.treatments
              const treatmentTranslation = treatment?.treatment_translations?.[0]
              return (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {faq.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {treatmentTranslation?.title || 'Unknown Treatment'}
                    </div>
                    <div className="text-sm text-gray-500">{treatment?.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {translation?.question || 'Untitled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/faqs/${faq.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/pt/tratamentos/${treatment?.slug}`}
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

        {faqs && faqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No FAQs found</p>
            <Link
              href="/admin/faqs/new"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Add your first FAQ
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
