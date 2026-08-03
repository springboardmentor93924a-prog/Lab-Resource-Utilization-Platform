import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FlaskConical, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/ui/Alert'
import { Input } from '../components/ui/Field'
import Button from '../components/ui/Button'

const DEMO_ACCOUNTS = [
  { email: 'researcher@demo.com', role: 'Researcher' },
  { email: 'technician@demo.com', role: 'Lab Technician' },
  { email: 'manager@demo.com', role: 'Lab Manager' },
  { email: 'depthead@demo.com', role: 'Department Head' },
  { email: 'instadmin@demo.com', role: 'Institution Admin' },
  { email: 'sysadmin@demo.com', role: 'System Admin' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('researcher@demo.com')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <FlaskConical size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">LabShare</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Every instrument, fully booked. Every hour, accounted for.
          </h1>
          <p className="text-white/60 mt-4 text-[15px] leading-relaxed">
            Share expensive lab equipment across departments and institutions —
            book time, track utilization, and stay ahead of maintenance from one place.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-6 mono text-sm">
          <div><div className="text-2xl font-semibold text-accent">98%</div><div className="text-white/40 text-xs mt-1">Uptime tracked</div></div>
          <div><div className="text-2xl font-semibold text-accent">6</div><div className="text-white/40 text-xs mt-1">Role types</div></div>
          <div><div className="text-2xl font-semibold text-accent">11</div><div className="text-white/40 text-xs mt-1">Platform modules</div></div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FlaskConical size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">LabShare</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink">Welcome back</h2>
          <p className="text-muted text-sm mt-1.5 mb-7">Sign in to your institution's workspace</p>

          {error && <Alert>{error}</Alert>}

          <form onSubmit={submit} className="space-y-4">
            <Input label="Email" full value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Password" full type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit" disabled={loading} className="w-full justify-center" size="lg" icon={ArrowRight}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-5">
            <div className="text-xs font-medium text-muted mb-2.5">Try a demo account · password <span className="mono text-ink">Password123!</span></div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map(d => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword('Password123!') }}
                  className="text-left text-xs px-2.5 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary-light transition-colors"
                >
                  <div className="font-medium text-ink">{d.role}</div>
                  <div className="text-muted mono text-[10px] truncate">{d.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted mt-6 text-center">
            No account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
