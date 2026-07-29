import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'
import { saveSession } from '../utils/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FACULTY' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const data = await registerUser(form)
      saveSession(data)
      navigate('/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Check backend API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-cyan-200">Lab Resource Platform</p>
          <h1 className="text-5xl font-black leading-tight">Join your institution’s shared research ecosystem.</h1>
          <p className="mt-5 text-blue-100">Create an account to discover equipment, request bookings and track lab activity.</p>
        </div>
      </section>
      <section className="auth-panel">
        <form onSubmit={submit} className="form-card">
          <p className="text-sm font-semibold text-blue-600">CREATE ACCOUNT</p>
          <h2 className="mt-2 text-3xl font-black">Register</h2>
          <div className="mt-6 space-y-4">
            <input className="form-control" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="form-control" type="email" required placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control" type="password" minLength="6" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="FACULTY">Faculty</option>
              <option value="RESEARCHER">Researcher</option>
              <option value="LAB_ADMIN">Lab Admin</option>
            </select>
          </div>
          {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
          <button disabled={loading} className="primary-button mt-6">{loading ? 'Creating account...' : 'Create Account'}</button>
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-blue-600" to="/login">Sign in</Link></p>
        </form>
      </section>
    </div>
  )
}
