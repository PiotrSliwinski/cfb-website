'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SubmissionDetailProps {
  submission: any
}

export default function SubmissionDetail({ submission }: SubmissionDetailProps) {
  const router = useRouter()
  const [status, setStatus] = useState(submission.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/submissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submission.id,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/submissions?id=${submission.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete submission')
      }

      router.push('/admin/submissions')
      router.refresh()
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission')
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/admin/submissions"
            className="text-gray-600 hover:text-gray-900"
          >
            Submissions
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">
            {submission.name}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
      </div>

      {/* Submission Info */}
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        {/* Status and Actions */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={isUpdating}
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="new">New</option>
              <option value="responded">Responded</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            <div>
              Submitted:{' '}
              {new Date(submission.created_at).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {submission.language_code && (
              <div className="mt-1">
                Language: {submission.language_code.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-gray-900">{submission.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <a
              href={`mailto:${submission.email}`}
              className="text-blue-600 hover:text-blue-900"
            >
              {submission.email}
            </a>
          </div>

          {submission.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <a
                href={`tel:${submission.phone}`}
                className="text-blue-600 hover:text-blue-900"
              >
                {submission.phone}
              </a>
            </div>
          )}

          {submission.treatment_interest && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Interest
              </label>
              <p className="text-gray-900">{submission.treatment_interest}</p>
            </div>
          )}
        </div>

        {/* Message */}
        {submission.message && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <a
            href={`mailto:${submission.email}?subject=Re: Contact Form Submission${
              submission.treatment_interest
                ? ` - ${submission.treatment_interest}`
                : ''
            }`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Send Email
          </a>

          {submission.phone && (
            <a
              href={`tel:${submission.phone}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Call
            </a>
          )}

          <button
            onClick={() => updateStatus('responded')}
            disabled={isUpdating || status === 'responded'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Mark as Responded
          </button>

          <button
            onClick={() => updateStatus('archived')}
            disabled={isUpdating || status === 'archived'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Archive
          </button>

          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Submissions
        </Link>
      </div>
    </div>
  )
}
