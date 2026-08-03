import React, { useEffect, useState } from 'react'
import { TrendingUp, Boxes, CheckCircle2, Wrench, Clock, Activity, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

const MANAGER_ROLES = ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN']

export default function Dashboard() {
  const { user } = useAuth()
  const [myBookings, setMyBookings] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    client.get('/bookings/me').then(res => setMyBookings(res.data.data)).catch(() => {})

    if (MANAGER_ROLES.includes(user?.role) && user?.institutionId) {
      const to = new Date()
      const from = new Date(); from.setDate(from.getDate() - 30)
      client.get(`/analytics/institution/${user.institutionId}/dashboard`, {
        params: { from: from.toISOString(), to: to.toISOString() }
      }).then(res => setSummary(res.data.data)).catch(() => {})
    }
  }, [user])

  const today = new Date()
  const upcoming = myBookings.filter(b => new Date(b.startTime) >= new Date(today.toDateString()))

  return (
    <div>
      {/* Hero — asymmetric greeting instead of the generic PageHeader used elsewhere */}
      <div className="flex items-end justify-between mb-9 pb-6 border-b border-border">
        <div>
          <div className="text-xs mono text-muted uppercase tracking-wider mb-2">
            {today.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="font-display text-[28px] leading-tight font-bold text-ink">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted mt-1.5">{user?.role?.replaceAll('_', ' ')} · Nova Institute of Technology</p>
        </div>
        {summary && (
          <div className="text-right shrink-0 pl-8">
            <div className="text-xs text-muted mono uppercase tracking-wider mb-1">Org. utilization</div>
            <div className="font-display text-4xl font-bold text-accent leading-none">{summary.averageUtilizationPercent}%</div>
            <div className="text-xs text-muted mt-1">trailing 30 days</div>
          </div>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-5 gap-3 mb-10">
          <MiniStat icon={Boxes} label="Equipment" value={summary.totalEquipment} />
          <MiniStat icon={CheckCircle2} label="Available" value={summary.availableEquipment} tone="accent" />
          <MiniStat icon={Wrench} label="In maintenance" value={summary.underMaintenanceEquipment} tone="warn" />
          <MiniStat icon={Clock} label="Pending approval" value={summary.pendingBookings} />
          <MiniStat icon={Activity} label="Active right now" value={summary.activeBookings} tone="primary" />
        </div>
      )}

      {/* Agenda-style list instead of a plain divided card */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-[15px] font-semibold text-ink">Your schedule</h3>
        <a href="/bookings" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ArrowUpRight size={12} />
        </a>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={Clock} title="Nothing on your schedule" description="Head to the Equipment Catalog to reserve your first slot." />
      ) : (
        <div className="space-y-2">
          {upcoming.slice(0, 6).map(b => {
            const d = new Date(b.startTime)
            return (
              <div key={b.id} className="flex items-center gap-4 bg-surface border border-border rounded-card px-4 py-3 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary-light flex flex-col items-center justify-center shrink-0">
                  <div className="text-[10px] font-medium text-primary uppercase leading-none">{d.toLocaleDateString([], { month: 'short' })}</div>
                  <div className="font-display text-lg font-bold text-primary leading-none mt-0.5">{d.getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink">{b.equipment?.name}</div>
                  <div className="text-xs text-muted mt-0.5 mono">
                    {d.toLocaleTimeString([], { timeStyle: 'short' })} – {new Date(b.endTime).toLocaleTimeString([], { timeStyle: 'short' })}
                  </div>
                </div>
                <Badge status={b.status} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: 'text-ink bg-gray-100',
    accent: 'text-accent bg-accent-light',
    warn: 'text-warn bg-warn-light',
    primary: 'text-primary bg-primary-light',
  }
  return (
    <div className="flex items-center gap-3 border border-border rounded-card px-3.5 py-3 bg-surface">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="mono text-lg font-semibold text-ink leading-none">{value}</div>
        <div className="text-[11px] text-muted mt-1 truncate">{label}</div>
      </div>
    </div>
  )
}
