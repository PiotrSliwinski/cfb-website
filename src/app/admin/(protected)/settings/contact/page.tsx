import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ContactSettingsPage() {
  const supabase = await createServerClient()

  // Fetch all contact info entries
  const { data: contactInfo, error } = await supabase
    .from('contact_information')
    .select('*')
    .order('created_at')

  if (error) {
    console.error('Error fetching contact info:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/settings"
              className="text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Contact Information</span>
          </div>
          <p className="text-sm text-gray-600">
            Manage clinic contact details and business hours
          </p>
        </div>
        <Link
          href="/admin/settings/contact/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Contact Info
        </Link>
      </div>

      {/* Contact Info Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contactInfo?.map((info) => (
              <tr key={info.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {info.info_type || 'primary'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {info.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {info.email || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate">
                    {info.address_line1 || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/settings/contact/${info.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contactInfo && contactInfo.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contact information found</p>
            <Link
              href="/admin/settings/contact/new"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Add your first contact entry
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
