import { Link } from 'react-router-dom'
export default function NotFound() {
  return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><p className="text-7xl font-black text-blue-600">404</p><h1 className="mt-3 text-2xl font-bold">Page not found</h1><Link to="/dashboard" className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">Go to dashboard</Link></div></div>
}
