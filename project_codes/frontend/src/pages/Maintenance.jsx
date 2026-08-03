import React, { useEffect, useState } from 'react'
import { Wrench, PlayCircle, CheckCircle2, Plus } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input, Select, Textarea } from '../components/ui/Field'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString([], { dateStyle: 'medium' }) : '—' }

const COLUMNS = [
  { key: 'SCHEDULED', title: 'Scheduled', accent: '#1D4E89' },
  { key: 'IN_PROGRESS', title: 'In progress', accent: '#C88719' },
  { key: 'COMPLETED', title: 'Completed', accent: '#2FA6A2' },
]

export default function Maintenance() {
  const [records, setRecords] = useState([])
  const [equipment, setEquipment] = useState([])
  const [showNew, setShowNew] = useState(false)

  const load = () => client.get('/maintenance').then(res => setRecords(res.data.data))
  useEffect(() => { load(); client.get('/equipment').then(res => setEquipment(res.data.data)) }, [])

  const start = (id) => client.patch(`/maintenance/${id}/start`).then(load)
  const complete = (id) => client.patch(`/maintenance/${id}/complete?downtimeHours=2`).then(load)

  const byColumn = (key) => records.filter(r => r.status === key)

  return (
    <div>
      <PageHeader
        title="Maintenance & Calibration"
        subtitle="A work-order board for scheduling, tracking, and closing out service tasks"
        action={<Button icon={Plus} onClick={() => setShowNew(true)}>Schedule task</Button>}
      />

      {records.length === 0 ? (
        <EmptyState icon={Wrench} title="No maintenance records" description="Scheduled tasks will appear here as a work-order board." />
      ) : (
        <div className="grid grid-cols-3 gap-4 items-start">
          {COLUMNS.map(col => {
            const items = byColumn(col.key)
            return (
              <div key={col.key} className="bg-gray-50/70 border border-border rounded-card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
                    <span className="text-sm font-semibold text-ink">{col.title}</span>
                  </div>
                  <span className="text-xs mono text-muted">{items.length}</span>
                </div>
                <div className="p-3 space-y-2.5 min-h-[80px]">
                  {items.length === 0 && (
                    <div className="text-xs text-muted text-center py-6 border border-dashed border-border rounded-lg">Nothing here</div>
                  )}
                  {items.map(r => (
                    <div key={r.id} className="bg-surface border border-border rounded-lg p-3.5 shadow-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-ink leading-snug">{r.equipment?.name}</div>
                        <span className="text-[10px] uppercase tracking-wide font-medium text-muted shrink-0 mt-0.5">{r.type}</span>
                      </div>
                      <div className="text-xs text-muted mt-1.5">
                        Scheduled {fmtDate(r.scheduledDate)}
                        {r.assignedTechnician ? ` · ${r.assignedTechnician.fullName}` : ''}
                      </div>
                      {r.notes && <div className="text-xs text-muted mt-1.5 line-clamp-2">{r.notes}</div>}
                      <div className="mt-3">
                        {r.status === 'SCHEDULED' && (
                          <Button variant="ghost" size="sm" icon={PlayCircle} className="w-full justify-center" onClick={() => start(r.id)}>Start work</Button>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <Button variant="accent" size="sm" icon={CheckCircle2} className="w-full justify-center" onClick={() => complete(r.id)}>Mark complete</Button>
                        )}
                        {r.status === 'COMPLETED' && <Badge status="COMPLETED" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showNew && (
        <NewTaskModal equipment={equipment} onClose={() => setShowNew(false)} onDone={() => { setShowNew(false); load() }} />
      )}
    </div>
  )
}

function NewTaskModal({ equipment, onClose, onDone }) {
  const [form, setForm] = useState({ equipmentId: '', type: 'PREVENTIVE', scheduledDate: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const params = new URLSearchParams({ equipmentId: form.equipmentId, type: form.type, scheduledDate: form.scheduledDate, notes: form.notes })
      await client.post(`/maintenance?${params.toString()}`)
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule maintenance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Schedule maintenance task" subtitle="Adds a new card to the Scheduled column" onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Select label="Equipment" full value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
          <option value="">Select equipment…</option>
          {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </Select>
        <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="PREVENTIVE">Preventive</option>
          <option value="CORRECTIVE">Corrective</option>
          <option value="CALIBRATION">Calibration</option>
        </Select>
        <Input label="Scheduled date" type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
        <Textarea label="Notes" full rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <Button className="w-full justify-center mt-4" onClick={submit} disabled={loading} icon={Wrench}>
        {loading ? 'Scheduling…' : 'Schedule task'}
      </Button>
    </Modal>
  )
}
