import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FlaskConical, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Alert from '../components/ui/Alert'
import { Input, Select } from '../components/ui/Field'
import Button from '../components/ui/Button'

const ROLES = ['RESEARCHER', 'LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [institutions, setInstitutions] = useState([])
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', department: '',
    role: 'RESEARCHER', institutionId: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    client.get('/public/institutions').then(res => setInstitutions(res.data)).catch(() => {})
  }, [])

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register({ ...form, institutionId: form.institutionId ? Number(form.institutionId) : null })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-10 px-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-card shadow-card p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FlaskConical size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">LabShare</span>
        </div>
        <h2 className="font-display text-xl font-bold text-ink mt-5">Create your account</h2>
        <p className="text-muted text-sm mt-1 mb-6">Join your institution's resource platform</p>

        {error && <Alert>{error}</Alert>}

        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Input label="Full name" full value={form.fullName} onChange={e => update('fullName', e.target.value)} />
          <Input label="Email" full type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          <Input label="Password" full type="password" value={form.password} onChange={e => update('password', e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={e => update('phone', e.target.value)} />
          <Input label="Department" value={form.department} onChange={e => update('department', e.target.value)} />

          <Select label="Role" value={form.role} onChange={e => update('role', e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r.replaceAll('_', ' ')}</option>)}
          </Select>
          <Select label="Institution" value={form.institutionId} onChange={e => update('institutionId', e.target.value)}>
            <option value="">— none —</option>
            {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>

          <Button type="submit" disabled={loading} className="col-span-2 justify-center mt-1" size="lg" icon={ArrowRight}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="text-sm text-muted mt-5 text-center">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
