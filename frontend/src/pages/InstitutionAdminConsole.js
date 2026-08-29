import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { 
  DollarSign, Activity, Users, Download, ShieldCheck, ArrowUpRight, 
  TrendingUp, Sparkles, Building2, FileSpreadsheet, CreditCard, Award, 
  Layers, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Shield, 
  Search, Plus, Eye, Check, X, RefreshCw
} from 'lucide-react';

const INITIAL_ANALYTICS_DATA = [
  { department: 'Biophysics Core', activeHours: 420, chargeback: 27300, utilization: '84%' },
  { department: 'Chemistry Hub', activeHours: 360, chargeback: 23400, utilization: '92%' },
  { department: 'Structural Bio', activeHours: 290, chargeback: 18850, utilization: '96%' },
  { department: 'Proteomics Lab', activeHours: 310, chargeback: 20150, utilization: '68%' },
  { department: 'Immunology Core', activeHours: 240, chargeback: 15600, utilization: '75%' },
  { department: 'Materials Science', activeHours: 190, chargeback: 13300, utilization: '62%' }
];

const INTER_UNI_INVOICES = [
  { id: 'INV-2026-089', creditor: 'MIT Central Labs', debtor: 'Harvard Core Facilities', hours: 142, amount: 18460, period: 'Q2 2026', status: 'SETTLED', grant: 'NIH-R01-EB0299' },
  { id: 'INV-2026-090', creditor: 'Harvard Core Facilities', debtor: 'MIT Central Labs', hours: 88, amount: 11440, period: 'Q2 2026', status: 'PENDING_WIRE', grant: 'NSF-CHE-8821' },
  { id: 'INV-2026-091', creditor: 'MIT Central Labs', debtor: 'Stanford BioHub', hours: 112, amount: 14560, period: 'Q2 2026', status: 'SETTLED', grant: 'STAN-BIO-89' },
  { id: 'INV-2026-092', creditor: 'Stanford BioHub', debtor: 'MIT Central Labs', hours: 64, amount: 8320, period: 'Q2 2026', status: 'PENDING_WIRE', grant: 'DOE-SC-8812' },
];

const FLEET_ROI_DATA = [
  { name: 'Titan Krios Cryo-EM 300kV', capex: 3200000, opex: 142000, revenue: 640000, roi: '+15.5%', status: 'HIGH_DEMAND_CAPITAL' },
  { name: 'NovaSeq 6000 Sequencer', capex: 950000, opex: 68000, revenue: 380000, roi: '+32.8%', status: 'PROFITABLE_CORE' },
  { name: '500MHz NMR Spectrometer', capex: 650000, opex: 32000, revenue: 260000, roi: '+35.1%', status: 'PROFITABLE_CORE' },
  { name: 'Laser Confocal Microscope', capex: 420000, opex: 18000, revenue: 195000, roi: '+42.1%', status: 'HIGH_YIELD' },
  { name: 'MALDI-TOF Mass Spectrometer', capex: 380000, opex: 22000, revenue: 145000, roi: '+32.4%', status: 'STABLE' },
  { name: 'Dimension Icon AFM', capex: 310000, opex: 14000, revenue: 98000, roi: '+27.1%', status: 'STABLE' },
];

