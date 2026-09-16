import { useState, useMemo } from "react";
import { Plus, Pencil, Search, Filter, MapPin, Eye, Calendar, DollarSign, Activity, Globe, Clock, AlertTriangle, Wrench, Building2, Tag } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { Modal } from "../../common/Modal.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";

/* ================================================================== */
/*  Manager -> Equipment -> Department Equipment Management            */
/* ================================================================== */
export default function EquipmentManagement({ equipment = [], onAdd, onEdit, onReportIssue, department = "Computer Science and Engineering", technicians = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewModalItem, setViewModalItem] = useState(null);
  const [reportIssueModalItem, setReportIssueModalItem] = useState(null);

  // Extract lab location choices dynamically from real department equipment data
  const locationOptions = useMemo(() => {
    const fromData = Array.from(new Set(equipment.map((e) => e.location).filter((loc) => loc && loc.trim().length > 0)));
    return fromData.sort();
  }, [equipment]);

  // Extract category choices dynamically from real department equipment data
  const categoryOptions = useMemo(() => {
    const fromData = Array.from(new Set(equipment.map((e) => e.category).filter((cat) => cat && cat.trim().length > 0)));
    return fromData.sort();
  }, [equipment]);

  // Filter equipment based on Department, Location, Category, Status, and Search query
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Location filter
      if (selectedLocation !== "ALL" && item.location !== selectedLocation) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        const s = (item.status || "").toUpperCase();
        if (selectedStatus === "AVAILABLE" && s !== "AVAILABLE") return false;
        if (selectedStatus === "BOOKED" && s !== "BOOKED" && s !== "IN_USE") return false;
        if (selectedStatus === "UNAVAILABLE" && s !== "UNAVAILABLE" && s !== "OUT_OF_SERVICE") return false;
        if (selectedStatus === "UNDER_MAINTENANCE" && s !== "UNDER_MAINTENANCE" && s !== "MAINTENANCE") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (item.name || "").toLowerCase().includes(q);
        const catMatch = (item.category || "").toLowerCase().includes(q);
        const locMatch = (item.location || "").toLowerCase().includes(q);
        const labMatch = (item.labName || "").toLowerCase().includes(q);
        const idMatch = String(item.equipmentId || item.id || "").toLowerCase().includes(q);
        return nameMatch || catMatch || locMatch || labMatch || idMatch;
      }

      return true;
    });
  }, [equipment, selectedLocation, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div>
      <ViewHeader
        title="Department Equipment"
        subtitle={`Inventory catalog for equipment owned by ${department || "your department"}.`}
        action={
          onAdd && (
            <button onClick={onAdd} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 transition-colors shadow-sm">
              <Plus size={15} /> Add Equipment
            </button>
          )
        }
      />

      {/* Filter and Control Bar */}
      <div className="mb-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment name, category..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Department Filter (Locked to user's authorized scope) */}
        <div className="relative">
          <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            disabled
            value={department}
            className="w-full rounded-xl border border-slate-200 bg-slate-100 pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 cursor-not-allowed opacity-90"
          >
            <option value={department}>{department}</option>
          </select>
        </div>

        {/* Lab Location Dropdown Filter */}
        <div className="relative">
          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Lab Locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>📍 {loc}</option>
            ))}
          </select>
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>🏷️ {cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredEquipment.length === 0 ? (
        <EmptyState title="No equipment matches your filters" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-xs">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Equipment</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-left font-semibold px-5 py-3">Laboratory</th>
                <th className="text-left font-semibold px-5 py-3">Location</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="text-right font-semibold px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEquipment.map((e) => {
                const eqId = e.equipmentId || e.id;
                return (
                  <tr key={eqId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-lg overflow-hidden border border-slate-200 shadow-2xs">
                          {e.imageSecureUrl || e.image ? (
                            <img
                              src={e.imageSecureUrl || e.image}
                              alt={e.name}
                              className="h-full w-full object-cover"
                              onError={(err) => {
                                err.currentTarget.onerror = null;
                                err.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            "🔬"
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900">{e.name}</p>
                            {e.isShareable ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200 shrink-0">
                                <Globe size={10} /> SHARING ENABLED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500 border border-slate-200 shrink-0">
                                <Globe size={10} /> SHARING DISABLED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{e.serialNumber || `EQ-${eqId}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{e.category || "NOT RECORDED"}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">{e.labName || "NOT RECORDED"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{e.location || "NOT RECORDED"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewModalItem(e)}
                          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1.5 transition-colors inline-flex items-center gap-1"
                          title="View asset details"
                        >
                          <Eye size={13} className="text-blue-600" /> View
                        </button>

                        {onEdit && (
                          <button
                            onClick={() => onEdit(eqId)}
                            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 transition-colors inline-flex items-center gap-1"
                            title="Edit equipment specifications"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Equipment View Details Modal */}
      {viewModalItem && (
        <Modal
          title={viewModalItem.name}
          subtitle={`Department: ${department || viewModalItem.departmentName} · ID: EQ-${viewModalItem.equipmentId || viewModalItem.id}`}
          onClose={() => setViewModalItem(null)}
          wide
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🔬</span>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">{viewModalItem.name}</p>
                  <p className="text-slate-500">{viewModalItem.category || "NOT RECORDED"}</p>
                </div>
              </div>
              <StatusBadge status={viewModalItem.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Laboratory
                </p>
                <p className="font-bold text-slate-900 leading-snug">
                  {viewModalItem.labName || "NOT RECORDED"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} className="text-blue-600" /> Location
                </p>
                <p className="font-bold text-slate-900 leading-snug">
                  {viewModalItem.location || "NOT RECORDED"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={12} className="text-emerald-600" /> Next Calibration Date
                </p>
                <p className="font-bold text-slate-900">
                  {viewModalItem.nextCalibrationDue || "NOT RECORDED"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Calibration Status
                </p>
                <StatusBadge status={viewModalItem.calibrationStatus || "NOT_RECORDED"} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Specifications / Description
              </p>
              <p className="text-slate-700 leading-relaxed">
                {viewModalItem.specifications || viewModalItem.description || "NOT RECORDED"}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function EquipmentFormModal({ equipment, department, onClose, onSave }) {
  const isEdit = Boolean(equipment);
  const [form, setForm] = useState({
    name: equipment?.name || "",
    category: equipment?.category || "Analytical Equipment",
    location: equipment?.location || "Lab 1",
    specifications: equipment?.specifications || equipment?.description || "",
    status: equipment?.status || "AVAILABLE",
    hourlyRate: equipment?.hourlyRate || equipment?.hourly_rate || 500,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      title={isEdit ? `Edit ${equipment.name}` : "Add New Equipment"}
      subtitle={`Department: ${department || "Engineering"}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Equipment Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass()}
            placeholder="e.g. High-Performance Liquid Chromatograph"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location / Lab</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass()}
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Specifications</label>
          <textarea
            rows={3}
            value={form.specifications}
            onChange={(e) => setForm({ ...form, specifications: e.target.value })}
            className={inputClass()}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            {isEdit ? "Save Changes" : "Create Equipment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

