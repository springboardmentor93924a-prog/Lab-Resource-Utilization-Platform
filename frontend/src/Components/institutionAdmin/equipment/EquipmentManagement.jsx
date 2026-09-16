import { useState, useEffect, useMemo } from "react";
import { Search, Eye, ShieldCheck, Tag, MapPin, X, Building2, Pencil, Check } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { inputClass } from "../../common/Field.jsx";
import { API_BASE_URL } from "../../../api/client.js";

const DEPARTMENT_LAB_LOCATIONS = {
  CSE: [
    "CSE Lab 1 (Computer Center & Software Engg Lab 102)",
    "CSE Lab 2 (Systems & Networking Lab 103)",
    "CSE Lab 3 (AI & Data Analytics Lab 401)",
  ],
  EEE: [
    "EEE Lab 1 (Power Electronics & Drives Lab 105)",
    "EEE Lab 2 (Electrical Machines & Circuits Lab 108)",
    "EEE Lab 3 (Control Systems & Automation Lab 201)",
  ],
  ECE: [
    "ECE Lab 1 (VLSI & Microprocessor Lab 204)",
    "ECE Lab 2 (Communication & RF Wireless Lab 208)",
    "ECE Lab 3 (Embedded Systems & IoT Lab 305)",
  ],
  IT: [
    "IT Lab 1 (Cloud Computing & DevOps Lab 302)",
    "IT Lab 2 (Cyber Security & Forensics Lab 306)",
    "IT Lab 3 (Web Technology & Fullstack Lab 310)",
  ],
  "AI & DS": [
    "AI&DS Lab 1 (Big Data Analytics Lab 401)",
    "AI&DS Lab 2 (Machine Learning & Deep Learning Lab 405)",
    "AI&DS Lab 3 (Natural Language & Vision Lab 408)",
  ],
  Mechanical: [
    "Mechanical Lab 1 (CAD/CAM & Robotics Lab, Bay 2)",
    "Mechanical Lab 2 (Thermal & Fluid Dynamics Lab, Bay 4)",
    "Mechanical Lab 3 (Mechatronics & CNC Lab, Bay 6)",
  ],
  Civil: [
    "Civil Lab 1 (Structural & Concrete Testing Lab, Block C)",
    "Civil Lab 2 (Surveying & GIS Spatial Lab, Block C-101)",
    "Civil Lab 3 (Geotechnical & Environmental Lab, Block C-102)",
  ],
};

const DEPARTMENTS = [
  { id: "ALL", name: "All Departments" },
  { id: "CSE", name: "Computer Science & Engineering" },
  { id: "EEE", name: "Electrical & Electronics Engineering" },
  { id: "ECE", name: "Electronics & Communication Engineering" },
  { id: "IT", name: "Information Technology" },
  { id: "AI & DS", name: "Artificial Intelligence & Data Science" },
  { id: "Mechanical", name: "Mechanical Engineering" },
  { id: "Civil", name: "Civil Engineering" },
];

