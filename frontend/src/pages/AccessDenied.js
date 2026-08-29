import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, MailCheck } from 'lucide-react';

export default function AccessDenied() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl font-black text-slate-900 pt-2">Access Restricted by Role Policy</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current verified account (<strong>{user?.email}</strong>) has the role of <strong>{user?.role}</strong>, which does not have authorization for this governance module.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 font-mono space-y-1 text-left">
          <p className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> Required: <strong>HOD / ADMIN Clearance</strong></p>
          <p className="flex items-center gap-1.5"><MailCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified: <strong>{user?.department}</strong></p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Return to Equipment Catalog
          </button>
        </div>
      </div>
    </div>
  );
}