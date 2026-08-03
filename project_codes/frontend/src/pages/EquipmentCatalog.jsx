import React, { useEffect, useMemo, useState } from 'react'
import {
  Search, Plus, Beaker, DollarSign, Share2, Microscope, Thermometer,
  Cpu, Zap, FlaskConical, Atom, Dna, Gauge
} from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input, Textarea } from '../components/ui/Field'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'

const canManage = (role) => ['LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'].includes(role)

// Deterministic icon + accent color per category — gives each catalog card a
// distinct visual identity instead of a uniform gray header everywhere.
const CATEGORY_ICONS = [
  { match: /micro|imaging|optic/i, icon: Microscope, color: '#1D4E89' },
  { match: /therm|temp|freez|incub/i, icon: Thermometer, color: '#C88719' },
  { match: /comput|data|sensor|electr/i, icon: Cpu, color: '#5B4B8A' },
  { match: /spectro|laser|energy/i, icon: Zap, color: '#C0392B' },
  { match: /chem|flask|solution/i, icon: FlaskConical, color: '#2FA6A2' },
  { match: /physic|particle|atom/i, icon: Atom, color: '#1D4E89' },
  { match: /bio|dna|genom/i, icon: Dna, color: '#2FA6A2' },
  { match: /gauge|measure|calibrat/i, icon: Gauge, color: '#C88719' },
]
function categoryVisual(category = '') {
  const found = CATEGORY_ICONS.find(c => c.match.test(category))
  return found || { icon: Beaker, color: '#6B7280' }
}

export default function EquipmentCatalog() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [q, setQ] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [booking, setBooking] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => client.get('/equipment', { params: q ? { q } : {} }).then(res => setEquipment(res.data.data))
  useEffect(() => { load() }, [q])

  const categories = useMemo(() => {
    const set = new Set(equipment.map(e => e.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [equipment])

  const filtered = activeCategory === 'All' ? equipment : equipment.filter(e => e.category === activeCategory)

  return (
    <div>
      <PageHeader
        title="Equipment Catalog"
        subtitle="Browse, search, and reserve shared lab instruments"
        action={canManage(user?.role) && (
          <Button icon={Plus} onClick={() => setShowNew(true)}>Add equipment</Button>
        )}
      />

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or category…"
            className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-sm bg-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === c
                  ? 'bg-ink text-white border-ink'
                  : 'border-border text-muted hover:border-ink/30 hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      {filtered.length === 0 ? (
        <EmptyState icon={Beaker} title="No equipment found" description="Try a different search term, or add the first item to this catalog." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => {
            const { icon: Icon, color } = categoryVisual(e.category)
            return (
              <div key={e.id} className="bg-surface border border-border rounded-card shadow-card overflow-hidden flex flex-col group">
                <div className="h-20 flex items-center justify-between px-5 relative" style={{ background: `linear-gradient(135deg, ${color}14, ${color}05)` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1F`, color }}>
                    <Icon size={20} />
                  </div>
                  <Badge status={e.status} />
                </div>
                <div className="p-5 pt-4 flex flex-col flex-1">
                  <div className="font-display font-semibold text-ink text-[15px] truncate">{e.name}</div>
                  <div className="text-xs text-muted mt-0.5">{e.category || 'Uncategorized'} · {e.department}</div>
                  <p className="text-sm text-muted mt-3 line-clamp-2 flex-1">{e.specifications}</p>
                  <div className="flex items-center gap-3 text-xs text-muted mt-3">
                    {e.sharableAcrossInstitutions && <span className="flex items-center gap-1"><Share2 size={12} /> Shared</span>}
                    {e.hourlyUsageCost && <span className="flex items-center gap-1"><DollarSign size={12} /> {e.hourlyUsageCost}/hr</span>}
                  </div>
                  <Button
                    variant="accent"
                    className="w-full justify-center mt-4"
                    onClick={() => setBooking(e)}
                    disabled={e.status === 'RETIRED' || e.status === 'OUT_OF_SERVICE'}
                  >
                    Reserve
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {booking && (
        <BookingModal equipment={booking} onClose={() => setBooking(null)}
          onDone={(text) => { setBooking(null); setMsg(text); load() }} />
      )}
      {showNew && canManage(user?.role) && (
        <NewEquipmentModal institutionId={user.institutionId} onClose={() => setShowNew(false)}
          onDone={() => { setShowNew(false); load() }} />
      )}
    </div>
  )
}

function BookingModal({ equipment, onClose, onDone }) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      await client.post('/bookings', { equipmentId: equipment.id, startTime, endTime, purpose })
      onDone('Booking request submitted — awaiting approval.')
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={`Reserve ${equipment.name}`} subtitle="Submit a booking request for approval" onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="Start time" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <Input label="End time" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
      </div>
      <Textarea label="Purpose" full rows={2} value={purpose} onChange={e => setPurpose(e.target.value)} className="mb-4" />
      <Button className="w-full justify-center" onClick={submit} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit request'}
      </Button>
    </Modal>
  )
}

function NewEquipmentModal({ institutionId, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', category: '', department: '', specifications: '', hourlyUsageCost: '', sharableAcrossInstitutions: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      await client.post('/equipment', { ...form, institutionId })
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add equipment" subtitle="Register a new instrument in the catalog" onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Name" full value={form.name} onChange={e => update('name', e.target.value)} />
        <Input label="Category" value={form.category} onChange={e => update('category', e.target.value)} />
        <Input label="Department" value={form.department} onChange={e => update('department', e.target.value)} />
        <Input label="Hourly usage cost ($)" full value={form.hourlyUsageCost} onChange={e => update('hourlyUsageCost', e.target.value)} />
        <Textarea label="Specifications" full rows={2} value={form.specifications} onChange={e => update('specifications', e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm mt-3 mb-4 text-ink">
        <input type="checkbox" checked={form.sharableAcrossInstitutions}
          onChange={e => update('sharableAcrossInstitutions', e.target.checked)} className="rounded border-border" />
        Enable inter-institution sharing
      </label>
      <Button className="w-full justify-center" onClick={submit} disabled={loading}>
        {loading ? 'Creating…' : 'Create equipment'}
      </Button>
    </Modal>
  )
}