export default function InstitutionAdminConsole() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'billing' | 'roi' | 'users'
  const [analyticsData, setAnalyticsData] = useState(INITIAL_ANALYTICS_DATA);
  const [invoices, setInvoices] = useState(INTER_UNI_INVOICES);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  // New Invoice Form
  const [newInvoice, setNewInvoice] = useState({
    debtor: 'Harvard Core Facilities',
    hours: 40,
    amount: 5200,
    grant: 'NIH-NEW-GRANT-2026'
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const created = {
      id: `INV-2026-0${Math.floor(Math.random() * 89 + 10)}`,
      creditor: 'MIT Central Labs',
      debtor: newInvoice.debtor,
      hours: parseInt(newInvoice.hours),
      amount: parseInt(newInvoice.amount),
      period: 'Q3 2026 (Live)',
      status: 'PENDING_WIRE',
      grant: newInvoice.grant
    };
    setInvoices([created, ...invoices]);
    setShowNewInvoiceModal(false);
  };

  const markInvoiceSettled = (id) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'SETTLED' } : inv));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 1. Executive Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
              Institutional Leadership Console
            </span>
            <span className="text-xs font-mono text-slate-400">Academic FY 2026 Active</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-600" /> Institutional Intelligence & Financial Chargeback
          </h1>
          <p className="text-sm text-slate-500">
            Cross-university resource sharing reconciliation, fleet lifecycle ROI tracking, and strategic procurement intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewInvoiceModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> Issue Inter-Lab Invoice
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl w-fit"><DollarSign className="w-5 h-5" /></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cost Recovery</p>
          <h3 className="text-3xl font-black text-slate-900">$105,300</h3>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% Net Margin vs Q1
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-800 rounded-2xl w-fit"><Activity className="w-5 h-5" /></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Fleet Utilization</p>
          <h3 className="text-3xl font-black text-slate-900">78.6%</h3>
          <span className="text-[11px] font-bold text-indigo-600">Optimal Load Efficiency</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-purple-50 text-purple-800 rounded-2xl w-fit"><Users className="w-5 h-5" /></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Partner Shared Slots</p>
          <h3 className="text-3xl font-black text-slate-900">342</h3>
          <span className="text-[11px] font-bold text-purple-600">3 University Partners</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl w-fit"><ShieldCheck className="w-5 h-5" /></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compliance Uptime</p>
          <h3 className="text-3xl font-black text-slate-900">99.2%</h3>
          <span className="text-[11px] font-bold text-amber-600">12/12 NIST Standards</span>
        </div>
      </div>

      {/* 3. Navigation View Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Activity className="w-4 h-4" /> Utilization & Revenue Intelligence
        </button>

        <button 
          onClick={() => setActiveTab('billing')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'billing' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <CreditCard className="w-4 h-4" /> Inter-University Invoicing Ledger ({invoices.length})
        </button>

        <button 
          onClick={() => setActiveTab('roi')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'roi' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Award className="w-4 h-4" /> Fleet Capital ROI & Amortization
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PROPORTIONAL DUAL-AXIS RECHARTS GRAPH */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Dual-Axis Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900">Departmental Machine Load (Hours) vs Cost Recovered ($)</h3>
                <p className="text-xs text-slate-500">Proportional dual-axis scaling: Left Y-Axis = Machine Hours, Right Y-Axis = Revenue ($)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-indigo-700"><span className="w-3 h-3 bg-indigo-600 rounded"></span> Booked Hours (Left)</span>
                <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Revenue Recovered (Right)</span>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" />
                  
                  {/* Left Axis for Hours */}
                  <YAxis yAxisId="left" orientation="left" stroke="#6366F1" label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6366F1' }} />
                  
                  {/* Right Axis for Revenue */}
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight', fill: '#10B981' }} />
                  
                  <Tooltip formatter={(value, name) => name === 'Revenue Recovered' ? `$${value.toLocaleString()}` : `${value} hrs`} />
                  <Legend />

                  <Bar yAxisId="right" dataKey="chargeback" fill="#10B981" name="Revenue Recovered" radius={[8, 8, 0, 0]} barSize={42} />
                  <Line yAxisId="left" type="monotone" dataKey="activeHours" stroke="#4F46E5" strokeWidth={3} name="Booked Hours" dot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategic AI Procurement Recommendations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">Executive Capacity & Procurement Directives</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">High Demand Bottleneck: 500MHz NMR</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Operating at <strong>92% capacity</strong> for 6 consecutive weeks. Recommended: Acquire secondary autosampler robotic carousel or extend evening shift hours to clear waitlists.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Inter-University Partnership Revenue</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cross-institutional agreements with Harvard Core and Stanford BioHub generated <strong>$44,460 in net cost recovery</strong> during Q2 with zero internal schedule collisions.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INTER-UNIVERSITY INVOICING & SETTLEMENT LEDGER */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Inter-Institution Invoicing & Wire Settlement</h3>
              <p className="text-xs text-slate-400">Quarterly reconciliation of cross-university machine usage</p>
            </div>
            <a
              href="http://localhost:8080/api/reports/export/billing-csv"
              download
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export Invoicing Ledger CSV
            </a>
          </div>

          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Creditor Institution</th>
                <th className="p-4">Debtor Institution</th>
                <th className="p-4">Shared Hours</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Wire Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {inv.id}
                    <span className="text-[10px] text-slate-400 font-normal block">{inv.period}</span>
                  </td>
                  <td className="p-4 text-xs font-bold text-indigo-950">{inv.creditor}</td>
                  <td className="p-4 text-xs font-bold text-slate-700">{inv.debtor}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">{inv.hours} hrs</td>
                  <td className="p-4 font-mono font-black text-emerald-700 text-base">${inv.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      inv.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {inv.status === 'SETTLED' ? '✓ Settled' : '⏳ Pending Wire'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {inv.status !== 'SETTLED' ? (
                      <button 
                        onClick={() => markInvoiceSettled(inv.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm">
                        Confirm Wire
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono font-bold">Reconciled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: FLEET CAPITAL ROI & AMORTIZATION */}
      {activeTab === 'roi' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Fleet Capital Acquisition vs Revenue ROI</h3>
              <p className="text-xs text-slate-400">Amortization recovery against initial capital expenditure</p>
            </div>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-xl">
              10-Year Lifecycle Model
            </span>
          </div>

          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Instrument Fleet Unit</th>
                <th className="p-4">Acquisition Capex</th>
                <th className="p-4">Annual Opex/Service</th>
                <th className="p-4">Recovered Revenue</th>
                <th className="p-4">Net Financial ROI</th>
                <th className="p-4 text-right">Asset Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FLEET_ROI_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900">{row.name}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">${row.capex.toLocaleString()}</td>
                  <td className="p-4 font-mono text-xs text-rose-600">-${row.opex.toLocaleString()}/yr</td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-xs">+${row.revenue.toLocaleString()}</td>
                  <td className="p-4 font-mono font-black text-indigo-700 text-sm">{row.roi}</td>
                  <td className="p-4 text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Official Reports & Export Center */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Official Institutional Report Downloads</h3>
          <p className="text-xs text-slate-500">Download formatted usage, cost recovery, and downtime data for academic accreditation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <a 
            href="http://localhost:8080/api/reports/export/utilization-csv" 
            download
            className="p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between group">
            <div>
              <p className="text-xs font-black text-slate-900">Equipment Fleet Utilization</p>
              <p className="text-[11px] text-slate-400">Capacity, rates & department allocations</p>
            </div>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> CSV
            </span>
          </a>

          <a 
            href="http://localhost:8080/api/reports/export/billing-csv" 
            download
            className="p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between group">
            <div>
              <p className="text-xs font-black text-slate-900">Inter-Lab Billing & Chargeback</p>
              <p className="text-[11px] text-slate-400">Institutional invoicing & revenue</p>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> CSV
            </span>
          </a>

          <a 
            href="http://localhost:8080/api/reports/export/maintenance-csv" 
            download
            className="p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between group">
            <div>
              <p className="text-xs font-black text-slate-900">Maintenance & Downtime Audit</p>
              <p className="text-[11px] text-slate-400">Technician service history</p>
            </div>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> CSV
            </span>
          </a>
        </div>
      </div>

      {/* MODAL: ISSUE NEW INTER-LAB INVOICE */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-lg font-black text-slate-900">Issue Inter-Lab Wire Invoice</h2>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Debtor Partner University</label>
                <select 
                  className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                  value={newInvoice.debtor}
                  onChange={e => setNewInvoice({...newInvoice, debtor: e.target.value})}>
                  <option value="Harvard Core Facilities">Harvard Core Facilities</option>
                  <option value="Stanford BioHub">Stanford BioHub</option>
                  <option value="MIT Central Labs">MIT Central Labs</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shared Machine Hours</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full border rounded-xl p-2.5 text-xs font-mono" 
                    value={newInvoice.hours}
                    onChange={e => setNewInvoice({...newInvoice, hours: e.target.value, amount: e.target.value * 130})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Billable ($)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full border rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-700" 
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">PI Research Grant Code</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border rounded-xl p-2.5 text-xs font-mono uppercase" 
                  value={newInvoice.grant}
                  onChange={e => setNewInvoice({...newInvoice, grant: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewInvoiceModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
                  Dispatch Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}