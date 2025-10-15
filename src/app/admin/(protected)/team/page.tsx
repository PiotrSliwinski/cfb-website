import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TeamPage() {
  const supabase = await createServerClient()

  // Fetch all team members with PT translations
  const { data: teamMembers, error } = await supabase
    .from('team_members')
    .select(`
      id,
      slug,
      photo_url,
      email,
      phone,
      is_published,
      display_order,
      created_at,
      team_member_translations!inner (
        name,
        language_code
      )
    `)
    .eq('team_member_translations.language_code', 'pt')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage dental clinic staff and doctors
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Team Member
        </Link>
      </div>

      {/* Team Members Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
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
            {teamMembers?.map((member) => {
              const translation = member.team_member_translations[0]
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={translation?.name || 'Team member'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No photo</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {translation?.name || 'Untitled'}
                    </div>
                    <div className="text-sm text-gray-500">{member.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/team/${member.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/pt/equipa`}
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

        {teamMembers && teamMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found</p>
            <Link
              href="/admin/team/new"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Add your first team member
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
