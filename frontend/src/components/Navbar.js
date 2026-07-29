import { Bell, LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearSession } from '../utils/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const logout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
      <div>
        <p className="text-sm text-slate-500">Springboard Internship Project</p>
        <h1 className="text-xl font-bold text-slate-900">Lab Resource Platform</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 md:flex">
          <Search size={16} className="text-slate-400" />
          <input className="w-44 outline-none" placeholder="Search resources" />
        </div>
        <button className="rounded-xl border border-slate-200 p-2.5 text-slate-600"><Bell size={18} /></button>
        <button onClick={logout} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </header>
  )
}
