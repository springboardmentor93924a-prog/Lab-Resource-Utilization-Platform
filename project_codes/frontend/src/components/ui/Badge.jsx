import React from 'react'

const VARIANTS = {
  PENDING_APPROVAL: { bg: 'bg-warn-light', text: 'text-warn', dot: 'bg-warn' },
  CONFIRMED:         { bg: 'bg-primary-light', text: 'text-primary', dot: 'bg-primary' },
  IN_USE:            { bg: 'bg-accent-light', text: 'text-accent', dot: 'bg-accent' },
  COMPLETED:         { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  CANCELLED:         { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  NO_SHOW:           { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  AVAILABLE:         { bg: 'bg-accent-light', text: 'text-accent', dot: 'bg-accent' },
  BOOKED:            { bg: 'bg-primary-light', text: 'text-primary', dot: 'bg-primary' },
  UNDER_MAINTENANCE: { bg: 'bg-warn-light', text: 'text-warn', dot: 'bg-warn' },
  OUT_OF_SERVICE:    { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  RETIRED:           { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  SCHEDULED:         { bg: 'bg-primary-light', text: 'text-primary', dot: 'bg-primary' },
  IN_PROGRESS:       { bg: 'bg-warn-light', text: 'text-warn', dot: 'bg-warn' },
  OVERDUE:           { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  PENDING:           { bg: 'bg-warn-light', text: 'text-warn', dot: 'bg-warn' },
  APPROVED:          { bg: 'bg-accent-light', text: 'text-accent', dot: 'bg-accent' },
  REJECTED:          { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
}

export default function Badge({ status, label }) {
  const v = VARIANTS[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${v.bg} ${v.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {label || status?.replaceAll('_', ' ')}
    </span>
  )
}
