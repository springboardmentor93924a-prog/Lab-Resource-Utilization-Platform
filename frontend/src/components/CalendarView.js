import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { 
  Calendar as CalendarIcon, Clock, Filter, Layers, CheckCircle2, 
  ChevronLeft, ChevronRight, Plus, AlertTriangle, User, MapPin, 
  Zap, DollarSign, X, Check, Activity, ShieldAlert, List, Grid,
  Download, Sparkles, SlidersHorizontal, ArrowRight, FileSpreadsheet
} from 'lucide-react';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const DAYS = [
  { key: 'Mon', label: 'Monday', date: 'Aug 24' },
  { key: 'Tue', label: 'Tuesday', date: 'Aug 25' },
  { key: 'Wed', label: 'Wednesday', date: 'Aug 26' },
  { key: 'Thu', label: 'Thursday', date: 'Aug 27' },
  { key: 'Fri', label: 'Friday', date: 'Aug 28' },
  { key: 'Sat', label: 'Saturday', date: 'Aug 29' },
  { key: 'Sun', label: 'Sunday', date: 'Aug 30' }
];

const MASTER_SCHEDULE_DATA = [
  { 
    id: 1, 
    title: 'Laser Confocal Microscope', 
    category: 'Imaging', 
    user: 'Dr. Alan Turing', 
    email: 'aturing@mit.edu',
    department: 'Biophysics', 
    institution: 'MIT Research Lab',
    roomLocation: 'Bldg 68, Room 312',
    day: 'Mon', 
    start: '09:00', 
    end: '12:00', 
    duration: '3 hrs',
    cost: 135, 
    status: 'CONFIRMED',
    purpose: 'Airyscan 2 live-cell structural fluorescent tracking of mitochondrial fission', 
    color: 'bg-indigo-600',
    borderColor: 'border-indigo-700'
  },
  { 
    id: 2, 
    title: '500MHz NMR Spectrometer', 
    category: 'Spectroscopy', 
    user: 'Prof. Marie Curie', 
    email: 'mcurie@harvard.edu',
    department: 'Chemistry', 
    institution: 'Harvard Core',
    roomLocation: 'Mallinckrodt Lab B-04',
    day: 'Mon', 
    start: '14:00', 
    end: '17:00', 
    duration: '3 hrs',
    cost: 240, 
    status: 'CONFIRMED',
    purpose: 'Carbon-13 and Nitrogen-15 2D-NMR correlation spectroscopy on synthetic polymers', 
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-700'
  },
  { 
    id: 3, 
    title: 'Titan Krios Cryo-EM Lock', 
    category: 'Maintenance', 
    user: 'Alex Rivera (Technician Lead)', 
    email: 'arivera@mit.edu',
    department: 'Structural Biology', 
    institution: 'MIT Research Lab',
    roomLocation: 'Cryo-EM Suite, Sub-Basement',
    day: 'Tue', 
    start: '08:00', 
    end: '12:00', 
    duration: '4 hrs',
    cost: 0, 
    status: 'MAINTENANCE_LOCK',
    purpose: 'Preventive vacuum turbo-pump seal replacement and cryo-chamber beam alignment', 
    color: 'bg-amber-600',
    borderColor: 'border-amber-700'
  },
  { 
    id: 4, 
    title: 'MALDI-TOF Mass Spectrometer', 
    category: 'Spectroscopy', 
    user: 'Dr. Sarah Connor', 
    email: 'sconnor@mit.edu',
    department: 'Proteomics', 
    institution: 'Stanford BioHub',
    roomLocation: 'Beckman Center, Room 120',
    day: 'Wed', 
    start: '10:00', 
    end: '13:00', 
    duration: '3 hrs',
    cost: 255, 
    status: 'CONFIRMED',
    purpose: 'Targeted peptide mass fingerprinting and LIFT fragmentation sequencing', 
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-700'
  },
  { 
    id: 5, 
    title: 'NovaSeq 6000 Sequencer Run', 
    category: 'Genomics', 
    user: 'Dr. Elena Rostova', 
    email: 'erostova@mit.edu',
    department: 'Genomics Core', 
    institution: 'MIT Research Lab',
    roomLocation: 'Genome Center 410',
    day: 'Wed', 
    start: '14:00', 
    end: '19:00', 
    duration: '5 hrs',
    cost: 600, 
    status: 'IN_USE',
    purpose: 'Dual flow cell S4 deep RNA-seq for clinical oncology cohort transcriptomics', 
    color: 'bg-blue-600',
    borderColor: 'border-blue-700'
  },
  { 
    id: 6, 
    title: 'Preparative Ultracentrifuge', 
    category: 'Separation', 
    user: 'Biochemistry Research Group', 
    email: 'biochem@harvard.edu',
    department: 'Biochemistry', 
    institution: 'Harvard Core',
    roomLocation: 'Biochem Basement 015',
    day: 'Thu', 
    start: '13:00', 
    end: '16:00', 
    duration: '3 hrs',
    cost: 120, 
    status: 'CONFIRMED',
    purpose: 'Density gradient sucrose fractionation of membrane receptor complexes', 
    color: 'bg-purple-600',
    borderColor: 'border-purple-700'
  },
  { 
    id: 7, 
    title: 'Atomic Force Microscope (AFM)', 
    category: 'Nanotechnology', 
    user: 'NanoScale Lab Group', 
    email: 'nano@harvard.edu',
    department: 'Materials Science', 
    institution: 'Harvard Core',
    roomLocation: 'Cleanroom ISO 6',
    day: 'Thu', 
    start: '09:00', 
    end: '12:00', 
    duration: '3 hrs',
    cost: 180, 
    status: 'CONFIRMED',
    purpose: 'PeakForce QNM nanomechanical elasticity mapping of graphene oxide thin films', 
    color: 'bg-cyan-600',
    borderColor: 'border-cyan-700'
  },
  { 
    id: 8, 
    title: 'FACSymphony Cytometer', 
    category: 'Separation', 
    user: 'Dr. Marcus Vance', 
    email: 'mvance@harvard.edu',
    department: 'Immunology', 
    institution: 'Harvard Core',
    roomLocation: 'Koch Institute 228',
    day: 'Fri', 
    start: '11:00', 
    end: '15:00', 
    duration: '4 hrs',
    cost: 300, 
    status: 'CONFIRMED',
    purpose: '30-color high-dimensional immunophenotyping of human PBMC antigen cohorts', 
    color: 'bg-purple-600',
    borderColor: 'border-purple-700'
  },
  { 
    id: 9, 
    title: 'STED Super-Res Microscope', 
    category: 'Imaging', 
    user: 'Dr. Alan Turing', 
    email: 'aturing@mit.edu',
    department: 'Neurobiology', 
    institution: 'Stanford BioHub',
    roomLocation: 'Neuro Center 102',
    day: 'Fri', 
    start: '16:00', 
    end: '19:00', 
    duration: '3 hrs',
    cost: 330, 
    status: 'CONFIRMED',
    purpose: '20nm lateral resolution dendritic spine nanoscale synaptic vesicle tracking', 
    color: 'bg-indigo-600',
    borderColor: 'border-indigo-700'
  },
  { 
    id: 10, 
    title: 'SmartLab 9kW XRD Scan', 
    category: 'Materials Science', 
    user: 'Crystallography Team', 
    email: 'crystal@stanford.edu',
    department: 'Materials Science', 
    institution: 'Stanford BioHub',
    roomLocation: 'Materials Lab B-12',
    day: 'Sat', 
    start: '10:00', 
    end: '13:00', 
    duration: '3 hrs',
    cost: 210, 
    status: 'CONFIRMED',
    purpose: 'High-temperature in-situ grazing incidence XRD on perovskite solar cells', 
    color: 'bg-orange-600',
    borderColor: 'border-orange-700'
  },
  { 
    id: 11, 
    title: 'Agilent 7900 ICP-MS Analyzer', 
    category: 'Spectroscopy', 
    user: 'Environmental Geochem Team', 
    email: 'env@mit.edu',
    department: 'Environmental Sci', 
    institution: 'MIT Research Lab',
    roomLocation: 'Green Bldg 514',
    day: 'Tue', 
    start: '13:00', 
    end: '16:00', 
    duration: '3 hrs',
    cost: 270, 
    status: 'CONFIRMED',
    purpose: 'Sub-ppt ultra-trace heavy metal quantification in municipal aquifer samples', 
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-700'
  },
  { 
    id: 12, 
    title: 'ACQUITY Premier Ultra-HPLC', 
    category: 'Separation', 
    user: 'Pharmacology Team', 
    email: 'pharma@harvard.edu',
    department: 'Pharmacology', 
    institution: 'Harvard Core',
    roomLocation: 'Pharmacy Hall 308',
    day: 'Wed', 
    start: '08:00', 
    end: '11:00', 
    duration: '3 hrs',
    cost: 150, 
    status: 'CONFIRMED',
    purpose: 'High-throughput pharmacokinetic drug bioavailability bioassay', 
    color: 'bg-purple-600',
    borderColor: 'border-purple-700'
  }
];

