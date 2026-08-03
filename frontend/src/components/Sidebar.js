import { CalendarDays, FlaskConical, LayoutDashboard, Settings, Wrench } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/equipment', label: 'Equipment', icon: FlaskConical },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-white lg:block">
      <div className="mb-9 flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500 p-2"><FlaskConical size={22} /></div>
        <div>
          <p className="font-bold">LabResource</p>
          <p className="text-xs text-slate-400">Utilization Platform</p>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
