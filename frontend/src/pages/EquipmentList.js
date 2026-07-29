import { Plus, Search } from 'lucide-react'

const equipment = [
  { name: 'Scanning Electron Microscope', code: 'SEM-101', lab: 'Materials Lab', status: 'Available' },
  { name: 'Gas Chromatograph', code: 'GC-204', lab: 'Chemistry Lab', status: 'Booked' },
  { name: 'High-Speed Centrifuge', code: 'CEN-312', lab: 'Biotech Lab', status: 'Maintenance' },
  { name: 'UV-Vis Spectrophotometer', code: 'UV-118', lab: 'Analytical Lab', status: 'Available' },
]

export default function EquipmentList() {
  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-black">Equipment</h2><p className="text-slate-500">Manage laboratory instruments and availability.</p></div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"><Plus size={18} /> Add Equipment</button>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"><Search size={18} className="text-slate-400" /><input className="w-full outline-none" placeholder="Search equipment by name, code or lab" /></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {equipment.map((item) => (
          <article key={item.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-5 h-36 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100" />
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{item.code}</p>
            <h3 className="mt-2 font-bold">{item.name}</h3><p className="mt-1 text-sm text-slate-500">{item.lab}</p>
            <div className="mt-5 flex items-center justify-between"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.status}</span><button className="text-sm font-bold text-blue-600">View details</button></div>
          </article>
        ))}
      </div>
    </section>
  )
}
