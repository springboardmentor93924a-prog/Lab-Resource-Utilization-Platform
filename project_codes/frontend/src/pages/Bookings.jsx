import React, { useEffect, useState } from 'react'
import { CalendarClock, CheckCircle2, XCircle, LogIn, LogOut } from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

const approverRoles = ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN']

function fmtTime(d) { return new Date(d).toLocaleTimeString([], { timeStyle: 'short' }) }
function dayLabel(d) {
  const date = new Date(d)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const sameDay = (a, b) => a.toDateString() === b.toDateString()
  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function Bookings() {
  const { user } = useAuth()
  const [mine, setMine] = useState([])
  const [pending, setPending] = useState([])
  const isApprover = approverRoles.includes(user?.role)

  const load = () => {
    client.get('/bookings/me').then(res => setMine(res.data.data))
    if (isApprover) client.get('/bookings', { params: { status: 'PENDING_APPROVAL' } }).then(res => setPending(res.data.data))
  }
  useEffect(() => { load() }, [])

  const act = async (id, action) => { await client.patch(`/bookings/${id}/${action}`); load() }

  // Group "my bookings" by calendar day for a timeline/agenda feel
  const grouped = mine
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .reduce((acc, b) => {
      const key = new Date(b.startTime).toDateString()
      acc[key] = acc[key] || []
      acc[key].push(b)
      return acc
    }, {})

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Track requests, approvals, and equipment check-in/out" />

      {isApprover && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-[15px] font-semibold">Pending your approval</h3>
            {pending.length > 0 && <span className="text-xs bg-warn-light text-warn font-medium px-2 py-0.5 rounded-full">{pending.length}</span>}
          </div>
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All caught up" description="Nothing is waiting on your approval right now." />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {pending.map(b => (
                <div key={b.id} className="min-w-[280px] bg-surface border border-warn/30 rounded-card p-4 shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-warn" />
                  <div className="text-sm font-medium text-ink pl-2">{b.equipment?.name}</div>
                  <div className="text-xs text-muted mt-0.5 pl-2">requested by {b.requestedBy?.fullName}</div>
                  <div className="text-xs text-muted mt-2 mono pl-2">{fmtTime(b.startTime)} – {fmtTime(b.endTime)} · {dayLabel(b.startTime)}</div>
                  {b.purpose && <div className="text-xs text-muted mt-1.5 pl-2 italic">"{b.purpose}"</div>}
                  <div className="flex gap-2 mt-3 pl-2">
                    <Button variant="accent" size="sm" icon={CheckCircle2} onClick={() => act(b.id, 'approve')}>Approve</Button>
                    <Button variant="danger" size="sm" icon={XCircle} onClick={() => act(b.id, 'reject')}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <h3 className="font-display text-[15px] font-semibold mb-4">Your schedule</h3>
      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon={CalendarClock} title="No bookings yet" description="Reserve equipment from the catalog to see it here." />
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
          {Object.entries(grouped).map(([dayKey, items]) => (
            <div key={dayKey} className="mb-7 relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary border-4 border-bg" />
              <div className="text-xs font-semibold text-ink uppercase tracking-wide mb-2.5">{dayLabel(items[0].startTime)}</div>
              <div className="space-y-2">
                {items.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-surface border border-border rounded-card px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-ink">{b.equipment?.name}</div>
                      <div className="text-xs text-muted mt-0.5 mono">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge status={b.status} />
                      {b.status === 'CONFIRMED' && <Button variant="ghost" size="sm" icon={LogIn} onClick={() => act(b.id, 'check-in')}>Check in</Button>}
                      {b.status === 'IN_USE' && <Button variant="ghost" size="sm" icon={LogOut} onClick={() => act(b.id, 'check-out')}>Check out</Button>}
                      {['PENDING_APPROVAL', 'CONFIRMED'].includes(b.status) && (
                        <button onClick={() => act(b.id, 'cancel')} className="text-xs text-danger hover:underline">Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
