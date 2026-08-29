import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { 
  Wrench, CheckCircle2, Clock, Plus, AlertTriangle, ShieldCheck, 
  Search, Filter, Calendar, FileText, Check, ArrowRight, RefreshCw, 
  Award, Activity, Download, UserCheck, DollarSign, Package, 
  ShieldAlert, Settings, Eye, ChevronRight, CheckSquare, Sparkles, MapPin
} from 'lucide-react';

const BALANCED_WORK_ORDERS = [
  // --- IN PROGRESS (3 TICKETS) ---
  { 
    id: 101, 
    equipment: { name: 'Titan Krios Cryo-EM 300kV', model: 'Titan Krios G4', department: 'Structural Bio', room: 'Cryo-EM Suite 08' }, 
    taskDescription: 'Vacuum Turbo-Pump Seal Replacement, Cryo-chamber beam alignment, and cold trap nitrogen flush.', 
    status: 'IN_PROGRESS', 
    scheduledDate: '2026-08-25', 
    priority: 'CRITICAL', 
    technician: 'Alex Rivera',
    techRole: 'Lead Cryo Specialist',
    estimatedHours: 6,
    partsCost: 1200,
    partsNeeded: 'Edwards Turbo Seal Kit (Part #ED-8821)',
    checklistTotal: 4,
    checklistDone: 3,
    certId: 'PENDING'
  },
  { 
    id: 103, 
    equipment: { name: 'NovaSeq 6000 Next-Gen Sequencer', model: 'Illumina NovaSeq 6000', department: 'Genomics', room: 'Genome Center 410' }, 
    taskDescription: 'Optical flow-cell laser diode alignment, fluidics manifold rinse, and dual-camera registration test.', 
    status: 'IN_PROGRESS', 
    scheduledDate: '2026-08-26', 
    priority: 'HIGH', 
    technician: 'Elena Rostova',
    techRole: 'Genomics Hardware Tech',
    estimatedHours: 5,
    partsCost: 650,
    partsNeeded: 'Illumina Optical Wash Cartridge Kit',
    checklistTotal: 5,
    checklistDone: 3,
    certId: 'PENDING'
  },
  { 
    id: 108, 
    equipment: { name: 'Agilent 7900 ICP-MS Analyzer', model: 'Agilent Technologies 7900', department: 'Environmental Sci', room: 'Green Bldg 514' }, 
    taskDescription: 'Argon torch alignment, nebulizer chamber clean, and sampling cone orifice microscopic inspection.', 
    status: 'IN_PROGRESS', 
    scheduledDate: '2026-08-25', 
    priority: 'MEDIUM', 
    technician: 'Dr. Marcus Vance',
    techRole: 'Spectroscopy Engineer',
    estimatedHours: 3,
    partsCost: 450,
    partsNeeded: 'Nickel Sampling & Skimmer Cones',
    checklistTotal: 3,
    checklistDone: 2,
    certId: 'PENDING'
  },

  // --- SCHEDULED (3 TICKETS) ---
  { 
    id: 102, 
    equipment: { name: '500MHz High-Res NMR Spectrometer', model: 'Bruker Avance NEO', department: 'Chemistry', room: 'Mallinckrodt B-04' }, 
    taskDescription: 'Liquid Helium CryoProbe cryogenic top-up, magnetic field shimming, and 13C lock calibration.', 
    status: 'SCHEDULED', 
    scheduledDate: '2026-09-02', 
    priority: 'HIGH', 
    technician: 'Dr. Marcus Vance',
    techRole: 'Spectroscopy Engineer',
    estimatedHours: 4,
    partsCost: 850,
    partsNeeded: '100L Liquid Helium Dewar',
    checklistTotal: 3,
    checklistDone: 0,
    certId: 'PENDING'
  },
  { 
    id: 105, 
    equipment: { name: 'MALDI-TOF/TOF Mass Spectrometer', model: 'Bruker autoflex maX', department: 'Proteomics', room: 'Beckman Center 120' }, 
    taskDescription: 'Smartbeam 3D laser pulse frequency profiling, detector voltage calibration, and high-vacuum gauge check.', 
    status: 'SCHEDULED', 
    scheduledDate: '2026-09-12', 
    priority: 'MEDIUM', 
    technician: 'Alex Rivera',
    techRole: 'Spectroscopy Engineer',
    estimatedHours: 3,
    partsCost: 320,
    partsNeeded: 'Standard Peptide Calibration Standard',
    checklistTotal: 3,
    checklistDone: 0,
    certId: 'PENDING'
  },
  { 
    id: 106, 
    equipment: { name: 'Dimension Icon Atomic Force Microscope', model: 'Bruker ScanAsyst', department: 'Materials Science', room: 'Cleanroom ISO 6' }, 
    taskDescription: 'Cantilever deflection sensor zeroing, scanner linearity test, and anti-vibration table pressure tuning.', 
    status: 'SCHEDULED', 
    scheduledDate: '2026-09-18', 
    priority: 'ROUTINE', 
    technician: 'Alex Rivera',
    techRole: 'Nanotechnology Tech',
    estimatedHours: 3,
    partsCost: 200,
    partsNeeded: 'Silicon Nitride Test Cantilevers',
    checklistTotal: 3,
    checklistDone: 0,
    certId: 'PENDING'
  },

  // --- COMPLETED (3 CERTIFIED TICKETS) ---
  { 
    id: 104, 
    equipment: { name: 'Laser Confocal Microscope', model: 'Zeiss LSM 980 with Airyscan 2', department: 'Biophysics', room: 'Bldg 68, Room 312' }, 
    taskDescription: '488nm & 561nm laser diode power output verification and Airyscan 2 pinhole spatial recalibration.', 
    status: 'COMPLETED', 
    scheduledDate: '2026-08-10', 
    completedDate: '2026-08-10', 
    serviceNotes: 'Laser output certified within 0.01nm spatial tolerance. NIST-traceable slide calibration passed.', 
    priority: 'MEDIUM', 
    technician: 'Alex Rivera',
    techRole: 'Lead Optical Specialist',
    estimatedHours: 2,
    partsCost: 150,
    partsNeeded: 'Cleaning Optical Wipes',
    checklistTotal: 4,
    checklistDone: 4,
    certId: 'ISO-17025-CAL-9942'
  },
  { 
    id: 107, 
    equipment: { name: 'SmartLab 9kW XRD Diffractometer', model: 'Rigaku SmartLab 9kW', department: 'Crystallography', room: 'Materials Lab B-12' }, 
    taskDescription: 'Rotating anode copper target resurfacing and radiation shielding sensor safety interlock check.', 
    status: 'COMPLETED', 
    scheduledDate: '2026-08-04', 
    completedDate: '2026-08-04', 
    serviceNotes: 'Radiation interlocks tested 100% fail-safe. Anode rotation balanced with zero vibration.', 
    priority: 'HIGH', 
    technician: 'Elena Rostova',
    techRole: 'Hardware Specialist',
    estimatedHours: 4,
    partsCost: 900,
    partsNeeded: 'Rigaku Vacuum Gasket & Anode Seal',
    checklistTotal: 4,
    checklistDone: 4,
    certId: 'ISO-17025-CAL-8821'
  },
  { 
    id: 109, 
    equipment: { name: 'ACQUITY Premier Ultra-HPLC', model: 'Waters ACQUITY Premier', department: 'Pharmacology', room: 'Pharmacy Hall 308' }, 
    taskDescription: '15,000 PSI high-pressure pump seal replacement, binary solvent mixer flush, and PDA wavelength calibration.', 
    status: 'COMPLETED', 
    scheduledDate: '2026-08-14', 
    completedDate: '2026-08-14', 
    serviceNotes: 'MaxSeal pressure hold test passed at 15,200 PSI for 45 minutes with zero pressure decay.', 
    priority: 'MEDIUM', 
    technician: 'Dr. Marcus Vance',
    techRole: 'Spectroscopy Engineer',
    estimatedHours: 3,
    partsCost: 380,
    partsNeeded: 'Waters High-Pressure Check Valves',
    checklistTotal: 4,
    checklistDone: 4,
    certId: 'ISO-17025-CAL-7734'
  }
];

