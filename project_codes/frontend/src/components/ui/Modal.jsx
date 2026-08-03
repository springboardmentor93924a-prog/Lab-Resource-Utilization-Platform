import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, subtitle, children, onClose, width = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className={`bg-surface rounded-card shadow-popover w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-border sticky top-0 bg-surface">
          <div>
            <h3 className="font-display font-semibold text-ink">{title}</h3>
            {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-ink p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
