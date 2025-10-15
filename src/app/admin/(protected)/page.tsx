import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  // Fetch stats
  const [treatmentsResult, teamResult, faqsResult, submissionsResult] = await Promise.all([
    supabase.from('treatments').select('id', { count: 'exact', head: true }),
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase.from('treatment_faqs').select('id', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
  ])

  const stats = {
    treatments: treatmentsResult.count || 0,
    team: teamResult.count || 0,
    faqs: faqsResult.count || 0,
    submissions: submissionsResult.count || 0,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the Clínica Ferreira Borges content management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Treatments"
          value={stats.treatments}
          href="/admin/treatments"
          color="blue"
        />
        <StatCard
          title="Team Members"
          value={stats.team}
          href="/admin/team"
          color="green"
        />
        <StatCard
          title="FAQs"
          value={stats.faqs}
          href="/admin/faqs"
          color="purple"
        />
        <StatCard
          title="Submissions"
          value={stats.submissions}
          href="/admin/submissions"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Edit Page Content"
            description="Edit translations and page text"
            href="/admin/content"
          />
          <QuickAction
            title="Add Treatment"
            description="Create a new dental treatment"
            href="/admin/treatments/new"
          />
          <QuickAction
            title="Add Team Member"
            description="Add a new staff member"
            href="/admin/team/new"
          />
          <QuickAction
            title="Add FAQ"
            description="Create a new FAQ entry"
            href="/admin/faqs/new"
          />
          <QuickAction
            title="View Submissions"
            description="Check contact form submissions"
            href="/admin/submissions"
          />
          <QuickAction
            title="Clinic Information"
            description="Edit address, hours, and contact info"
            href="/admin/settings/clinic"
          />
          <QuickAction
            title="Languages"
            description="Manage website languages"
            href="/admin/settings/languages"
          />
          <QuickAction
            title="Contact Settings"
            description="Manage contact information"
            href="/admin/settings/contact"
          />
          <QuickAction
            title="Website Settings"
            description="Configure global settings"
            href="/admin/settings"
          />
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-sm text-gray-500">Activity tracking coming soon...</p>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string
  value: number
  href: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo'
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
  }

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center">
          <div className={`${colors[color]} rounded-lg p-3`}>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  )
}
