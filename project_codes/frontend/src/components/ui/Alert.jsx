import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Alert({ type = 'error', children }) {
  const isError = type === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2
  return (
    <div className={`flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg mb-4 ${isError ? 'bg-danger-light text-danger' : 'bg-accent-light text-accent'}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
