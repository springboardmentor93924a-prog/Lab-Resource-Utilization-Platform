import React, { useEffect, useState } from 'react'
import { Bell, BellOff, CalendarClock, Wrench, Share2, PackageCheck } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'

// Icon per notification "flavor" inferred from the title, so the feed reads
// like an inbox rather than a plain repeated list.
function iconFor(title = '') {
  if (/maint|calibrat/i.test(title)) return { icon: Wrench, tone: 'warn' }
  if (/shar/i.test(title)) return { icon: Share2, tone: 'primary' }
  if (/book|reserv|approv/i.test(title)) return { icon: CalendarClock, tone: 'accent' }
  return { icon: PackageCheck, tone: 'default' }
}

function dayLabel(d) {
  const date = new Date(d)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const sameDay = (a, b) => a.toDateString() === b.toDateString()
  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' })
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const load = () => client.get('/notifications').then(res => setItems(res.data.data))
  useEffect(() => { load() }, [])

  const markRead = (id) => client.patch(`/notifications/${id}/read`).then(load)

  const grouped = items
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .reduce((acc, n) => {
      const key = dayLabel(n.createdAt)
      acc[key] = acc[key] || []
      acc[key].push(n)
      return acc
    }, {})

  const toneMap = {
    default: 'bg-gray-100 text-gray-500',
    warn: 'bg-warn-light text-warn',
    primary: 'bg-primary-light text-primary',
    accent: 'bg-accent-light text-accent',
  }

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Booking confirmations, maintenance alerts, and sharing updates" />

      {items.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications yet" />
      ) : (
        <div className="max-w-2xl">
          {Object.entries(grouped).map(([day, group]) => (
            <div key={day} className="mb-8">
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{day}</div>
              <div className="relative pl-9">
                <div className="absolute left-[15px] top-1 bottom-1 w-px bg-border" />
                <div className="space-y-4">
                  {group.map(n => {
                    const { icon: Icon, tone } = iconFor(n.title)
                    return (
                      <div key={n.id} className="relative">
                        <div className={`absolute -left-9 w-7 h-7 rounded-full flex items-center justify-center ${toneMap[tone]} ring-4 ring-bg`}>
                          <Icon size={13} />
                        </div>
                        <div className={`rounded-card px-4 py-3 ${n.read ? 'bg-transparent' : 'bg-surface border border-border shadow-card'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className={`text-sm ${n.read ? 'text-muted' : 'text-ink font-medium'}`}>{n.title}</div>
                              <div className="text-sm text-muted mt-0.5">{n.message}</div>
                              <div className="text-xs text-gray-400 mt-1.5 mono">{new Date(n.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}</div>
                            </div>
                            {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-primary font-medium hover:underline shrink-0">Mark read</button>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
