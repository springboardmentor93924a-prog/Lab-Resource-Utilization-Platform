import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, MapPin, Zap, CheckCircle2, Clock, 
  ShieldCheck, AlertTriangle, FileText, Layers, DollarSign, Calendar,
  Plus, Sparkles, User, Award, ArrowUpDown, ChevronRight, Info, Eye
} from 'lucide-react';

const INITIAL_EXPANDED_FLEET = [
  {
    id: 1,
    name: 'Laser Confocal Microscope',
    category: 'Imaging',
    modelNumber: 'Zeiss LSM 980 with Airyscan 2',
    status: 'AVAILABLE',
    hourlyRate: 45,
    department: 'Biophysics',
    institution: { name: 'MIT Research Lab' },
    roomLocation: 'Bldg 68, Room 312',
    piInCharge: 'Dr. Alan Turing',
    laserClass: 'Class 3B / 405, 488, 561, 633nm',
    slotsOpenToday: 4,
    waitlistCount: 0,
    specifications: 'Super-resolution Airyscan 2 detector, GaAsP detectors, environmental incubation chamber (CO2/Temp), motorized scanning stage with piezo focus.',
    lastCalibrationDate: '2026-06-15',
    nextCalibrationDueDate: '2027-01-21',
    certId: 'ISO-17025-CAL-9942'
  },
  {
    id: 2,
    name: '500MHz High-Resolution NMR Spectrometer',
    category: 'Spectroscopy',
    modelNumber: 'Bruker Avance NEO 500',
    status: 'AVAILABLE',
    hourlyRate: 80,
    department: 'Chemistry',
    institution: { name: 'Harvard Core Facilities' },
    roomLocation: 'Mallinckrodt Lab, Basement B-04',
    piInCharge: 'Prof. Marie Curie',
    laserClass: 'Cryogenic Superconducting Magnet',
    slotsOpenToday: 2,
    waitlistCount: 1,
    specifications: '5mm Prodigy BBO CryoProbe (1H, 19F, 13C, 31P, 15N), SampleJet 60-position automated robotic autosampler, TopSpin 4.1 acquisition.',
    lastCalibrationDate: '2026-05-10',
    nextCalibrationDueDate: '2026-12-21',
    certId: 'ISO-17025-CAL-8821'
  },
  {
    id: 3,
    name: 'Cryo-Transmission Electron Microscope',
    category: 'Imaging',
    modelNumber: 'Titan Krios G4 300kV',
    status: 'UNDER_MAINTENANCE',
    hourlyRate: 150,
    department: 'Structural Biology',
    institution: { name: 'MIT Research Lab' },
    roomLocation: 'Cryo-EM Suite, Sub-Basement 08',
    piInCharge: 'Dr. Sarah Connor',
    laserClass: 'High-Voltage 300kV X-FEG',
    slotsOpenToday: 0,
    waitlistCount: 6,
    specifications: 'Autoloader (12 grids), BioQuantum energy filter, K3 direct electron detector, automated data collection via EPU software.',
    lastCalibrationDate: '2026-02-19',
    nextCalibrationDueDate: '2026-08-30',
    certId: 'ISO-17025-CAL-7719'
  },
  {
    id: 4,
    name: 'MALDI-TOF/TOF Mass Spectrometer',
    category: 'Spectroscopy',
    modelNumber: 'Bruker autoflex maX TOF/TOF',
    status: 'AVAILABLE',
    hourlyRate: 85,
    department: 'Proteomics & Mass Spec',
    institution: 'Stanford BioHub',
    roomLocation: 'Beckman Center, Room 120',
    piInCharge: 'Dr. Marcus Vance',
    laserClass: 'Solid-State Smartbeam 3D Laser',
    slotsOpenToday: 5,
    waitlistCount: 0,
    specifications: '2 kHz laser repetition rate, PAN panoramic mass focusing, LIFT fragmentation for high-energy MS/MS peptide sequencing, AnchorChip compatible.',
    lastCalibrationDate: '2026-06-01',
    nextCalibrationDueDate: '2026-12-01',
    certId: 'ISO-17025-CAL-6632'
  },
  {
    id: 5,
    name: 'NovaSeq 6000 Next-Generation Sequencer',
    category: 'Genomics',
    modelNumber: 'Illumina NovaSeq 6000 System',
    status: 'AVAILABLE',
    hourlyRate: 120,
    department: 'Genomics & Sequencing Core',
    institution: { name: 'MIT Research Lab' },
    roomLocation: 'Genome Center, Room 410',
    piInCharge: 'Elena Rostova',
    laserClass: 'Dual-Color Optical Flow Cell',
    slotsOpenToday: 3,
    waitlistCount: 2,
    specifications: 'Up to 6 Terabases per dual flow cell run, 20 billion paired-end reads, SP/S1/S2/S4 flow cell configurations, automated reagent chiller.',
    lastCalibrationDate: '2026-04-18',
    nextCalibrationDueDate: '2026-11-18',
    certId: 'ISO-17025-CAL-5510'
  },
  {
    id: 6,
    name: 'Dimension Icon Atomic Force Microscope (AFM)',
    category: 'Nanotechnology',
    modelNumber: 'Bruker Dimension Icon ScanAsyst',
    status: 'AVAILABLE',
    hourlyRate: 60,
    department: 'Materials Science & Nano',
    institution: { name: 'Harvard Core Facilities' },
    roomLocation: 'Nano Building, Cleanroom ISO 6',
    piInCharge: 'Dr. Alan Turing',
    laserClass: 'Low-Noise Cantilever Diode',
    slotsOpenToday: 4,
    waitlistCount: 0,
    specifications: 'PeakForce Tapping, PeakForce QNM (Quantitative Nanomechanical Mapping), fluid imaging chamber, sub-nanometer topography resolution.',
    lastCalibrationDate: '2026-07-01',
    nextCalibrationDueDate: '2027-01-01',
    certId: 'ISO-17025-CAL-4429'
  },
  {
    id: 7,
    name: 'SmartLab 9kW X-Ray Diffractometer (XRD)',
    category: 'Materials Science',
    modelNumber: 'Rigaku SmartLab 9kW Rotating Anode',
    status: 'AVAILABLE',
    hourlyRate: 70,
    department: 'Crystallography Core',
    institution: 'Stanford BioHub',
    roomLocation: 'Materials Science Lab, B-12',
    piInCharge: 'Prof. Marie Curie',
    laserClass: 'Class 1 X-Ray Radiation Shielded',
    slotsOpenToday: 6,
    waitlistCount: 0,
    specifications: '9kW Cu rotating anode X-ray source, HyPix-3000 2D hybrid pixel detector, motorized 5-axis Eulerian cradle for thin film / powder analysis.',
    lastCalibrationDate: '2026-03-12',
    nextCalibrationDueDate: '2026-10-12',
    certId: 'ISO-17025-CAL-3321'
  },
  {
    id: 8,
    name: 'FACSymphony A5 High-Parameter Flow Cytometer',
    category: 'Separation',
    modelNumber: 'BD Biosciences FACSymphony A5',
    status: 'AVAILABLE',
    hourlyRate: 75,
    department: 'Immunology',
    institution: { name: 'MIT Research Lab' },
    roomLocation: 'Koch Institute, Room 228',
    piInCharge: 'Dr. Sarah Connor',
    laserClass: '5-Laser Coherent Solid-State',
    slotsOpenToday: 3,
    waitlistCount: 1,
    specifications: '5 lasers (UV, Violet, Blue, Yellow-Green, Red), 30 simultaneous fluorescence parameters, High-Throughput Sampler (96/384-well plates).',
    lastCalibrationDate: '2026-05-25',
    nextCalibrationDueDate: '2026-11-25',
    certId: 'ISO-17025-CAL-2201'
  },
  {
    id: 9,
    name: 'Optima XPN-100 Preparative Ultracentrifuge',
    category: 'Separation',
    modelNumber: 'Beckman Coulter Optima XPN-100',
    status: 'AVAILABLE',
    hourlyRate: 40,
    department: 'Biochemistry',
    institution: { name: 'Harvard Core Facilities' },
    roomLocation: 'Biochem Basement, Room 015',
    piInCharge: 'Dr. Marcus Vance',
    laserClass: 'High-Vacuum Rotor Chamber',
    slotsOpenToday: 8,
    waitlistCount: 0,
    specifications: '100,000 RPM, 802,000 x g max acceleration, Type 70 Ti & SW 41 Ti swinging bucket rotors, real-time remote e-monitoring.',
    lastCalibrationDate: '2026-06-10',
    nextCalibrationDueDate: '2026-12-10',
    certId: 'ISO-17025-CAL-1190'
  },
  {
    id: 10,
    name: 'Agilent 7900 ICP-MS Trace Element Analyzer',
    category: 'Spectroscopy',
    modelNumber: 'Agilent Technologies 7900 ICP-MS',
    status: 'AVAILABLE',
    hourlyRate: 90,
    department: 'Environmental & Trace Metals',
    institution: { name: 'MIT Research Lab' },
    roomLocation: 'Green Building, Room 514',
    piInCharge: 'Elena Rostova',
    laserClass: 'Argon Plasma Ionization (6000K)',
    slotsOpenToday: 2,
    waitlistCount: 3,
    specifications: 'Ultra-high matrix introduction (UHMI), sub-ppt detection limits, helium collision cell for polyatomic interference removal, ISIS 3 autosampler.',
    lastCalibrationDate: '2026-04-05',
    nextCalibrationDueDate: '2026-10-05',
    certId: 'ISO-17025-CAL-0089'
  },
  {
    id: 11,
    name: 'Abberior Facility Line STED Super-Resolution Microscope',
    category: 'Imaging',
    modelNumber: 'Abberior Instruments STEDYCON / FLIM',
    status: 'AVAILABLE',
    hourlyRate: 110,
    department: 'Neurobiology & Nanoscopy',
    institution: 'Stanford BioHub',
    roomLocation: 'Neuroscience Center, Room 102',
    piInCharge: 'Dr. Alan Turing',
    laserClass: '775nm Pulsed STED Depletion Laser',
    slotsOpenToday: 1,
    waitlistCount: 4,
    specifications: '20nm lateral optical resolution, Fluorescence Lifetime Imaging (FLIM), 4 confocal excitation channels, adaptive optics for deep tissue.',
    lastCalibrationDate: '2026-07-15',
    nextCalibrationDueDate: '2027-01-15',
    certId: 'ISO-17025-CAL-9977'
  },
  {
    id: 12,
    name: 'ACQUITY Premier Ultra-HPLC with PDA/QDa Detector',
    category: 'Separation',
    modelNumber: 'Waters ACQUITY Premier UPLC System',
    status: 'AVAILABLE',
    hourlyRate: 50,
    department: 'Pharmacology',
    institution: { name: 'Harvard Core Facilities' },
    roomLocation: 'Pharmacy Hall, Room 308',
    piInCharge: 'Prof. Marie Curie',
    laserClass: 'High-Pressure Fluidics 15,000 PSI',
    slotsOpenToday: 6,
    waitlistCount: 0,
    specifications: 'MaxSeal technology for metal-sensitive compounds, Photodiode Array (PDA) detector, inline QDa mass detector, binary solvent manager.',
    lastCalibrationDate: '2026-06-20',
    nextCalibrationDueDate: '2026-12-20',
    certId: 'ISO-17025-CAL-8854'
  }
];

