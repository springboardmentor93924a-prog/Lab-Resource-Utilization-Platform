import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, PackageSearch, CalendarClock, Wrench,
  Share2, BarChart3, Bell, LogOut, ChevronDown, FlaskConical
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { to: '/equipment', label: 'Equipment Catalog', icon: PackageSearch, roles: null },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock, roles: null },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'] },
  { to: '/sharing', label: 'Resource Sharing', icon: Share2, roles: ['LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: null },
]

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleNav = NAV.filter(n => !n.roles || n.roles.includes(user?.role))
  const current = NAV.find(n => n.to === location.pathname)

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-60 bg-ink flex flex-col shrink-0">
        <div className="px-5 h-16 flex items-center gap-2 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <FlaskConical size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display text-white text-sm font-bold leading-none tracking-tight">LabShare</div>
            <div className="text-[10px] text-white/40 leading-none mt-0.5">Resource Platform</div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2.5 space-y-0.5">
          {visibleNav.map(item => {
            const active = location.pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
                  active ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-2.5 pb-3">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13.5px] text-white/50 hover:bg-white/5 hover:text-white/90"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 shrink-0">
          <div>
            <div className="text-xs text-muted">{current?.label ? 'LabShare' : ''}</div>
            <h2 className="font-display text-sm font-semibold text-ink">{current?.label || ''}</h2>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-semibold text-xs flex items-center justify-center">
                {initials(user?.fullName)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-ink leading-tight">{user?.fullName}</div>
                <div className="text-[11px] text-muted leading-tight">{user?.role?.replaceAll('_', ' ')}</div>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-lg shadow-popover py-1 z-10">
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger-light flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
