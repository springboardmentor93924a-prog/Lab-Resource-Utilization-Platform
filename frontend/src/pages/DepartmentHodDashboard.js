import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, Legend
} from 'recharts';
import { 
  GraduationCap, DollarSign, Users, Activity, ShieldCheck, 
  Clock, AlertTriangle, CheckCircle2, ArrowUpRight, TrendingUp, 
  FileText, Sliders, Check, X, Sparkles, Download, Building2,
  BookOpen, Eye, Award, CheckSquare, Layers, HelpCircle
} from 'lucide-react';

const DEPARTMENT_DATA = {
  Biophysics: {
    budgetTotal: 85000,
    budgetSpent: 64200,
    revenueRecovered: 31175,
    activeFaculty: 28,
    uptime: '99.1%',
    publications: 14,
    chart: [
      { month: 'Apr', internalHours: 240, costRecovered: 4200 },
      { month: 'May', internalHours: 290, costRecovered: 5525 },
      { month: 'Jun', internalHours: 320, costRecovered: 5850 },
      { month: 'Jul', internalHours: 360, costRecovered: 7150 },
      { month: 'Aug', internalHours: 410, costRecovered: 8450 },
    ],
    faculty: [
      { id: 1, name: 'Dr. Alan Turing', role: 'Associate Professor', group: 'Quantum Nanobio Lab', activeGrant: 'NIH-R01-EB0299', grantTotal: 250000, hoursBooked: 84, grantSpend: 3780, status: 'VERIFIED' },
      { id: 2, name: 'Dr. Sarah Connor', role: 'Principal Investigator', group: 'Stem Cell Dynamics', activeGrant: 'NSF-DMR-2026-4091', grantTotal: 180000, hoursBooked: 62, grantSpend: 2790, status: 'VERIFIED' },
      { id: 3, name: 'Prof. Marie Curie', role: 'Department Chair', group: 'Structural Molecular Core', activeGrant: 'DOE-SC-8812', grantTotal: 500000, hoursBooked: 110, grantSpend: 8800, status: 'VERIFIED' },
      { id: 4, name: 'Alex Rivera', role: 'Senior Postdoc Fellow', group: 'Optical Biophotonics', activeGrant: 'DARPA-BIO-2026', grantTotal: 95000, hoursBooked: 45, grantSpend: 2025, status: 'FLAGGED_EXCEEDED' },
    ],
    fleet: [
      { name: 'Laser Confocal Microscope', room: 'Bldg 68, Room 312', load: 84, status: 'AVAILABLE' },
      { name: 'Abberior STED Microscope', room: 'Neuro Center 102', load: 78, status: 'AVAILABLE' },
      { name: 'Preparative Ultracentrifuge', room: 'Biochem Basement 015', load: 45, status: 'AVAILABLE' }
    ]
  },
  Chemistry: {
    budgetTotal: 120000,
    budgetSpent: 92400,
    revenueRecovered: 42800,
    activeFaculty: 34,
    uptime: '98.6%',
    publications: 19,
    chart: [
      { month: 'Apr', internalHours: 310, costRecovered: 5800 },
      { month: 'May', internalHours: 350, costRecovered: 6900 },
      { month: 'Jun', internalHours: 380, costRecovered: 7400 },
      { month: 'Jul', internalHours: 420, costRecovered: 8900 },
      { month: 'Aug', internalHours: 460, costRecovered: 9800 },
    ],
    faculty: [
      { id: 101, name: 'Prof. Marie Curie', role: 'Chair of Chemistry', group: 'Radiochemistry & Polymers', activeGrant: 'NSF-CHE-8821', grantTotal: 420000, hoursBooked: 125, grantSpend: 10000, status: 'VERIFIED' },
      { id: 102, name: 'Dr. Marcus Vance', role: 'Assistant Professor', group: 'Spectroscopy Analysis', activeGrant: 'NIH-R21-GM110', grantTotal: 150000, hoursBooked: 74, grantSpend: 5920, status: 'VERIFIED' },
    ],
    fleet: [
      { name: '500MHz NMR Spectrometer', room: 'Mallinckrodt B-04', load: 92, status: 'AVAILABLE' },
      { name: 'MALDI-TOF Mass Spectrometer', room: 'Beckman Center 120', load: 68, status: 'AVAILABLE' },
      { name: 'Waters ACQUITY Ultra-HPLC', room: 'Pharmacy Hall 308', load: 55, status: 'AVAILABLE' }
    ]
  },
  'Structural Bio': {
    budgetTotal: 210000,
    budgetSpent: 165000,
    revenueRecovered: 78500,
    activeFaculty: 22,
    uptime: '96.2%',
    publications: 24,
    chart: [
      { month: 'Apr', internalHours: 190, costRecovered: 9500 },
      { month: 'May', internalHours: 240, costRecovered: 12400 },
      { month: 'Jun', internalHours: 280, costRecovered: 14200 },
      { month: 'Jul', internalHours: 310, costRecovered: 18500 },
      { month: 'Aug', internalHours: 350, costRecovered: 23900 },
    ],
    faculty: [
      { id: 201, name: 'Dr. Sarah Connor', role: 'Lead Structural Biologist', group: 'Membrane Cryo-EM Lab', activeGrant: 'NIH-U01-AI990', grantTotal: 750000, hoursBooked: 140, grantSpend: 21000, status: 'VERIFIED' },
      { id: 202, name: 'Dr. Chen Wei', role: 'Visiting Scholar', group: 'Single-Particle Reconstructions', activeGrant: 'HHMI-INVEST-26', grantTotal: 300000, hoursBooked: 85, grantSpend: 12750, status: 'VERIFIED' },
    ],
    fleet: [
      { name: 'Titan Krios Cryo-EM 300kV', room: 'Cryo-EM Suite 08', load: 96, status: 'MAINTENANCE_LOCK' },
      { name: 'Rigaku SmartLab 9kW XRD', room: 'Materials Lab B-12', load: 62, status: 'AVAILABLE' }
    ]
  }
};

