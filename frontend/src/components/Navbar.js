import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, Calendar, LayoutDashboard, Wrench, Shield, LogOut, 
  Building2, CheckCircle2, ShieldCheck, UserCheck, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-950 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-sm">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight block leading-none text-white">LabShare</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider">SECURE RBAC CORE</span>
          </div>
        </div>

        {/* Dynamic Role-Filtered Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          
          {/* 1. Everyone: Equipment Catalog */}
          <Link 
            to="/" 
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isActive('/') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}>
            <Cpu className="w-4 h-4" /> Equipment
          </Link>

          {/* 2. Everyone: Master Schedule */}
          <Link 
            to="/calendar" 
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isActive('/calendar') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}>
            <Calendar className="w-4 h-4" /> Schedule
          </Link>

          {/* 3. Lab Manager & Admin: Manager Portal */}
          {(user?.role === 'LAB_MANAGER' || user?.role === 'DEPARTMENT_HEAD' || user?.role === 'INSTITUTION_ADMIN') && (
            <Link 
              to="/manager" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive('/manager') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
              <LayoutDashboard className="w-4 h-4" /> Manager Portal
            </Link>
          )}

          {/* 4. Department HOD & Admin: HOD Governance Dashboard */}
          {(user?.role === 'DEPARTMENT_HEAD' || user?.role === 'INSTITUTION_ADMIN') && (
            <Link 
              to="/hod" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive('/hod') ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-400 hover:text-white hover:bg-slate-900'
              }`}>
              <Building2 className="w-4 h-4" /> HOD Dashboard
            </Link>
          )}

          {/* 5. Technician, Manager, HOD, Admin: Maintenance Suite */}
          {(user?.role === 'LAB_TECHNICIAN' || user?.role === 'LAB_MANAGER' || user?.role === 'DEPARTMENT_HEAD' || user?.role === 'INSTITUTION_ADMIN') && (
            <Link 
              to="/maintenance" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive('/maintenance') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
              <Wrench className="w-4 h-4" /> Maintenance
            </Link>
          )}

          {/* 6. Admin Only: Institutional Intelligence Console */}
          {user?.role === 'INSTITUTION_ADMIN' && (
            <Link 
              to="/admin" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive('/admin') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
              <Shield className="w-4 h-4 text-emerald-400" /> Admin Console
            </Link>
          )}
        </nav>

        {/* Verified Profile & Role Badge */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Account Switcher (For Evaluation & Demo) */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 transition">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified: {user?.role?.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs">
                <div className="p-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  Switch Verified Credentials
                </div>
                {[
                  { role: 'DEPARTMENT_HEAD', label: 'Department Head (HOD)', email: 'hod.biophysics@university.edu' },
                  { role: 'LAB_MANAGER', label: 'Facility Lab Manager', email: 'manager@university.edu' },
                  { role: 'LAB_TECHNICIAN', label: 'Calibration Technician', email: 'tech@university.edu' },
                  { role: 'INSTITUTION_ADMIN', label: 'Institutional Admin (Full Access)', email: 'admin@university.edu' },
                  { role: 'RESEARCHER', label: 'Researcher / Student', email: 'researcher@university.edu' },
                ].map(item => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchAccount(item.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition flex flex-col ${
                      user?.role === item.role ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}>
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">{item.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Avatar Info */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs font-bold text-white">{user?.fullName}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" title="Email Domain Verified" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">{user?.email}</span>
          </div>

          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-900 transition" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}