export default function CalendarView() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'gantt' | 'agenda'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState('ALL');
  const [events, setEvents] = useState(MASTER_SCHEDULE_DATA);
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [quickBookSlot, setQuickBookSlot] = useState(null);

  // Quick Book Form
  const [bookForm, setBookForm] = useState({ equipmentId: '1', duration: '2', purpose: '' });

  const handleQuickBookSubmit = (e) => {
    e.preventDefault();
    const newBooking = {
      id: Date.now(),
      title: bookForm.equipmentId === '1' ? 'Laser Confocal Microscope' : '500MHz NMR Spectrometer',
      category: bookForm.equipmentId === '1' ? 'Imaging' : 'Spectroscopy',
      user: 'Current Researcher (You)',
      email: 'researcher@university.edu',
      department: 'Biophysics',
      institution: 'MIT Research Lab',
      roomLocation: 'Bldg 68, Room 312',
      day: quickBookSlot.dayKey,
      start: quickBookSlot.hour,
      end: `${parseInt(quickBookSlot.hour) + parseInt(bookForm.duration)}:00`,
      duration: `${bookForm.duration} hrs`,
      cost: parseInt(bookForm.duration) * 65,
      status: 'CONFIRMED',
      purpose: bookForm.purpose || 'Experimental measurement session',
      color: 'bg-indigo-600',
      borderColor: 'border-indigo-700'
    };
    setEvents([...events, newBooking]);
    setQuickBookSlot(null);
  };

  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'ALL' || e.title.toLowerCase().includes(selectedEquipment.toLowerCase());
    return matchesCategory && matchesEquipment;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 1. Top Header & Metrics Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-indigo-600" /> Master Resource Time & Scheduling Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fleet utilization matrix across 12 instruments, maintenance locks, and collision-free slot allocations
          </p>
        </div>

        {/* Live Ribbon Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-2xl flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 block">Total Active Bookings</span>
              <span className="text-sm font-black text-indigo-950">{events.length} Allocated Slots</span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">Fleet Load</span>
              <span className="text-sm font-black text-emerald-950">76.4% Capacity</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Week Navigation, View Modes & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: View Switcher & Week Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}>
              <Grid className="w-3.5 h-3.5" /> Weekly Grid
            </button>
            <button 
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'gantt' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Equipment Gantt
            </button>
            <button 
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'agenda' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}>
              <List className="w-3.5 h-3.5" /> Agenda List
            </button>
          </div>

          {/* Week Date Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button className="p-2 hover:bg-white rounded-xl text-slate-600 transition shadow-sm">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold px-3 text-slate-800 font-mono">Aug 24 – Aug 30, 2026</span>
            <button className="p-2 hover:bg-white rounded-xl text-slate-600 transition shadow-sm">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Equipment Dropdown */}
          <select 
            value={selectedEquipment} 
            onChange={e => setSelectedEquipment(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
            <option value="ALL">All 12 Instruments</option>
            <option value="Confocal">Laser Confocal Microscope</option>
            <option value="NMR">500MHz NMR Spectrometer</option>
            <option value="Cryo">Titan Krios Cryo-EM</option>
            <option value="MALDI">MALDI-TOF Mass Spec</option>
            <option value="NovaSeq">NovaSeq 6000 Sequencer</option>
            <option value="AFM">Atomic Force Microscope (AFM)</option>
            <option value="XRD">SmartLab 9kW XRD</option>
            <option value="Cytometer">FACSymphony Cytometer</option>
          </select>

          {/* Category Badges */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {['ALL', 'Imaging', 'Spectroscopy', 'Genomics', 'Separation', 'Nanotechnology', 'Maintenance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: WEEKLY TIME SLOT GRID */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center">
            <div className="p-4 border-r border-slate-200 flex flex-col items-center justify-center bg-slate-100/50">
              <Clock className="w-4 h-4 text-slate-400 mb-0.5" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Timeline</span>
            </div>

            {DAYS.map(day => (
              <div key={day.key} className="p-3.5 border-r border-slate-200 last:border-r-0">
                <span className="text-xs font-black text-slate-800 block uppercase tracking-wider">{day.label}</span>
                <span className="text-[11px] font-mono text-indigo-600 font-bold">{day.date}</span>
              </div>
            ))}
          </div>

          {/* Hourly Rows & Cells */}
          <div className="divide-y divide-slate-100">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 min-h-[82px] group">
                
                {/* Hour Column */}
                <div className="p-2 border-r border-slate-200 bg-slate-50/50 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                  {hour}
                </div>

                {/* Day Slot Cells */}
                {DAYS.map(day => {
                  const matchedEvents = filteredEvents.filter(e => e.day === day.key && e.start === hour);

                  return (
                    <div 
                      key={day.key} 
                      className="border-r border-slate-100 last:border-r-0 p-1.5 relative transition hover:bg-indigo-50/20 group/cell">
                      
                      {matchedEvents.length > 0 ? (
                        matchedEvents.map(matchedEvent => (
                          <div 
                            key={matchedEvent.id}
                            onClick={() => setActiveModalEvent(matchedEvent)}
                            className={`${matchedEvent.color} text-white p-3 rounded-2xl shadow-sm space-y-1.5 cursor-pointer hover:scale-[1.02] transition-transform`}>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-wider bg-black/25 px-1.5 py-0.5 rounded-md">
                                {matchedEvent.category}
                              </span>
                              <span className="text-[9px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">
                                {matchedEvent.duration}
                              </span>
                            </div>
                            <h4 className="text-xs font-black leading-tight truncate">{matchedEvent.title}</h4>
                            <div className="flex justify-between items-center text-[10px] opacity-90">
                              <span className="truncate">👤 {matchedEvent.user}</span>
                              <span className="font-mono font-bold">${matchedEvent.cost}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        /* Empty Slot Click-to-Book Trigger */
                        <button 
                          onClick={() => setQuickBookSlot({ dayKey: day.key, dayLabel: day.label, date: day.date, hour: hour })}
                          className="w-full h-full rounded-xl opacity-0 group-hover/cell:opacity-100 bg-indigo-50/70 border border-dashed border-indigo-300 flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-600 transition">
                          <Plus className="w-3.5 h-3.5" /> Book {hour}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: EQUIPMENT GANTT MATRIX (RESOURCE ALLOCATION VIEW) */}
      {viewMode === 'gantt' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Equipment Fleet Timeline Allocation</h3>
              <p className="text-xs text-slate-400">Horizontal Gantt occupancy across instruments</p>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">Today: Monday, Aug 24</span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { name: 'Laser Confocal Microscope', category: 'Imaging', booking: '09:00 - 12:00 (Dr. Alan Turing)', percent: '40%', startOffset: '15%' },
              { name: '500MHz NMR Spectrometer', category: 'Spectroscopy', booking: '14:00 - 17:00 (Prof. Marie Curie)', percent: '35%', startOffset: '55%' },
              { name: 'Titan Krios Cryo-EM', category: 'Maintenance', booking: '08:00 - 12:00 (Technician Lock)', percent: '45%', startOffset: '0%', isLock: true },
              { name: 'NovaSeq 6000 Sequencer', category: 'Genomics', booking: '14:00 - 19:00 (Dr. Elena Rostova)', percent: '50%', startOffset: '55%' },
              { name: 'MALDI-TOF Mass Spec', category: 'Spectroscopy', booking: '10:00 - 13:00 (Dr. Sarah Connor)', percent: '35%', startOffset: '25%' },
              { name: 'Dimension Icon AFM', category: 'Nanotechnology', booking: '09:00 - 12:00 (Nano Group)', percent: '35%', startOffset: '15%' },
            ].map((row, idx) => (
              <div key={idx} className="p-4 grid grid-cols-12 items-center gap-4 hover:bg-slate-50/60 transition">
                <div className="col-span-3">
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{row.name}</h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                    {row.category}
                  </span>
                </div>

                <div className="col-span-9 relative bg-slate-100 h-10 rounded-2xl p-1 flex items-center">
                  <div 
                    style={{ width: row.percent, marginLeft: row.startOffset }}
                    className={`h-full rounded-xl px-3 flex items-center justify-between text-white text-[11px] font-bold shadow-sm transition-all ${
                      row.isLock ? 'bg-amber-600' : 'bg-indigo-600'
                    }`}>
                    <span className="truncate">{row.booking}</span>
                    <span className="text-[9px] uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: AGENDA AUDIT LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Chronological Schedule Agenda</h3>
            <span className="text-xs text-slate-500 font-bold">{filteredEvents.length} Total Sessions</span>
          </div>

          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Schedule Day & Time</th>
                <th className="p-4">Instrument Unit</th>
                <th className="p-4">Principal Researcher</th>
                <th className="p-4">Experimental Purpose</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono text-xs">
                    <span className="font-bold text-slate-900 block">{item.day} · {item.start} &rarr; {item.end}</span>
                    <span className="text-slate-400 text-[10px]">{item.duration} duration</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-xs text-indigo-600 font-semibold">{item.roomLocation}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{item.user}</span>
                    <span className="text-xs text-slate-400">{item.email}</span>
                  </td>
                  <td className="p-4 text-xs text-slate-600 max-w-xs truncate">{item.purpose}</td>
                  <td className="p-4 font-mono font-bold text-emerald-700">${item.cost}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setActiveModalEvent(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: EVENT DETAILS INSPECTOR */}
      {activeModalEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg">
                  {activeModalEvent.category} Reservation Details
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{activeModalEvent.title}</h2>
                <p className="text-xs text-slate-500 font-mono">Reference ID: #RES-{activeModalEvent.id}</p>
              </div>
              <button onClick={() => setActiveModalEvent(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Experimental Protocol & Objective</span>
                <p className="text-xs text-slate-700 leading-relaxed">{activeModalEvent.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Principal Researcher</span>
                  <span className="font-black text-slate-900 text-xs block">{activeModalEvent.user}</span>
                  <span className="text-[11px] text-slate-500 block">{activeModalEvent.email}</span>
                </div>
                <div className="p-3.5 border rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Time Window & Room</span>
                  <span className="font-black text-indigo-600 font-mono text-sm block">{activeModalEvent.start} &rarr; {activeModalEvent.end}</span>
                  <span className="text-[11px] text-slate-500 block">{activeModalEvent.roomLocation}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Calculated Chargeback</span>
                  <span className="text-xs text-slate-500">Auto-billed to researcher grant account</span>
                </div>
                <span className="text-2xl font-black text-emerald-950">${activeModalEvent.cost}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActiveModalEvent(null)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK BOOK EMPTY SLOT */}
      {quickBookSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">Instant Reservation</span>
              <h2 className="text-lg font-black text-slate-900">
                Reserve Slot on {quickBookSlot.dayLabel} at {quickBookSlot.hour}
              </h2>
            </div>

            <form onSubmit={handleQuickBookSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Instrument</label>
                <select 
                  className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                  value={bookForm.equipmentId}
                  onChange={e => setBookForm({...bookForm, equipmentId: e.target.value})}>
                  <option value="1">Laser Confocal Microscope ($45/hr)</option>
                  <option value="2">500MHz NMR Spectrometer ($80/hr)</option>
                  <option value="3">MALDI-TOF Mass Spectrometer ($85/hr)</option>
                  <option value="4">NovaSeq 6000 Sequencer ($120/hr)</option>
                  <option value="5">Atomic Force Microscope (AFM) ($60/hr)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Duration</label>
                <select 
                  className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                  value={bookForm.duration}
                  onChange={e => setBookForm({...bookForm, duration: e.target.value})}>
                  <option value="1">1 Hour Session</option>
                  <option value="2">2 Hours Session</option>
                  <option value="3">3 Hours Session</option>
                  <option value="4">4 Hours (Half Day)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Research Protocol / Grant ID</label>
                <textarea 
                  required 
                  rows={3} 
                  placeholder="Project title and protocol details..." 
                  className="w-full border rounded-xl p-2.5 text-xs"
                  onChange={e => setBookForm({...bookForm, purpose: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setQuickBookSlot(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
                  Confirm & Reserve Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}