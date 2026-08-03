import React from 'react'

export function Label({ children }) {
  return <label className="block text-xs font-medium text-muted mb-1.5">{children}</label>
}

export function Input({ label, className = '', full, ...props }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      {label && <Label>{label}</Label>}
      <input
        className={`w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition ${className}`}
        {...props}
      />
    </div>
  )
}

export function Select({ label, className = '', full, children, ...props }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      {label && <Label>{label}</Label>}
      <select
        className={`w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, className = '', full, ...props }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      {label && <Label>{label}</Label>}
      <textarea
        className={`w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition resize-none ${className}`}
        {...props}
      />
    </div>
  )
}
