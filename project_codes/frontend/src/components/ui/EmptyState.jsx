import React from 'react'

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 border border-dashed border-border rounded-card bg-gray-50/50">
      {Icon && <div className="w-11 h-11 rounded-full bg-white border border-border flex items-center justify-center mb-3 text-muted"><Icon size={20} /></div>}
      <div className="font-medium text-sm text-ink">{title}</div>
      {description && <div className="text-sm text-muted mt-1 max-w-sm">{description}</div>}
    </div>
  )
}
