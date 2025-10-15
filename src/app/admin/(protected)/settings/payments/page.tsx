import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PaymentOptionsPage() {
  const supabase = await createServerClient()

  const { data: paymentOptions, error } = await supabase
    .from('payment_options')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching payment options:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Payment Options</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure accepted payment methods and billing options
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Payment Methods</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add New Method
          </button>
        </div>

        {!paymentOptions || paymentOptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment options yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get started by adding your first payment method
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add First Method
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentOptions.map((option: any) => (
              <div
                key={option.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  {option.icon && (
                    <span className="text-3xl">{option.icon}</span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      option.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {option.is_published ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                {option.description && (
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                )}
                <button className="w-full px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
