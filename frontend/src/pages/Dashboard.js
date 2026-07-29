import { Activity, CalendarCheck, FlaskConical, Wrench } from 'lucide-react'

const stats = [
  { label: 'Total Equipment', value: '128', detail: '+8 this month', icon: FlaskConical },
  { label: 'Active Bookings', value: '24', detail: '6 today', icon: CalendarCheck },
  { label: 'Utilization Rate', value: '78%', detail: '+5.4% vs last month', icon: Activity },
  { label: 'Under Maintenance', value: '7', detail: '3 due this week', icon: Wrench },
]

const bookings = [
  ['Scanning Electron Microscope', 'Materials Lab', '10:00 AM', 'Approved'],
  ['UV-Vis Spectrophotometer', 'Chemistry Lab', '12:30 PM', 'Pending'],
  ['High-Speed Centrifuge', 'Biotech Lab', '03:00 PM', 'Approved'],
]

export default function Dashboard() {
  return (
    <section>
      <div className="mb-7">
        <h2 className="text-2xl font-black">Dashboard Overview</h2>
        <p className="mt-1 text-slate-500">Monitor equipment, bookings and lab performance.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={22} /></div>
            </div>
            <p className="mt-4 text-xs font-medium text-emerald-600">{detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between"><h3 className="font-bold">Today’s Bookings</h3><button className="text-sm font-semibold text-blue-600">View all</button></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500"><tr><th className="pb-3">Equipment</th><th>Lab</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>{bookings.map((row) => <tr key={row[0]} className="border-b border-slate-100 last:border-0">{row.map((cell, i) => <td key={cell} className={`py-4 ${i === 0 ? 'font-semibold' : 'text-slate-600'}`}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </article>
        <article className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 p-6 text-white shadow-card">
          <p className="text-sm text-blue-100">Monthly utilization</p>
          <p className="mt-2 text-5xl font-black">78%</p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[78%] rounded-full bg-white" /></div>
          <p className="mt-5 text-sm text-blue-100">Target utilization rate: 85%</p>
        </article>
      </div>
    </section>
  )
}
