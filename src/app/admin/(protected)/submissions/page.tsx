import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SubmissionsPage() {
  const supabase = await createServerClient()

  // Fetch all contact submissions
  const { data: submissions, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching submissions:', error)
  }

  // Count by status
  const newCount = submissions?.filter((s) => s.status === 'new').length || 0
  const respondedCount = submissions?.filter((s) => s.status === 'responded').length || 0
  const archivedCount = submissions?.filter((s) => s.status === 'archived').length || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage contact form submissions
        </p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">{newCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📧</span>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-green-600">{respondedCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-600">{archivedCount}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <span className="text-2xl">📁</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest
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
            {submissions?.map((submission) => (
              <tr
                key={submission.id}
                className={`hover:bg-gray-50 ${
                  submission.status === 'new' ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`mailto:${submission.email}`}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    {submission.email}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.phone ? (
                    <a
                      href={`tel:${submission.phone}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {submission.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.treatment_interest || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      submission.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : submission.status === 'responded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {submission.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/submissions/${submission.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submissions && submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No submissions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
