import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FlaskConical, ShieldCheck } from 'lucide-react'
import { loginUser } from '../services/authService'
import { saveSession } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const data = await loginUser(form)
      saveSession(data)
      navigate('/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Check backend API or credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex rounded-2xl bg-white/10 p-4"><FlaskConical size={42} /></div>
          <h1 className="text-5xl font-black leading-tight">Manage every laboratory resource from one intelligent platform.</h1>
          <p className="mt-6 text-lg text-blue-100">Equipment availability, bookings, utilization analytics and maintenance workflows in one place.</p>
          <div className="mt-8 flex items-center gap-3 text-sm text-blue-100"><ShieldCheck /> Secure JWT-based authentication</div>
        </div>
      </section>
      <section className="auth-panel">
        <form onSubmit={handleSubmit} className="form-card">
          <p className="text-sm font-semibold text-blue-600">WELCOME BACK</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue.</p>

          <label className="mt-7 block text-sm font-semibold text-slate-700">Email</label>
          <input className="form-control mt-2" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />

          <label className="mt-5 block text-sm font-semibold text-slate-700">Password</label>
          <input className="form-control mt-2" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />

          {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
          <button disabled={loading} className="primary-button mt-6">{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="mt-5 text-center text-sm text-slate-500">New user? <Link className="font-bold text-blue-600" to="/register">Create account</Link></p>
        </form>
      </section>
    </div>
  )
}