export default function DepartmentHodDashboard() {
  const { user } = useAuth();
  const [selectedDeptKey, setSelectedDeptKey] = useState('Biophysics');
  const currentDept = DEPARTMENT_DATA[selectedDeptKey] || DEPARTMENT_DATA['Biophysics'];

  // Modals & Drawers
  const [inspectLedgerModal, setInspectLedgerModal] = useState(null);
  const [highCostQueue, setHighCostQueue] = useState([
    { id: 301, researcher: 'Alex Rivera', instrument: 'Titan Krios Cryo-EM', hours: '6 hrs session', cost: 900, grant: 'DARPA-BIO-2026', justification: 'Urgent membrane protein single-particle dataset before submission.' },
    { id: 302, researcher: 'Dr. Alan Turing', instrument: 'NovaSeq 6000 Sequencer', hours: '5 hrs run', cost: 600, grant: 'NIH-R01-EB0299', justification: 'Dual flow-cell whole transcriptome sequencing validation.' }
  ]);

  // Policy Toggles
  const [policies, setPolicies] = useState({
    maxStudentHoursPerWeek: 15,
    autoNoShowPenalty: true,
    interDeptSharingAllowed: true,
    requireHodGrantSignoff: true
  });

  const handleApproveHighCost = (id) => {
    setHighCostQueue(highCostQueue.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 1. Header & Department Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg">
              Academic Department Governance
            </span>
            <span className="text-xs font-mono text-slate-400">Fiscal Year 2026–2027</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" /> Department Head Executive Cockpit
          </h1>
          <p className="text-xs text-slate-500">
            Governing departmental grant spending, machine uptime benchmarks, student quota enforcement, and research output
          </p>
        </div>

        {/* Dynamic Department Selector */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedDeptKey} 
            onChange={e => setSelectedDeptKey(e.target.value)}
            className="text-xs font-black bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="Biophysics">Department of Biophysics</option>
            <option value="Chemistry">Department of Chemistry</option>
            <option value="Structural Bio">Structural Biology Core</option>
          </select>
        </div>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Grant Budget Spend</span>
          <h3 className="text-2xl font-black text-slate-900">${currentDept.budgetSpent.toLocaleString()}</h3>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> ${((currentDept.budgetSpent / currentDept.budgetTotal) * 100).toFixed(0)}% of Allocated Budget
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Inter-Lab Revenue Recovered</span>
          <h3 className="text-2xl font-black text-emerald-700">${currentDept.revenueRecovered.toLocaleString()}</h3>
          <span className="text-[11px] font-bold text-slate-500">From External Academic Partners</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl w-fit">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Department Researchers</span>
          <h3 className="text-2xl font-black text-slate-900">{currentDept.activeFaculty} Active PIs</h3>
          <span className="text-[11px] font-bold text-purple-600">{currentDept.publications} Papers Published FY26</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Department Fleet Uptime</span>
          <h3 className="text-2xl font-black text-slate-900">{currentDept.uptime}</h3>
          <span className="text-[11px] font-bold text-amber-600">0 Compliance Violations</span>
        </div>
      </div>

      {/* 3. PROPER DUAL-AXIS RECHARTS GRAPH */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900">Department Machine Load (Hours) vs External Cost Recovery ($)</h3>
            <p className="text-xs text-slate-500">Dual-axis metric tracking usage intensity against revenue generated</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-indigo-700"><span className="w-3 h-3 bg-indigo-600 rounded"></span> Machine Hours (Left Axis)</span>
            <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Revenue ($) (Right Axis)</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentDept.chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              
              {/* Left Y-Axis for Hours */}
              <YAxis yAxisId="left" orientation="left" stroke="#6366F1" label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6366F1' }} />
              
              {/* Right Y-Axis for Revenue */}
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight', fill: '#10B981' }} />
              
              <Tooltip formatter={(value, name) => name === 'Revenue Recovered' ? `$${value}` : `${value} hrs`} />
              <Legend />

              <Bar yAxisId="right" dataKey="costRecovered" fill="#10B981" name="Revenue Recovered" radius={[8, 8, 0, 0]} barSize={40} />
              <Line yAxisId="left" type="monotone" dataKey="internalHours" stroke="#4F46E5" strokeWidth={3} name="Machine Hours" dot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. HOD High-Cost Grant Authorization Queue */}
      {highCostQueue.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider">
                HOD Required Sign-Offs (Bookings Over $500)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800">{highCostQueue.length} Approvals Pending</span>
          </div>

          <div className="divide-y divide-slate-100">
            {highCostQueue.map(item => (
              <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.researcher}</span>
                    <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">{item.grant}</span>
                    <span className="text-xs font-semibold text-slate-500">&bull; {item.instrument}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.justification}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-emerald-700 text-lg">${item.cost}</span>
                  <button 
                    onClick={() => handleApproveHighCost(item.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Sign-off Grant Debit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Faculty & Researcher Usage Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {selectedDeptKey} Faculty & Principal Investigator (PI) Grant Burndown
            </h3>
            <p className="text-xs text-slate-400">Departmental machine allocations and grant budget debits</p>
          </div>
          <a
            href="http://localhost:8080/api/reports/export/billing-csv"
            download
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Grant Audit CSV
          </a>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="p-4">Faculty / Researcher</th>
              <th className="p-4">Research Group</th>
              <th className="p-4">Active Grant ID</th>
              <th className="p-4">Hours Booked</th>
              <th className="p-4">Grant Spend Total</th>
              <th className="p-4">Policy Compliance</th>
              <th className="p-4 text-right">Ledger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentDept.faculty.map(faculty => (
              <tr key={faculty.id} className="hover:bg-slate-50/80 transition">
                <td className="p-4">
                  <span className="font-bold text-slate-900 block">{faculty.name}</span>
                  <span className="text-xs text-slate-400">{faculty.role}</span>
                </td>
                <td className="p-4 text-xs font-semibold text-slate-700">{faculty.group}</td>
                <td className="p-4 font-mono text-xs text-indigo-700 font-bold">{faculty.activeGrant}</td>
                <td className="p-4 font-mono text-xs font-bold text-slate-800">{faculty.hoursBooked} hrs</td>
                <td className="p-4 font-mono font-black text-emerald-700 text-base">${faculty.grantSpend.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    faculty.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                  }`}>
                    {faculty.status === 'VERIFIED' ? '✓ Grant Verified' : '⚠️ Quota Exceeded'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setInspectLedgerModal(faculty)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 ml-auto">
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Department Governance & Policy Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-black text-slate-900">Department Governance & Fair Usage Policies</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Student Max Hours / Week</span>
            <input 
              type="number" 
              value={policies.maxStudentHoursPerWeek}
              onChange={e => setPolicies({...policies, maxStudentHoursPerWeek: e.target.value})}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400 block">Auto-enforces fair student sharing</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Auto No-Show Penalty</span>
              <span className="text-[10px] text-slate-400">Lock slot if 30m late</span>
            </div>
            <input 
              type="checkbox" 
              checked={policies.autoNoShowPenalty}
              onChange={e => setPolicies({...policies, autoNoShowPenalty: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Inter-Lab Sharing Allowed</span>
              <span className="text-[10px] text-slate-400">Permit external universities</span>
            </div>
            <input 
              type="checkbox" 
              checked={policies.interDeptSharingAllowed}
              onChange={e => setPolicies({...policies, interDeptSharingAllowed: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Require HOD Sign-off</span>
              <span className="text-[10px] text-slate-400">For bookings over $500</span>
            </div>
            <input 
              type="checkbox" 
              checked={policies.requireHodGrantSignoff}
              onChange={e => setPolicies({...policies, requireHodGrantSignoff: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* MODAL: PI GRANT LEDGER STATEMENT */}
      {inspectLedgerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                  PI Grant Financial Ledger
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{inspectLedgerModal.name}</h2>
                <p className="text-xs text-slate-400 font-mono">Grant ID: {inspectLedgerModal.activeGrant}</p>
              </div>
              <button onClick={() => setInspectLedgerModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-slate-50 border rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Grant</span>
                  <span className="font-black text-slate-900">${inspectLedgerModal.grantTotal.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                  <span className="text-[10px] text-rose-600 font-bold uppercase block">Total Spent</span>
                  <span className="font-black text-rose-900">${inspectLedgerModal.grantSpend.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Remaining</span>
                  <span className="font-black text-emerald-900">${(inspectLedgerModal.grantTotal - inspectLedgerModal.grantSpend).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Recent Machine Billing Debits</span>
                <div className="space-y-1 text-slate-700">
                  <p className="flex justify-between"><span>Laser Confocal Microscope (12 hrs):</span> <strong>$540.00</strong></p>
                  <p className="flex justify-between"><span>500MHz NMR Spectrometer (18 hrs):</span> <strong>$1,440.00</strong></p>
                  <p className="flex justify-between"><span>Airyscan Consumables & Slides:</span> <strong>$180.00</strong></p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setInspectLedgerModal(null)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}