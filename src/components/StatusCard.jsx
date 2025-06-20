import React from 'react'

export default function StatusCard({ title, value, status }) {
  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}