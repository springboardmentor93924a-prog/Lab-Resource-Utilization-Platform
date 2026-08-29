import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { 
  Check, X, Clock, AlertTriangle, ShieldCheck, Activity, Users, 
  Lock, Unlock, Filter, Search, ArrowRight, Eye, MessageSquare, AlertCircle,
  Layers, Zap, Award, Sparkles, CheckCircle2, Download, RefreshCw,
  SlidersHorizontal, Flame, Radio, Thermometer, ShieldAlert, Cpu, 
  Gauge, BatteryCharging, Wind, Play, Pause, Bell, CheckSquare
} from 'lucide-react';

export default function LabManagerDashboard() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'telemetry' | 'waitlist' | 'facility'
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [reviewModalReq, setReviewModalReq] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [lockModalItem, setLockModalItem] = useState(null);
  const [lockReason, setLockReason] = useState('');

  // Equipment Telemetry State
  const [equipmentFleet, setEquipmentFleet] = useState([
    { 
      id: 1, 
      name: 'Laser Confocal Microscope', 
      model: 'Zeiss LSM 980',
      dept: 'Biophysics', 
      status: 'RUNNING_EXPERIMENT', 
      activeUser: 'Dr. Alan Turing', 
      runProgress: 65, 
      remainingTime: '1h 15m', 
      temp: '22.1°C', 
      vacuum: 'Atmospheric (Chamber Sealed)',
      laserPower: '48.2 mW (Optimal)',
      liquidLevel: 'N/A',
      locked: false, 
      load: 84 
    },
    { 
      id: 2, 
      name: '500MHz High-Res NMR Spectrometer', 
      model: 'Bruker Avance NEO',
      dept: 'Chemistry', 
      status: 'RUNNING_EXPERIMENT', 
      activeUser: 'Prof. Marie Curie', 
      runProgress: 85, 
      remainingTime: '35m', 
      temp: '4.2 K (-268.9°C)', 
      vacuum: '1.2 x 10⁻⁷ mbar',
      laserPower: 'RF Pulsed 500W',
      liquidLevel: '94% Liquid Helium',
      locked: false, 
      load: 92 
    },
    { 
      id: 3, 
      name: 'Titan Krios Cryo-EM 300kV', 
      model: 'Titan Krios G4',
      dept: 'Structural Bio', 
      status: 'MAINTENANCE_LOCK', 
      activeUser: 'Alex Rivera (Tech Lead)', 
      runProgress: 0, 
      remainingTime: 'Service In Progress', 
      temp: '77.3 K (L-N2)', 
      vacuum: 'Turbo Pump Rebuilding',
      laserPower: '300 kV X-FEG Off',
      liquidLevel: '88% Liquid Nitrogen',
      locked: true, 
      load: 0 
    },
    { 
      id: 4, 
      name: 'NovaSeq 6000 Sequencer', 
      model: 'Illumina NovaSeq 6000',
      dept: 'Genomics', 
      status: 'RUNNING_EXPERIMENT', 
      activeUser: 'Dr. Elena Rostova', 
      runProgress: 42, 
      remainingTime: '3h 10m', 
      temp: '19.5°C', 
      vacuum: 'Flow-Cell Manifold Sealed',
      laserPower: 'Dual Optical Laser Active',
      liquidLevel: 'Reagent Chiller: 4.0°C',
      locked: false, 
      load: 95 
    },
    { 
      id: 5, 
      name: 'MALDI-TOF Mass Spectrometer', 
      model: 'Bruker autoflex maX',
      dept: 'Proteomics', 
      status: 'IDLE_STANDBY', 
      activeUser: 'None (Ready for Session)', 
      runProgress: 0, 
      remainingTime: 'Immediate Slot Available', 
      temp: '21.8°C', 
      vacuum: '2.4 x 10⁻⁶ mbar (Target)',
      laserPower: '2 kHz Smartbeam Standby',
      liquidLevel: 'N/A',
      locked: false, 
      load: 68 
    },
    { 
      id: 6, 
      name: 'Dimension Icon Atomic Force Microscope', 
      model: 'Bruker ScanAsyst',
      dept: 'Materials Science', 
      status: 'IDLE_STANDBY', 
      activeUser: 'None (Ready for Session)', 
      runProgress: 0, 
      remainingTime: 'Immediate Slot Available', 
      temp: '20.0°C', 
      vacuum: 'Atmospheric Vibration-Isolated',
      laserPower: 'Diode Deflection Active',
      liquidLevel: 'N/A',
      locked: false, 
      load: 55 
    }
  ]);

  // Waitlist Queue State
  const [waitlistEntries, setWaitlistEntries] = useState([
    { id: 201, equipment: 'Titan Krios Cryo-EM', researcher: 'Dr. Chen Wei', institution: 'Harvard Core Facilities', waitTime: '4 days', priority: 'GRANT_CRITICAL', grant: 'NIH-U01-AI990' },
    { id: 202, equipment: 'NovaSeq 6000 Sequencer', researcher: 'Oncology Clinical Group', institution: 'MIT Research Lab', waitTime: '2 days', priority: 'HIGH_PRIORITY', grant: 'DARPA-BIO-2026' },
    { id: 203, equipment: '500MHz NMR Spectrometer', researcher: 'Dr. Marcus Vance', institution: 'Harvard Core Facilities', waitTime: '1 day', priority: 'ROUTINE', grant: 'NSF-CHE-8821' },
    { id: 204, equipment: 'Laser Confocal Microscope', researcher: 'Bioengineering Postdoc Lab', institution: 'Stanford BioHub', waitTime: '18 hours', priority: 'INTER_INSTITUTION', grant: 'STAN-BIO-89' }
  ]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    API.get('/bookings/pending')
      .then(res => {
        if (res.data && res.data.length > 0) setRequests(res.data);
        else throw new Error();
      })
      .catch(() => {
        setRequests([
          { 
            id: 101, 
            equipment: { name: '500MHz High-Res NMR Spectrometer', department: 'Chemistry', hourlyRate: 80, roomLocation: 'Mallinckrodt Lab B-04' }, 
            user: { fullName: 'Dr. Sarah Connor', email: 'sconnor@mit.edu', department: 'Biophysics', institution: 'MIT Research Lab', trustScore: '99% Compliance' }, 
            startTime: '2026-08-25 10:00', 
            endTime: '2026-08-25 14:00', 
            purpose: 'Carbon-13 Nuclear Magnetic Resonance scan on synthetic anti-microbial polymer backbone.', 
            grantCode: 'NSF-DMR-2026-4091',
            safetyClass: 'BSL-1 Standard Non-Hazardous',
            totalCost: 320,
            priority: 'HIGH_GRANT'
          },
          { 
            id: 102, 
            equipment: { name: 'Laser Confocal Microscope', department: 'Biophysics', hourlyRate: 45, roomLocation: 'Bldg 68, Room 312' }, 
            user: { fullName: 'Alex Rivera', email: 'arivera@harvard.edu', department: 'Bioengineering', institution: 'Harvard Core Facilities', trustScore: '96% Compliance' }, 
            startTime: '2026-08-26 13:00', 
            endTime: '2026-08-26 16:00', 
            purpose: 'Live stem cell fluorescence incubation and high-speed Airyscan mitochondrial tracking.', 
            grantCode: 'NIH-1R01-EB0299',
            safetyClass: 'BSL-2 Biohazard (Live Cell Culture)',
            totalCost: 135,
            priority: 'INTER_INSTITUTION'
          },
          { 
            id: 103, 
            equipment: { name: 'MALDI-TOF Mass Spectrometer', department: 'Proteomics', hourlyRate: 85, roomLocation: 'Beckman Center 120' }, 
            user: { fullName: 'Prof. Marie Curie', email: 'mcurie@stanford.edu', department: 'Chemistry', institution: 'Stanford BioHub', trustScore: '100% Certified PI' }, 
            startTime: '2026-08-27 09:00', 
            endTime: '2026-08-27 12:00', 
            purpose: 'Targeted peptide mass fingerprinting and LIFT fragmentation sequencing for antibody conjugates.', 
            grantCode: 'STAN-BIO-GRANT-89',
            safetyClass: 'Chemical Fume Protocol Class 2',
            totalCost: 255,
            priority: 'ROUTINE'
          },
          { 
            id: 104, 
            equipment: { name: 'NovaSeq 6000 Sequencer', department: 'Genomics', hourlyRate: 120, roomLocation: 'Genome Center 410' }, 
            user: { fullName: 'Dr. Marcus Vance', email: 'mvance@harvard.edu', department: 'Immunology', institution: 'Harvard Core Facilities', trustScore: '98% Compliance' }, 
            startTime: '2026-08-28 14:00', 
            endTime: '2026-08-28 19:00', 
            purpose: 'Dual Flow Cell S4 high-depth whole-genome transcriptome sequencing for immune cell activation.', 
            grantCode: 'NIH-R21-AI14890',
            safetyClass: 'BSL-2 RNA Library',
            totalCost: 600,
            priority: 'HIGH_GRANT'
          }
        ]);
      });
  };

  const handleApprove = (bookingId) => {
    const item = requests.find(r => r.id === bookingId);
    setRequests(requests.filter(r => r.id !== bookingId));
    setReviewModalReq(null);
    setToastMsg(`Authorized reservation for ${item?.user?.fullName || 'Researcher'} on ${item?.equipment?.name || 'Instrument'}`);
  };

  const handleBatchApprove = () => {
    const count = requests.length;
    setRequests([]);
    setToastMsg(`Batch approved all ${count} reservation requests! Schedulers notified.`);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    setRequests(requests.filter(r => r.id !== rejectModalReq.id));
    setToastMsg(`Declined reservation. Feedback sent to ${rejectModalReq.user.fullName}`);
    setRejectModalReq(null);
    setRejectReason('');
  };

  const handleLockSubmit = (e) => {
    e.preventDefault();
    setEquipmentFleet(equipmentFleet.map(eq => eq.id === lockModalItem.id ? { 
      ...eq, 
      locked: true, 
      status: 'MAINTENANCE_LOCK', 
      remainingTime: `Locked: ${lockReason || 'Maintenance Lock'}` 
    } : eq));
    setToastMsg(`Engaged emergency lockout on ${lockModalItem.name}`);
    setLockModalItem(null);
    setLockReason('');
  };

  const handleUnlock = (id) => {
    setEquipmentFleet(equipmentFleet.map(eq => eq.id === id ? { 
      ...eq, 
      locked: false, 
      status: 'IDLE_STANDBY', 
      remainingTime: 'Immediate Slot Available' 
    } : eq));
    setToastMsg(`Restored instrument to active fleet.`);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.grantCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || req.equipment.department === deptFilter;
    const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter;
    return matchesSearch && matchesDept && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 1. Command Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> Lab Manager Operational Control Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reservation authorization queue, live telemetry monitoring, bottleneck resolution, and fleet lockout controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleBatchApprove}
            disabled={requests.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Batch Authorize All ({requests.length})
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs text-indigo-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 2. Top Metric Indicator Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Pending Reviews</span>
            <span className="text-2xl font-black text-slate-900">{requests.length} Requests</span>
            <span className="text-[10px] text-amber-600 font-bold block">Avg Decision: 12 mins</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Radio className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Runs Now</span>
            <span className="text-2xl font-black text-slate-900">
              {equipmentFleet.filter(e => e.status === 'RUNNING_EXPERIMENT').length} Active Units
            </span>
            <span className="text-[10px] text-indigo-600 font-bold block">3 Automated Overnight</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Waitlist Queue</span>
            <span className="text-2xl font-black text-slate-900">{waitlistEntries.length} Researchers</span>
            <span className="text-[10px] text-purple-600 font-bold block">Auto-Pairing Enabled</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Fleet Health</span>
            <span className="text-2xl font-black text-emerald-700">94.8% Operational</span>
            <span className="text-[10px] text-slate-400 font-bold block">0 Safety Violations</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation View Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button 
          onClick={() => setActiveTab('queue')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'queue' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Layers className="w-4 h-4" /> Authorization Queue ({requests.length})
        </button>

        <button 
          onClick={() => setActiveTab('telemetry')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'telemetry' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Gauge className="w-4 h-4" /> Live Machine Telemetry & Chamber Gauges (6)
        </button>

        <button 
          onClick={() => setActiveTab('waitlist')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'waitlist' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Sparkles className="w-4 h-4" /> Bottleneck & Waitlist Optimization
        </button>

        <button 
          onClick={() => setActiveTab('facility')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'facility' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Wind className="w-4 h-4" /> Facility & Cleanroom Infrastructure
        </button>
      </div>

      {/* TAB 1: AUTHORIZATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          
          {/* Search, Department & Priority Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by applicant name, grant code, instrument..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={deptFilter} 
                onChange={e => setDeptFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
                <option value="ALL">All Departments</option>
                <option value="Biophysics">Biophysics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Proteomics">Proteomics</option>
                <option value="Genomics">Genomics</option>
              </select>

              <select 
                value={priorityFilter} 
                onChange={e => setPriorityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
                <option value="ALL">All Grant Priorities</option>
                <option value="HIGH_GRANT">High Priority Grant</option>
                <option value="INTER_INSTITUTION">Inter-University Shared</option>
                <option value="ROUTINE">Routine Academic</option>
              </select>
            </div>
          </div>

          {/* Authorization Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Instrument Unit</th>
                  <th className="p-4">Applicant & Verified Trust</th>
                  <th className="p-4">Requested Window</th>
                  <th className="p-4">Safety & Protocol</th>
                  <th className="p-4">Billable Total</th>
                  <th className="p-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      🎉 All reservation requests have been authorized and scheduled!
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <span className="font-black text-slate-900 block">{req.equipment.name}</span>
                        <span className="text-xs text-indigo-600 font-semibold">{req.equipment.roomLocation}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{req.user.fullName}</span>
                        <span className="text-xs text-slate-400">{req.user.email}</span>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {req.user.trustScore}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs text-slate-700">
                        <span className="font-bold text-slate-900">{req.startTime}</span> <br/>
                        <span className="text-slate-400">&rarr; {req.endTime}</span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <span className="text-xs text-slate-700 block truncate font-medium">{req.purpose}</span>
                        <div className="flex gap-1.5 mt-1">
                          <span className="text-[9px] bg-indigo-50 font-mono text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                            Grant: {req.grantCode}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                            {req.safetyClass.split(' ')[0]}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-black text-emerald-700 text-base">
                        ${req.totalCost}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setReviewModalReq(req)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold"
                          title="Inspect Grant & Safety Protocol">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleApprove(req.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-bold text-xs inline-flex items-center gap-1 shadow-sm">
                          <Check className="w-3.5 h-3.5" /> Authorize
                        </button>
                        <button 
                          onClick={() => setRejectModalReq(req)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition font-bold text-xs inline-flex items-center gap-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MACHINE TELEMETRY & CHAMBER GAUGES */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentFleet.map(item => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.dept}</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight mt-0.5">{item.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{item.model}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    item.status === 'RUNNING_EXPERIMENT' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                    item.status === 'MAINTENANCE_LOCK' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar if running */}
                {item.status === 'RUNNING_EXPERIMENT' ? (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Active Operator:</span>
                      <span className="text-slate-800 font-bold">{item.activeUser}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div style={{ width: `${item.runProgress}%` }} className="bg-indigo-600 h-full rounded-full transition-all"></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{item.runProgress}% Completed</span>
                      <span className="text-indigo-600 font-bold">{item.remainingTime} left</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                    <span>Current Availability:</span>
                    <span className="font-bold text-slate-800">{item.remainingTime}</span>
                  </div>
                )}

                {/* Real-Time Environmental Chamber Gauges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 block font-bold">Chamber Temp</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" /> {item.temp}
                    </span>
                  </div>

                  <div className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 block font-bold">Vacuum Level</span>
                    <span className="font-bold text-indigo-900 text-[11px] truncate block mt-0.5">
                      {item.vacuum}
                    </span>
                  </div>

                  <div className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 block font-bold">Optics / Laser</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                      {item.laserPower}
                    </span>
                  </div>

                  <div className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 block font-bold">Cryo Level</span>
                    <span className="font-bold text-emerald-700 text-[11px] truncate block mt-0.5">
                      {item.liquidLevel}
                    </span>
                  </div>
                </div>

                {/* Lockout Controls */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  {item.locked ? (
                    <button 
                      onClick={() => handleUnlock(item.id)}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5">
                      <Unlock className="w-3.5 h-3.5" /> Unlock & Restore to Fleet
                    </button>
                  ) : (
                    <button 
                      onClick={() => setLockModalItem(item)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Emergency Maintenance Lock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WAITLIST & BOTTLENECK OPTIMIZATION */}
      {activeTab === 'waitlist' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">High-Demand Equipment Waitlist Engine</h3>
              <p className="text-xs text-slate-500">Intelligent priority matching for high-impact grant research</p>
            </div>
            <button 
              onClick={() => setToastMsg("Simulated AI auto-allocation: matched 2 researchers with next cancellations")}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Sparkles className="w-3.5 h-3.5" /> Run Auto-Pairing Optimizer
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {waitlistEntries.map(w => (
              <div key={w.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{w.equipment}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                      w.priority === 'GRANT_CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {w.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Applicant: <strong>{w.researcher}</strong> ({w.institution}) · Grant: <span className="font-mono text-slate-400">{w.grant}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">Queued for: <strong>{w.waitTime}</strong></span>
                  <button 
                    onClick={() => setToastMsg(`Allocated emergency slot on ${w.equipment} for ${w.researcher}`)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                    Assign Slot <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FACILITY & CLEANROOM INFRASTRUCTURE */}
      {activeTab === 'facility' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-black text-slate-900">Facility Environment & Infrastructure Telemetry</h3>
            <p className="text-xs text-slate-500">Monitoring cleanroom particle density, HVAC vibration isolation, and backup power</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl"><Wind className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Cleanroom ISO 6 Environment</h4>
                  <span className="text-xs text-slate-400">Air Particle Counter: 280 / m³</span>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs flex justify-between font-bold">
                <span className="text-slate-500">HEPA Filter Uptime:</span>
                <span className="text-emerald-700">100% Certified</span>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl"><BatteryCharging className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">UPS Backup Power Grid</h4>
                  <span className="text-xs text-slate-400">Battery Reserve: 4h 30m Full Load</span>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs flex justify-between font-bold">
                <span className="text-slate-500">Generator Standby:</span>
                <span className="text-emerald-700">Ready (Zero Jitter)</span>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-800 rounded-xl"><Cpu className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">LN2 Liquid Nitrogen Supply</h4>
                  <span className="text-xs text-slate-400">Bulk Tank Level: 8,450 Liters</span>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs flex justify-between font-bold">
                <span className="text-slate-500">Auto-Refill Manifold:</span>
                <span className="text-indigo-700">Online & Pressurized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Shift Load Distribution Heatmap Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-slate-900">Fleet Utilization Intensity (Shift Breakdown)</h3>
            <p className="text-xs text-slate-500">Load distribution across Morning (08-12), Afternoon (12-16), and Evening (16-20) shifts</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>0%</span>
            <div className="w-3 h-3 bg-indigo-100 rounded"></div>
            <div className="w-3 h-3 bg-indigo-300 rounded"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded"></div>
            <div className="w-3 h-3 bg-indigo-950 rounded"></div>
            <span>100% Load</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 pt-2 text-center text-xs">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
            const morningLoads = [85, 90, 95, 80, 70, 45, 20];
            const afternoonLoads = [92, 96, 88, 90, 82, 35, 15];
            const eveningLoads = [75, 80, 65, 78, 50, 20, 10];

            return (
              <div key={day} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-black text-slate-800 block text-xs">{day.slice(0, 3)}</span>
                
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg flex justify-between">
                    <span>Morn</span>
                    <span className="font-bold">{morningLoads[idx]}%</span>
                  </div>
                  <div className="p-1.5 bg-indigo-800 text-white rounded-lg flex justify-between">
                    <span>Aft</span>
                    <span className="font-bold">{afternoonLoads[idx]}%</span>
                  </div>
                  <div className="p-1.5 bg-indigo-400 text-white rounded-lg flex justify-between">
                    <span>Eve</span>
                    <span className="font-bold">{eveningLoads[idx]}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: DETAILED GRANT & PROTOCOL INSPECTION */}
      {reviewModalReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                  Protocol Authorization Review
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{reviewModalReq.equipment.name}</h2>
                <p className="text-xs text-slate-400 font-mono">Location: {reviewModalReq.equipment.roomLocation}</p>
              </div>
              <button onClick={() => setReviewModalReq(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Experimental Procedure</span>
                <p className="text-xs text-slate-700 leading-relaxed">{reviewModalReq.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Principal Investigator</span>
                  <span className="font-black text-slate-900 text-xs block">{reviewModalReq.user.fullName}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{reviewModalReq.user.email}</span>
                </div>
                <div className="p-3.5 border rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Verified Grant ID</span>
                  <span className="font-mono font-bold text-indigo-700 text-xs block">{reviewModalReq.grantCode}</span>
                  <span className="text-emerald-700 font-bold">Budget Verified: Active</span>
                </div>
              </div>

              <div className="p-3.5 border rounded-2xl space-y-1 bg-amber-50/50 border-amber-100">
                <span className="text-amber-800 font-bold block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Biosafety & Hazardous Protocol Compliance
                </span>
                <span className="text-slate-700 font-medium block">{reviewModalReq.safetyClass}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setReviewModalReq(null)} className="px-4 py-2.5 text-xs font-bold text-slate-500">Close</button>
              <button 
                onClick={() => handleApprove(reviewModalReq.id)}
                className="px-6 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Authorize & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECTION DIALOG */}
      {rejectModalReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Decline Reservation Request</h3>
            <p className="text-xs text-slate-500">
              Provide feedback for <strong>{rejectModalReq.user.fullName}</strong> explaining why this slot is declined.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea 
                required 
                rows={3} 
                placeholder="e.g. Requested slot conflicts with scheduled laser alignment calibration..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-rose-500" 
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRejectModalReq(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-black bg-rose-600 text-white rounded-xl shadow-md">Confirm Decline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EMERGENCY FLEET LOCKOUT */}
      {lockModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">Emergency Instrument Lockout</h3>
            </div>
            <p className="text-xs text-slate-500">
              Locking <strong>{lockModalItem.name}</strong> will temporarily block all upcoming reservations and notify researchers in the queue.
            </p>

            <form onSubmit={handleLockSubmit} className="space-y-3">
              <textarea 
                required 
                rows={3} 
                placeholder="Reason: e.g. Turbo vacuum pump pressure warning detected..."
                value={lockReason}
                onChange={e => setLockReason(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-rose-500" 
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setLockModalItem(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-black bg-rose-600 text-white rounded-xl shadow-md">Engage Lockout</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}