export default function MaintenanceBoard() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'calibration' | 'roster' | 'history'
  const [tasks, setTasks] = useState(BALANCED_WORK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showCertifyModal, setShowCertifyModal] = useState(null);

  // New Work Order Form State
  const [newTask, setNewTask] = useState({ 
    equipmentName: '', 
    model: 'Custom Unit',
    department: 'Biophysics',
    room: 'Core Facility Room 101',
    description: '', 
    scheduledDate: '', 
    priority: 'HIGH', 
    technician: 'Alex Rivera',
    estimatedHours: 3,
    partsCost: 250,
    partsNeeded: 'Standard Seal & Calibration Kit'
  });

  // Certify Form State
  const [certNotes, setCertNotes] = useState('');
  const [certId, setCertId] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now().toString().slice(-3),
      equipment: { 
        name: newTask.equipmentName, 
        model: newTask.model, 
        department: newTask.department,
        room: newTask.room
      },
      taskDescription: newTask.description,
      scheduledDate: newTask.scheduledDate,
      status: 'SCHEDULED',
      priority: newTask.priority,
      technician: newTask.technician,
      techRole: 'Assigned Lead Engineer',
      estimatedHours: parseInt(newTask.estimatedHours),
      partsCost: parseInt(newTask.partsCost),
      partsNeeded: newTask.partsNeeded,
      checklistTotal: 4,
      checklistDone: 0,
      certId: 'PENDING'
    };
    setTasks([created, ...tasks]);
    setShowNewModal(false);
  };

  const moveTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { 
      ...t, 
      status: newStatus,
      checklistDone: newStatus === 'IN_PROGRESS' ? 2 : t.checklistDone
    } : t));
  };

  const handleCertifyComplete = (e) => {
    e.preventDefault();
    setTasks(tasks.map(t => t.id === showCertifyModal.id ? {
      ...t,
      status: 'COMPLETED',
      completedDate: '2026-08-21',
      checklistDone: t.checklistTotal,
      serviceNotes: certNotes || 'Service procedure completed and validated within ISO-17025 standard tolerance.',
      certId: certId || `ISO-17025-CAL-${Math.floor(Math.random() * 8999 + 1000)}`
    } : t));
    setShowCertifyModal(null);
    setCertNotes('');
    setCertId('');
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.taskDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 1. Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-indigo-600" /> Maintenance & Calibration Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preventive service scheduling, ISO-17025 certification tracking, technician dispatch, and downtime mitigation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8080/api/reports/export/maintenance-csv"
            download
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
            <Download className="w-4 h-4 text-slate-500" /> Export Audit CSV
          </a>
          <button 
            onClick={() => setShowNewModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Issue Work Order
          </button>
        </div>
      </div>

      {/* 2. Industrial KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Fleet Uptime</span>
            <span className="text-2xl font-black text-slate-900">98.4%</span>
            <span className="text-[10px] text-emerald-600 font-bold block">MTTR: 3.8 Hours Avg</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Incidents</span>
            <span className="text-2xl font-black text-rose-600">
              {tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length} Critical
            </span>
            <span className="text-[10px] text-rose-500 font-bold block">1 Machine Locked Out</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Work Order Queue</span>
            <span className="text-2xl font-black text-slate-900">
              {tasks.filter(t => t.status !== 'COMPLETED').length} Active Tickets
            </span>
            <span className="text-[10px] text-slate-400 font-bold block">88% Planned Preventive</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">ISO-17025 Compliance</span>
            <span className="text-2xl font-black text-emerald-700">100% Certified</span>
            <span className="text-[10px] text-slate-400 font-bold block">12 NIST Standards Verified</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation View Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button 
          onClick={() => setActiveTab('kanban')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'kanban' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Wrench className="w-4 h-4" /> Work Order Kanban Pipeline ({filteredTasks.length})
        </button>

        <button 
          onClick={() => setActiveTab('calibration')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'calibration' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <Award className="w-4 h-4" /> Calibration Expiry Matrix (12 Instruments)
        </button>

        <button 
          onClick={() => setActiveTab('roster')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'roster' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <UserCheck className="w-4 h-4" /> Lead Technician Dispatch Roster
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}>
          <FileText className="w-4 h-4" /> Service Audit History ({tasks.filter(t => t.status === 'COMPLETED').length})
        </button>
      </div>

      {/* TAB 1: KANBAN WORK ORDER PIPELINE */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search ticket by instrument, technician, parts..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={priorityFilter} 
                onChange={e => setPriorityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
                <option value="ALL">All Priority Levels</option>
                <option value="CRITICAL">Critical (Down)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="ROUTINE">Routine Maintenance</option>
              </select>
            </div>
          </div>

          {/* 3-Column Kanban Board - Using items-start for clean natural alignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map(colStatus => {
              const colTasks = filteredTasks.filter(t => t.status === colStatus);
              return (
                <div key={colStatus} className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-4">
                  
                  {/* Lane Header */}
                  <div className="flex justify-between items-center pb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        colStatus === 'SCHEDULED' ? 'bg-indigo-500' :
                        colStatus === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`} />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {colStatus.replace('_', ' ')}
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm">
                      {colTasks.length} Tickets
                    </span>
                  </div>

                  {/* Ticket Cards */}
                  <div className="space-y-4">
                    {colTasks.map(task => (
                      <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 group">
                        
                        {/* Card Top: Priority Badge & Ticket ID */}
                        <div className="flex justify-between items-start">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                            task.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 animate-pulse' :
                            task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 
                            task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">#TKT-{task.id}</span>
                        </div>

                        {/* Equipment Title & Room */}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                            {task.equipment?.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{task.equipment?.model}</p>
                          <span className="text-[11px] text-indigo-700 font-semibold block mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {task.equipment?.room}
                          </span>
                        </div>

                        {/* Service Instructions */}
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                          {task.taskDescription}
                        </p>

                        {/* Parts & Estimated Cost Info */}
                        <div className="p-2.5 bg-slate-50/60 rounded-xl space-y-1 text-[11px] border border-slate-100">
                          <div className="flex justify-between items-center text-slate-500">
                            <span className="flex items-center gap-1"><Package className="w-3 h-3 text-slate-400" /> Parts:</span>
                            <span className="font-bold text-slate-700 truncate max-w-[150px]">{task.partsNeeded}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Cost:</span>
                            <span className="font-mono font-bold text-emerald-700">${task.partsCost}</span>
                          </div>
                        </div>

                        {/* Checklist Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Service Checklist</span>
                            <span>{task.checklistDone} / {task.checklistTotal} Steps</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${(task.checklistDone / task.checklistTotal) * 100}%` }}
                              className={`h-full rounded-full transition-all ${
                                colStatus === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`} 
                            />
                          </div>
                        </div>

                        {/* Technician Assignment Info */}
                        <div className="text-[11px] font-mono text-slate-500 space-y-1 pt-1">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Date:</span>
                            <span className="font-bold text-slate-800">{task.scheduledDate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-slate-400" /> Assigned:</span>
                            <span className="font-bold text-indigo-950">{task.technician}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                          {colStatus === 'SCHEDULED' && (
                            <button 
                              onClick={() => moveTaskStatus(task.id, 'IN_PROGRESS')}
                              className="w-full text-xs font-bold py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition flex items-center justify-center gap-1">
                              Begin Service <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {colStatus === 'IN_PROGRESS' && (
                            <button 
                              onClick={() => setShowCertifyModal(task)}
                              className="w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete & Certify
                            </button>
                          )}

                          {colStatus === 'COMPLETED' && (
                            <div className="w-full text-center text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-100">
                              <Award className="w-3.5 h-3.5 text-emerald-600" /> {task.certId}
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: CALIBRATION & ISO-17025 MATRIX (12 INSTRUMENTS) */}
      {activeTab === 'calibration' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">NIST / ISO-17025 Calibration Tracker</h3>
              <p className="text-xs text-slate-500">Live countdown to required optical, cryogenic, and vacuum sensor recalibration</p>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-xl font-mono">
              ISO-17025 Accredited
            </span>
          </div>

          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Instrument Unit</th>
                <th className="p-4">Facility Room</th>
                <th className="p-4">Last Certified</th>
                <th className="p-4">Next Expiry Date</th>
                <th className="p-4">Calibration Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Titan Krios Cryo-EM', room: 'Cryo-EM Suite 08', last: '2026-02-19', next: '2026-08-30', days: 9, status: 'DUE_SOON', cert: 'ISO-CAL-7719' },
                { name: 'NovaSeq 6000 Sequencer', room: 'Genome Center 410', last: '2026-04-18', next: '2026-11-18', days: 89, status: 'VALID', cert: 'ISO-CAL-5510' },
                { name: '500MHz NMR Spectrometer', room: 'Mallinckrodt B-04', last: '2026-05-10', next: '2026-12-21', days: 122, status: 'VALID', cert: 'ISO-CAL-8821' },
                { name: 'Laser Confocal Microscope', room: 'Bldg 68, Room 312', last: '2026-06-15', next: '2027-01-21', days: 153, status: 'VALID', cert: 'ISO-CAL-9942' },
                { name: 'MALDI-TOF Mass Spectrometer', room: 'Beckman Center 120', last: '2026-06-01', next: '2026-12-01', days: 102, status: 'VALID', cert: 'ISO-CAL-6632' },
                { name: 'Dimension Icon AFM', room: 'Cleanroom ISO 6', last: '2026-07-01', next: '2027-01-01', days: 133, status: 'VALID', cert: 'ISO-CAL-4429' },
                { name: 'SmartLab 9kW XRD', room: 'Materials Lab B-12', last: '2026-03-12', next: '2026-10-12', days: 52, status: 'VALID', cert: 'ISO-CAL-3321' },
                { name: 'FACSymphony Cytometer', room: 'Koch Institute 228', last: '2026-05-25', next: '2026-11-25', days: 96, status: 'VALID', cert: 'ISO-CAL-2201' },
                { name: 'Optima XPN-100 Centrifuge', room: 'Biochem Basement 015', last: '2026-06-10', next: '2026-12-10', days: 111, status: 'VALID', cert: 'ISO-CAL-1190' },
                { name: 'Agilent 7900 ICP-MS', room: 'Green Bldg 514', last: '2026-04-05', next: '2026-10-05', days: 45, status: 'VALID', cert: 'ISO-CAL-0089' },
                { name: 'STED Super-Res Microscope', room: 'Neuro Center 102', last: '2026-07-15', next: '2027-01-15', days: 147, status: 'VALID', cert: 'ISO-CAL-9977' },
                { name: 'ACQUITY Premier Ultra-HPLC', room: 'Pharmacy Hall 308', last: '2026-06-20', next: '2026-12-20', days: 121, status: 'VALID', cert: 'ISO-CAL-8854' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-900">
                    {row.name}
                    <span className="text-[10px] text-slate-400 font-mono block">Cert: {row.cert}</span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-600">{row.room}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">{row.last}</td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-800">{row.next}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                      row.status === 'DUE_SOON' ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {row.status === 'DUE_SOON' ? `⚠️ EXPIRES IN ${row.days} DAYS` : `✓ VALID (${row.days} DAYS)`}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        setNewTask({ ...newTask, equipmentName: row.name, description: `Routine ISO Recalibration for ${row.name}` });
                        setShowNewModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold">
                      Schedule Service
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TECHNICIAN DISPATCH ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-base font-black text-slate-900">On-Duty Laboratory Technicians & Workloads</h3>
            <p className="text-xs text-slate-500">Live technician assignments and specialty certifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              { name: 'Alex Rivera', role: 'Lead Optical & Cryo Specialist', active: 3, completed: 18, email: 'arivera@mit.edu', certs: 'Zeiss Certified / Cryo-EM Level 3' },
              { name: 'Dr. Marcus Vance', role: 'Spectroscopy & Mass Spec Engineer', active: 2, completed: 14, email: 'mvance@harvard.edu', certs: 'Bruker TopSpin Master / Agilent ICP' },
              { name: 'Elena Rostova', role: 'Genomics Hardware & Fluidics Lead', active: 2, completed: 12, email: 'erostova@mit.edu', certs: 'Illumina Certified Service Specialist' },
            ].map((tech, idx) => (
              <div key={idx} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{tech.name}</h4>
                    <span className="text-[11px] text-slate-500">{tech.role}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Work Orders:</span>
                    <span className="font-bold text-indigo-700">{tech.active} Tickets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certifications:</span>
                    <span className="font-bold text-slate-700 text-[10px]">{tech.certs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-black text-slate-900">Historical Service Audit & Downtime Records</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'COMPLETED').map(item => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.equipment?.name}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold">{item.certId}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.serviceNotes}</p>
                </div>
                <div className="text-right text-xs font-mono text-slate-400">
                  <p>Certified by: <strong className="text-slate-700">{item.technician}</strong></p>
                  <p>Date: {item.completedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE WORK ORDER */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900">Issue Maintenance Work Order</h2>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Equipment Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Titan Krios Cryo-EM 300kV" 
                  value={newTask.equipmentName}
                  className="w-full border rounded-xl p-2.5 text-xs font-semibold" 
                  onChange={e => setNewTask({...newTask, equipmentName: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Service Instructions</label>
                <textarea 
                  required 
                  rows={3} 
                  placeholder="Describe calibration requirements, mechanical diagnosis, replacement parts..." 
                  className="w-full border rounded-xl p-2.5 text-xs" 
                  onChange={e => setNewTask({...newTask, description: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Scheduled Target Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full border rounded-xl p-2.5 text-xs font-mono" 
                    onChange={e => setNewTask({...newTask, scheduledDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select 
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold" 
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="ROUTINE">Routine Maintenance</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical Machine Down</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Parts Cost ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    placeholder="450" 
                    className="w-full border rounded-xl p-2.5 text-xs font-mono" 
                    onChange={e => setNewTask({...newTask, partsCost: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assign Lead Technician</label>
                  <select 
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                    onChange={e => setNewTask({...newTask, technician: e.target.value})}>
                    <option value="Alex Rivera">Alex Rivera (Cryo & Optics Lead)</option>
                    <option value="Dr. Marcus Vance">Dr. Marcus Vance (Spectroscopy)</option>
                    <option value="Elena Rostova">Elena Rostova (Genomics)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Replacement Parts / Consumables</label>
                <input 
                  type="text" 
                  placeholder="e.g. Turbo seal gasket, 100L Liquid Nitrogen"
                  className="w-full border rounded-xl p-2.5 text-xs" 
                  onChange={e => setNewTask({...newTask, partsNeeded: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">Dispatch Work Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CERTIFY & RESTORE MACHINE */}
      {showCertifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Award className="w-6 h-6" />
              <h2 className="text-lg font-black text-slate-900">Service Certification</h2>
            </div>
            <p className="text-xs text-slate-500">
              Certifying completion for <strong>{showCertifyModal.equipment?.name}</strong> will restore equipment availability in the catalog.
            </p>

            <form onSubmit={handleCertifyComplete} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Calibration Certificate ID</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. ISO-17025-CAL-9942" 
                  value={certId}
                  onChange={e => setCertId(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs font-mono uppercase" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Technician Service & Validation Notes</label>
                <textarea 
                  required 
                  rows={3} 
                  placeholder="Beam alignment verified, sensors zeroed, safe for researcher operation..." 
                  value={certNotes}
                  onChange={e => setCertNotes(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCertifyModal(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md">
                  Certify & Restore Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}