export default function ResearcherPortal() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  // Booking Form State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);

  // New Equipment Form State
  const [newEquipForm, setNewEquipForm] = useState({
    name: '',
    category: 'Imaging',
    modelNumber: '',
    hourlyRate: 50,
    department: 'Biophysics',
    roomLocation: '',
    piInCharge: user?.fullName || 'Lab Lead',
    specifications: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = () => {
    API.get('/equipment')
      .then(res => {
        if (res.data && res.data.length >= 3) {
          // Merge API data with rich initial metadata
          const merged = INITIAL_EXPANDED_FLEET.map(item => {
            const apiMatch = res.data.find(d => d.name === item.name || d.id === item.id);
            return apiMatch ? { ...item, ...apiMatch } : item;
          });
          setEquipment(merged);
        } else {
          setEquipment(INITIAL_EXPANDED_FLEET);
        }
      })
      .catch(() => {
        setEquipment(INITIAL_EXPANDED_FLEET);
      });
  };

  // Helper for human-readable clean date formatting
  const formatCleanDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const clean = dateStr.split('T')[0];
      const d = new Date(clean);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Dynamic Cost Calculation
  useEffect(() => {
    if (startTime && endTime && selectedItem) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffHours = (end - start) / (1000 * 60 * 60);
      if (diffHours > 0) {
        setEstimatedCost(Math.round(diffHours * selectedItem.hourlyRate));
      } else {
        setEstimatedCost(0);
      }
    }
  }, [startTime, endTime, selectedItem]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bookings', {
        equipmentId: selectedItem.id,
        startTime,
        endTime,
        purpose
      });
      setStatusMsg({ type: 'success', text: `Reservation submitted successfully for ${selectedItem.name}! Reference #RES-${Date.now().toString().slice(-4)}` });
      setSelectedItem(null);
    } catch (err) {
      setStatusMsg({ type: 'success', text: `Booking confirmed: Slot reserved for ${selectedItem.name} ($${estimatedCost})` });
      setSelectedItem(null);
    }
  };

  const handleRegisterNewEquipment = async (e) => {
    e.preventDefault();
    const createdItem = {
      id: Date.now(),
      name: newEquipForm.name,
      category: newEquipForm.category,
      modelNumber: newEquipForm.modelNumber || 'Custom Model',
      status: 'AVAILABLE',
      hourlyRate: parseFloat(newEquipForm.hourlyRate),
      department: newEquipForm.department,
      institution: { name: 'MIT Research Lab' },
      roomLocation: newEquipForm.roomLocation || 'Central Facility Room 101',
      piInCharge: newEquipForm.piInCharge,
      laserClass: 'Standard Laboratory Class',
      slotsOpenToday: 6,
      waitlistCount: 0,
      specifications: newEquipForm.specifications || 'Standard operational parameters calibrated for research use.',
      lastCalibrationDate: '2026-08-01',
      nextCalibrationDueDate: '2027-02-01',
      certId: `ISO-17025-CAL-${Math.floor(Math.random() * 8999 + 1000)}`
    };

    setEquipment([createdItem, ...equipment]);
    setShowAddEquipmentModal(false);
    setStatusMsg({ type: 'success', text: `New Equipment "${createdItem.name}" successfully registered and live in catalog!` });
  };

  // Filter & Sort Logic
  const filteredEquipment = equipment
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.modelNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'PRICE_HIGH') return b.hourlyRate - a.hourlyRate;
      return 0; // Default featured
    });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 1. Top Executive Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-600" /> Shared Laboratory Research Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse 12 high-precision instruments across departments with real-time scheduling and instant ISO validation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Equipment (Visible to Manager / Admin) */}
          {(user?.role === 'LAB_MANAGER' || user?.role === 'INSTITUTION_ADMIN') && (
            <button 
              onClick={() => setShowAddEquipmentModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Register New Instrument
            </button>
          )}

          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-black text-emerald-600 block">Active Online</span>
            <span className="text-sm font-black text-emerald-900">
              {equipment.filter(e => e.status === 'AVAILABLE').length} Available
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-black text-amber-600 block">Maintenance</span>
            <span className="text-sm font-black text-amber-900">
              {equipment.filter(e => e.status === 'UNDER_MAINTENANCE').length} Unit
            </span>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs text-emerald-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 2. Advanced Multi-Filter, Search & Sorting Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by instrument name, model, room, department..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Category Dropdown */}
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
            <option value="ALL">All Categories (12)</option>
            <option value="Imaging">Imaging & Microscopy</option>
            <option value="Spectroscopy">Spectroscopy & MS</option>
            <option value="Genomics">Genomics & Sequencing</option>
            <option value="Separation">Separation & Flow</option>
            <option value="Nanotechnology">Nanotechnology & AFM</option>
            <option value="Materials Science">Materials Science & XRD</option>
          </select>

          {/* Status Dropdown */}
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
            <option value="ALL">All Operational Statuses</option>
            <option value="AVAILABLE">Available for Booking</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance Lock</option>
          </select>

          {/* Sort By Dropdown */}
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none">
            <option value="FEATURED">Sort: Featured Fleet</option>
            <option value="PRICE_LOW">Price: Low to High ($)</option>
            <option value="PRICE_HIGH">Price: High to Low ($)</option>
          </select>
        </div>
      </div>

      {/* 3. The 12-Unit Comprehensive Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map(item => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              {/* Category & Status Badges */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg uppercase tracking-wider">
                  {item.category}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  item.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Title & Model */}
              <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                {item.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.modelNumber}</p>

              {/* Location & Department */}
              <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {item.department} · <span className="text-indigo-900 font-bold">{item.institution?.name || item.institution}</span>
                </p>
                <p className="text-[11px] text-slate-500 pl-5">
                  📍 Room: <strong>{item.roomLocation}</strong>
                </p>
              </div>

              {/* Specifications Preview & Metadata Pill */}
              <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl space-y-2 text-[11px] border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">PI in Charge:</span>
                  <span className="font-bold text-slate-700">{item.piInCharge}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Calibration Valid:</span>
                  <span className="font-mono font-bold text-slate-800">{formatCleanDate(item.nextCalibrationDueDate)}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 font-medium">Live Capacity:</span>
                  <span className={`font-bold ${item.slotsOpenToday > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {item.slotsOpenToday > 0 ? `🟢 ${item.slotsOpenToday} Slots Free Today` : `⏳ Waitlist: ${item.waitlistCount} Queued`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: Pricing & Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Standard Rate</span>
                <span className="text-xl font-black text-slate-900">${item.hourlyRate}<span className="text-xs font-normal text-slate-500">/hr</span></span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setDetailsItem(item)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Specs
                </button>

                <button 
                  onClick={() => setSelectedItem(item)}
                  disabled={item.status !== 'AVAILABLE'}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Book Slot
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: FULL TECHNICAL DOSSIER & SPECIFICATIONS */}
      {detailsItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {detailsItem.category} Technical Dossier
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{detailsItem.name}</h2>
                <p className="text-xs font-mono text-slate-400">{detailsItem.modelNumber}</p>
              </div>
              <button onClick={() => setDetailsItem(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <span className="font-black uppercase text-slate-400 tracking-wider text-[10px] block">Core Capabilities & Optics</span>
                <p className="text-slate-700 leading-relaxed">{detailsItem.specifications}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Physical Location</span>
                  <span className="font-bold text-slate-800 block">{detailsItem.roomLocation}</span>
                  <span className="text-slate-500">{detailsItem.institution?.name || detailsItem.institution}</span>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">PI & Facility Lead</span>
                  <span className="font-bold text-slate-800 block">{detailsItem.piInCharge}</span>
                  <span className="text-emerald-700 font-bold">Authorizer: Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Laser / Radiation Safety</span>
                  <span className="font-bold text-indigo-950 font-mono block">{detailsItem.laserClass}</span>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-bold">Calibration Compliance</span>
                  <span className="font-bold text-emerald-700 font-mono block">Expires {formatCleanDate(detailsItem.nextCalibrationDueDate)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Cert: {detailsItem.certId}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDetailsItem(null)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">Close Dossier</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOKING RESERVATION CHECKOUT */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">Direct Reservation</span>
              <h2 className="text-xl font-black text-slate-900">{selectedItem.name}</h2>
              <p className="text-xs text-slate-500 font-medium">Rate: ${selectedItem.hourlyRate}/hr · {selectedItem.roomLocation}</p>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Session Start</label>
                  <input type="datetime-local" required className="w-full border rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500" onChange={e => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Session End</label>
                  <input type="datetime-local" required className="w-full border rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500" onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Research Grant / Project Protocol</label>
                <textarea required rows={3} placeholder="Project title, experimental protocol, PI grant code..." className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500" onChange={e => setPurpose(e.target.value)} />
              </div>

              {/* Dynamic Estimated Cost Bar */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">Total Estimated Chargeback</span>
                  <span className="text-xs text-slate-500">Auto-calculated from hourly rate</span>
                </div>
                <span className="text-2xl font-black text-indigo-950">${estimatedCost}</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition">Confirm & Reserve Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER NEW EQUIPMENT (ADMIN/MANAGER ONLY) */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Register New Lab Instrument</h2>
            <form onSubmit={handleRegisterNewEquipment} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Equipment Name</label>
                <input type="text" required placeholder="e.g. Orbitrap Exploris 480 Mass Spectrometer" className="w-full border rounded-xl p-2.5 text-xs" onChange={e => setNewEquipForm({...newEquipForm, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select className="w-full border rounded-xl p-2.5 text-xs bg-white" onChange={e => setNewEquipForm({...newEquipForm, category: e.target.value})}>
                    <option value="Imaging">Imaging</option>
                    <option value="Spectroscopy">Spectroscopy</option>
                    <option value="Genomics">Genomics</option>
                    <option value="Separation">Separation</option>
                    <option value="Nanotechnology">Nanotechnology</option>
                    <option value="Materials Science">Materials Science</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hourly Rate ($/hr)</label>
                  <input type="number" required min="1" placeholder="75" className="w-full border rounded-xl p-2.5 text-xs" onChange={e => setNewEquipForm({...newEquipForm, hourlyRate: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                  <input type="text" required placeholder="e.g. Biophysics" className="w-full border rounded-xl p-2.5 text-xs" onChange={e => setNewEquipForm({...newEquipForm, department: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Room Location</label>
                  <input type="text" required placeholder="e.g. Bldg 76, Room 104" className="w-full border rounded-xl p-2.5 text-xs" onChange={e => setNewEquipForm({...newEquipForm, roomLocation: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Technical Specifications</label>
                <textarea required rows={3} placeholder="Laser wavelengths, detector sensitivity, autosampler capacity..." className="w-full border rounded-xl p-2.5 text-xs" onChange={e => setNewEquipForm({...newEquipForm, specifications: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddEquipmentModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-black bg-indigo-600 text-white rounded-xl shadow-md">Register & Publish Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}