export default function EquipmentManagement({ user, initialDept }) {
  const instId = user?.institutionId;
  const instName = user?.institution || "";

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState(initialDept || "ALL");
  const [labFilter, setLabFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (initialDept) {
      setDeptFilter(initialDept);
      setLabFilter("ALL");
    }
  }, [initialDept]);

  useEffect(() => {
    fetchData();
  }, [instId]);

  const handleDeptChange = (newDept) => {
    setDeptFilter(newDept);
    setLabFilter("ALL");
  };

  const currentLabs = useMemo(() => {
    if (deptFilter === "ALL") {
      return Object.values(DEPARTMENT_LAB_LOCATIONS).flat();
    }
    return DEPARTMENT_LAB_LOCATIONS[deptFilter] || [];
  }, [deptFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("labflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const eqRes = await fetch(`${API_BASE_URL}/equipment/search?institutionId=${instId}`, { headers });
      let liveData = [];
      if (eqRes.ok) {
        const data = await eqRes.json();
        liveData = Array.isArray(data) ? data : [];
      }
      setEquipmentList(liveData);
    } catch (err) {
      console.error("Failed to load institution equipment network:", err);
      setEquipmentList([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (equipment) => {
    setEditingEquipment(equipment);
    setEditForm({
      name: equipment.name || "",
      manufacturer: equipment.manufacturer || "",
      model: equipment.model || "",
      category: equipment.category || "General",
      hourlyRate: equipment.hourlyRate ?? 0,
      status: equipment.status || "AVAILABLE",
      isShareable: Boolean(equipment.isShareable),
      location: equipment.location || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEquipment) return;
    const token = localStorage.getItem("labflow_token");
    const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};

    const updatedItem = {
      ...editingEquipment,
      ...editForm,
      hourlyRate: Number(editForm.hourlyRate),
    };

    if (editingEquipment.equipmentId) {
      try {
        await fetch(`${API_BASE_URL}/equipment/${editingEquipment.equipmentId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatedItem),
        });
      } catch (err) {
        console.warn("Backend edit sync fallback:", err);
      }
    }

    setEquipmentList((prev) =>
      prev.map((item) => ((item.id || item.equipmentId) === (editingEquipment.id || editingEquipment.equipmentId) ? updatedItem : item))
    );

    if (selectedDetail && (selectedDetail.id || selectedDetail.equipmentId) === (editingEquipment.id || editingEquipment.equipmentId)) {
      setSelectedDetail(updatedItem);
    }

    setEditingEquipment(null);
  };

  const categories = ["ALL", ...new Set(equipmentList.map((e) => e.category).filter(Boolean))];

  const filteredRows = equipmentList.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const targetDept = deptFilter.toLowerCase();
    const eqDept = (e.department || e.departmentName || "").toLowerCase();

    let matchesDept = deptFilter === "ALL";
    if (!matchesDept) {
      if (targetDept.includes("computer") || targetDept.includes("cse")) {
        matchesDept = eqDept.includes("computer") || eqDept.includes("cse");
      } else if (targetDept.includes("electrical") || targetDept.includes("eee")) {
        matchesDept = eqDept.includes("electrical") || eqDept.includes("eee");
      } else if (targetDept.includes("electronics") || targetDept.includes("ece")) {
        matchesDept = eqDept.includes("electronics") || eqDept.includes("ece");
      } else if (targetDept.includes("information") || targetDept.includes("it")) {
        matchesDept = eqDept.includes("information") || eqDept.includes("it");
      } else if (targetDept.includes("artificial") || targetDept.includes("ai")) {
        matchesDept = eqDept.includes("artificial") || eqDept.includes("ai");
      } else if (targetDept.includes("mechanical")) {
        matchesDept = eqDept.includes("mechanical");
      } else if (targetDept.includes("civil")) {
        matchesDept = eqDept.includes("civil");
      } else {
        matchesDept = eqDept === targetDept;
      }
    }

    const eqLoc = (e.location || "").toLowerCase();
    let matchesLab = labFilter === "ALL";
    if (!matchesLab) {
      const targetLab = labFilter.toLowerCase();
      matchesLab = eqLoc.includes(targetLab) || targetLab.includes(eqLoc);
    }

    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;

    return matchesSearch && matchesDept && matchesLab && matchesCategory && matchesStatus;
  });

  return (
    <div>
      <ViewHeader
        title="Institution Equipment Network"
        subtitle={`Every piece of equipment across departments in ${instName}.`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Instruments</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{equipmentList.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Available Now</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {equipmentList.filter((e) => e.status === "AVAILABLE").length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Under Maintenance</p>
          <p className="mt-1 text-2xl font-black text-amber-700">
            {equipmentList.filter((e) => e.status === "UNDER_MAINTENANCE").length}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Sharing Enabled</p>
          <p className="mt-1 text-2xl font-black text-blue-700">
            {equipmentList.filter((e) => e.isShareable).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar with Department Dropdown & Dynamic Lab Location Dropdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment by name, category, or lab location…"
            className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Select Dropdown */}
          <div className="flex items-center gap-1.5">
            <Building2 size={16} className="text-blue-600" />
            <select
              value={deptFilter}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="rounded-xl border border-blue-200 bg-blue-50/40 text-blue-900 text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Lab Location Select Dropdown */}
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-emerald-600" />
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="rounded-xl border border-emerald-200 bg-emerald-50/40 text-emerald-900 text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold max-w-[260px]"
            >
              <option value="ALL">
                {deptFilter === "ALL" ? "📍 All Lab Locations" : `📍 All ${deptFilter} Labs`}
              </option>
              {currentLabs.map((labLoc) => (
                <option key={labLoc} value={labLoc}>
                  {labLoc}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories
              .filter((c) => c !== "ALL")
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">🟢 AVAILABLE</option>
            <option value="BOOKED">🔵 BOOKED</option>
            <option value="UNDER_MAINTENANCE">🟡 UNDER MAINTENANCE</option>
            <option value="UNAVAILABLE">🔴 UNAVAILABLE</option>
          </select>
        </div>
      </div>

      {/* Equipment Network Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3"></div>
            <p className="text-sm font-medium">Loading live equipment network from backend…</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-600">No equipment found matching criteria</p>
            <p className="text-xs mt-1">Try clearing search or changing department filters.</p>
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Equipment / Instrument</th>
                <th className="text-left font-semibold px-4 py-3">Department & Lab Location</th>
                <th className="text-left font-semibold px-4 py-3">Category</th>
                <th className="text-left font-semibold px-4 py-3">Usage Rate</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3 min-w-[180px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((e) => (
                <tr key={e.id || e.equipmentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                        {e.image || "🖥️"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{e.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {e.id || `EQ-${e.equipmentId}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                        <MapPin size={12} className="text-blue-500" />
                        {e.location || ""}
                      </span>
                      <span className="text-[11px] text-slate-400">{e.department || e.departmentName || "Engineering"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      <Tag size={10} /> {e.category || "General"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {e.hourlyRate != null ? `₹${e.hourlyRate}/hr` : "Free Access"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDetail(e)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 transition-colors shadow-2xs whitespace-nowrap"
                      >
                        <Eye size={12} className="text-blue-600" /> View Details
                      </button>
                      <button
                        onClick={() => openEditModal(e)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 transition-colors shadow-2xs whitespace-nowrap"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Equipment Details Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-3xl flex-shrink-0 shadow-xs">
                  {selectedDetail.image || "🖥️"}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedDetail.name}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {selectedDetail.category || "General"} · {selectedDetail.department || selectedDetail.departmentName || "Engineering"}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={selectedDetail.status || "AVAILABLE"} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6 text-center leading-relaxed font-medium px-2">
              {selectedDetail.description || "High precision scientific instrument for advanced research and experiments."}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100/80 flex flex-col justify-center items-center">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Technical Specifications</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 leading-snug max-w-[240px]">
                  {selectedDetail.specs || `SN: ${selectedDetail.id || `EQ-${selectedDetail.equipmentId}`}`}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100/80 flex flex-col justify-center items-center">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Exact Lab Location</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 flex items-center justify-center gap-1">
                  <MapPin size={14} className="text-blue-500" />
                  {selectedDetail.location || ""}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100/80 flex flex-col justify-center items-center">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Calibration Status</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {selectedDetail.calibrationStatus || "NOT RECORDED"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100/80 flex flex-col justify-center items-center">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Next Calibration Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedDetail.nextCalibrationDue || selectedDetail.nextCalibration || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="rounded-2xl bg-blue-50/50 p-3.5 border border-blue-100 flex flex-col justify-center items-center">
                <p className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest">Hourly Usage Fee</p>
                <p className="mt-0.5 text-base font-black text-blue-900">
                  {selectedDetail.hourlyRate != null ? `₹${selectedDetail.hourlyRate}/hr` : "Free Access"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 flex flex-col justify-center items-center">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Cross-Institution Sharing</p>
                <p className="mt-0.5 text-xs font-bold flex items-center justify-center gap-1">
                  {selectedDetail.isShareable ? (
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> SHARING ENABLED</span>
                  ) : (
                    <span className="text-slate-500 font-extrabold flex items-center gap-1"><ShieldCheck size={14} className="text-slate-400" /> SHARING DISABLED</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => openEditModal(selectedDetail)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 text-xs transition-colors shadow-sm"
              >
                <Pencil size={14} /> Edit Equipment
              </button>
              <button
                onClick={() => setSelectedDetail(null)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 text-xs transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Equipment Details</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {editingEquipment.id || `EQ-${editingEquipment.equipmentId}`}
                </p>
              </div>
              <button
                onClick={() => setEditingEquipment(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Usage Rate (₹)</label>
                  <input
                    type="number"
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lab Location / Room</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingEquipment(null)}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-xs transition-colors shadow-sm"
              >
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
