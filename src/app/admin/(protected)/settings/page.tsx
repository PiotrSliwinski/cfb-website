import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createServerClient()

  // Fetch counts for each settings section
  const [
    { count: contactInfoCount },
    { count: paymentOptionsCount },
    { count: insuranceProvidersCount },
    { count: socialMediaCount },
  ] = await Promise.all([
    supabase.from('contact_information').select('*', { count: 'exact', head: true }),
    supabase.from('payment_options').select('*', { count: 'exact', head: true }),
    supabase.from('insurance_providers').select('*', { count: 'exact', head: true }),
    supabase.from('social_media').select('*', { count: 'exact', head: true }),
  ])

  const settingsSections = [
    {
      title: 'Contact Information',
      description: 'Manage clinic contact details, phone numbers, addresses, and business hours',
      href: '/admin/settings/contact',
      count: contactInfoCount || 0,
      icon: '📞',
    },
    {
      title: 'Payment Options',
      description: 'Configure accepted payment methods and billing options',
      href: '/admin/settings/payments',
      count: paymentOptionsCount || 0,
      icon: '💳',
    },
    {
      title: 'Insurance Providers',
      description: 'Manage accepted insurance companies and coverage details',
      href: '/admin/settings/insurance',
      count: insuranceProvidersCount || 0,
      icon: '🏥',
    },
    {
      title: 'Social Media',
      description: 'Update social media links and profiles',
      href: '/admin/settings/social',
      count: socialMediaCount || 0,
      icon: '🌐',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage website configuration and global settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="text-4xl mr-4">{section.icon}</div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {section.count} {section.count === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    Manage →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
