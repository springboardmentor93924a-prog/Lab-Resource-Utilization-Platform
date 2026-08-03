import React from 'react'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  accent: 'bg-accent text-white hover:opacity-90',
  ghost: 'bg-transparent text-ink border border-border hover:bg-gray-50',
  danger: 'bg-danger-light text-danger hover:bg-danger hover:text-white',
  subtle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-sm px-5 py-2.5',
}

export default function Button({ variant = 'primary', size = 'md', className = '', icon: Icon, children, ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}
