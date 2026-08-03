import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FileSpreadsheet, FileText, BarChart3 } from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

export default function Analytics() {
  const { user } = useAuth()
  const [heatmap, setHeatmap] = useState([])

  const from = new Date(); from.setDate(from.getDate() - 30)
  const to = new Date()

  useEffect(() => {
    if (!user?.institutionId) return
    client.get(`/analytics/institution/${user.institutionId}/heatmap`, {
      params: { from: from.toISOString(), to: to.toISOString() }
    }).then(res => setHeatmap(res.data.data)).catch(() => {})
  }, [user])

  const downloadReport = async (type) => {
    const res = await client.get(`/reports/utilization/${type}`, {
      params: { institutionId: user.institutionId, from: from.toISOString(), to: to.toISOString() },
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `utilization-report.${type === 'excel' ? 'xlsx' : 'pdf'}`
    a.click()
  }

  const ranked = [...heatmap].sort((a, b) => b.utilizationRatePercent - a.utilizationRatePercent)
  const maxRate = Math.max(...ranked.map(h => h.utilizationRatePercent), 1)

  return (
    <div>
      <PageHeader
        title="Utilization Analytics"
        subtitle="Equipment utilization over the last 30 days"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={() => downloadReport('excel')}>Export Excel</Button>
            <Button variant="ghost" size="sm" icon={FileText} onClick={() => downloadReport('pdf')}>Export PDF</Button>
          </div>
        }
      />

      {heatmap.length === 0 ? (
        <EmptyState icon={BarChart3} title="No utilization data yet" description="Data appears once bookings are checked in and completed." />
      ) : (
        <div className="grid grid-cols-5 gap-5">
          {/* Dark "instrument readout" panel — a deliberate contrast against the
              light cards used everywhere else in the app, reserved for data viz. */}
          <div className="col-span-3 bg-ink rounded-card p-5" style={{ height: 380 }}>
            <div className="text-xs mono text-white/40 uppercase tracking-wider mb-1">Utilization rate by instrument</div>
            <div className="text-white/80 text-sm font-medium mb-4">30-day trailing window</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={heatmap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232B35" vertical={false} />
                <XAxis dataKey="equipmentName" tick={{ fontSize: 10, fill: '#8B95A1' }} axisLine={{ stroke: '#232B35' }} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#8B95A1' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#161C24', borderRadius: 8, border: '1px solid #232B35', fontSize: 12, color: '#fff' }} />
                <Bar dataKey="utilizationRatePercent" fill="#2FA6A2" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked leaderboard instead of a repeated stat-card grid */}
          <div className="col-span-2 bg-surface border border-border rounded-card p-5">
            <div className="text-xs mono text-muted uppercase tracking-wider mb-4">Leaderboard</div>
            <div className="space-y-3.5">
              {ranked.map((h, i) => (
                <div key={h.equipmentId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="mono text-xs text-muted w-4 shrink-0">{i + 1}</span>
                      <span className="text-ink font-medium truncate">{h.equipmentName}</span>
                    </span>
                    <span className="mono text-xs font-semibold text-ink shrink-0">{h.utilizationRatePercent}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-6">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${(h.utilizationRatePercent / maxRate) * 100}%` }} />
                  </div>
                  <div className="text-[11px] text-muted ml-6 mt-1">{h.totalBookings} bookings · {h.noShowBookings} no-shows</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
