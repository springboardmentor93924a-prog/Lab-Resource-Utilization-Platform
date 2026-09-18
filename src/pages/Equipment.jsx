import { useEffect, useMemo, useState } from "react";
import {
  getAllEquipment,
  addEquipment as addEquipmentApi,
  updateEquipment as updateEquipmentApi,
  deleteEquipment as deleteEquipmentApi,
} from "../api/equipmentApi";
import { getAllInstitutions } from "../api/institutionApi";
import { getDepartmentsByInstitution } from "../api/departmentApi";
import { extractErrorMessage } from "../api/client";
import { EQUIPMENT_STATUSES } from "../utils/constants";

// Roles allowed to add/edit equipment (EquipmentController @PreAuthorize)
const WRITE_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN"];
// Roles allowed to delete equipment
const DELETE_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER"];

const emptyForm = {
  equipmentName: "",
  assetTag: "",
  categoryId: "",
  categoryName: "",
  institutionId: "",
  departmentId: "",
  status: "AVAILABLE",
  hourlyRate: "",
  purchaseDate: "",
  purchaseCost: "",
  warrantyExpiry: "",
};

function Equipment({ userRole, showToast }) {
  const [equipment, setEquipment] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const canWrite = WRITE_ROLES.includes(userRole);
  const canDelete = DELETE_ROLES.includes(userRole);

  const loadEquipment = () => {
    setLoading(true);
    getAllEquipment()
      .then(setEquipment)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load equipment.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEquipment();
    getAllInstitutions().then(setInstitutions).catch(() => setInstitutions([]));
  }, []);

  useEffect(() => {
    if (!form.institutionId) {
      setDepartments([]);
      return;
    }
    getDepartmentsByInstitution(form.institutionId)
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, [form.institutionId]);

  // The backend has no category-listing endpoint, so we derive the known
  // categories from whatever equipment is already loaded. Admins can still
  // type a brand new category id/name when adding equipment.
  const knownCategories = useMemo(() => {
    const map = new Map();
    equipment.forEach((e) => {
      if (e.categoryId) map.set(e.categoryId, e.categoryName);
    });
    return Array.from(map.entries()).map(([categoryId, categoryName]) => ({
      categoryId,
      categoryName,
    }));
  }, [equipment]);

  const available = equipment.filter((e) => e.status === "AVAILABLE").length;
  const inUse = equipment.filter((e) => e.status === "IN_USE" || e.status === "BOOKED").length;
  const maintenance = equipment.filter((e) => e.status === "UNDER_MAINTENANCE").length;

  const filteredEquipment = equipment.filter((item) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      (item.equipmentName || "").toLowerCase().includes(searchText) ||
      (item.assetTag || "").toLowerCase().includes(searchText) ||
      (item.departmentName || "").toLowerCase().includes(searchText);
    const matchesCategory = categoryFilter === "All" || item.categoryName === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAddForm(false);
  };

  const openEdit = (item) => {
    setForm({
      equipmentName: item.equipmentName || "",
      assetTag: item.assetTag || "",
      categoryId: item.categoryId || "",
      categoryName: item.categoryName || "",
      institutionId: item.institutionId || "",
      departmentId: item.departmentId || "",
      status: item.status || "AVAILABLE",
      hourlyRate: item.hourlyRate ?? "",
      purchaseDate: item.purchaseDate || "",
      purchaseCost: item.purchaseCost ?? "",
      warrantyExpiry: item.warrantyExpiry || "",
    });
    setEditingId(item.equipmentId);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      equipmentName: form.equipmentName,
      assetTag: form.assetTag,
      categoryId: Number(form.categoryId),
      institutionId: Number(form.institutionId),
      departmentId: Number(form.departmentId),
      status: form.status,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      purchaseDate: form.purchaseDate || null,
      purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
      warrantyExpiry: form.warrantyExpiry || null,
    };

    try {
      if (editingId) {
        await updateEquipmentApi(editingId, payload);
        showToast?.(`Equipment "${form.equipmentName}" updated.`, "success");
      } else {
        await addEquipmentApi(payload);
        showToast?.(`Equipment "${form.equipmentName}" added.`, "success");
      }
      resetForm();
      loadEquipment();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to save equipment."), "warning");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.equipmentName}"? This cannot be undone.`)) return;
    try {
      await deleteEquipmentApi(item.equipmentId);
      showToast?.(`Equipment "${item.equipmentName}" deleted.`, "success");
      loadEquipment();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to delete equipment."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Equipment Inventory</h1>
          <p style={subStyle}>Manage and monitor laboratory equipment</p>
        </div>

        {canWrite && (
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowAddForm(true); }} style={primaryBtn}>
            + Add Equipment
          </button>
        )}
      </div>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      <div style={statsRow}>
        <StatCard icon="▣" title="Total Equipment" value={equipment.length} bg="#eaf2ff" fg="#2563eb" />
        <StatCard icon="✓" title="Available" value={available} bg="#e9f8ef" fg="#16834b" />
        <StatCard icon="●" title="In Use / Booked" value={inUse} bg="#fff4df" fg="#b56a00" />
        <StatCard icon="⚙" title="Under Maintenance" value={maintenance} bg="#fdecec" fg="#c0392b" />
      </div>

      <div style={card}>
        <div style={filterBar}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, asset tag, or department..."
            style={searchInput}
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Categories</option>
            {knownCategories.map((c) => (
              <option key={c.categoryId} value={c.categoryName}>{c.categoryName}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Status</option>
            {EQUIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading equipment...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 950 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Equipment</TableHeader>
                  <TableHeader>Asset Tag</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Institution</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Hourly Rate</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => (
                  <tr key={item.equipmentId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{item.equipmentId}</td>
                    <td style={tdStyle}>{item.equipmentName}</td>
                    <td style={tdStyle}>{item.assetTag}</td>
                    <td style={tdStyle}>{item.categoryName || item.categoryId}</td>
                    <td style={tdStyle}>{item.institutionName}</td>
                    <td style={tdStyle}>{item.departmentName}</td>
                    <td style={tdStyle}>{item.hourlyRate != null ? `₹${item.hourlyRate}` : "-"}</td>
                    <td style={tdStyle}>
                      <span style={statusPill(item.status)}>{item.status}</span>
                    </td>
                    <td style={tdStyle}>
                      {canWrite && (
                        <button onClick={() => openEdit(item)} style={editButton}>Edit</button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(item)} style={{ ...editButton, color: "#c0392b", marginLeft: 6 }}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredEquipment.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ ...tdStyle, textAlign: "center", padding: 30 }}>
                      No equipment found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddForm && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>{editingId ? "Edit Equipment" : "Add Equipment"}</h2>
              <button onClick={resetForm} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormInput label="Equipment Name" value={form.equipmentName} onChange={(v) => setForm({ ...form, equipmentName: v })} required />
                <FormInput label="Asset Tag" value={form.assetTag} onChange={(v) => setForm({ ...form, assetTag: v })} required />

                <div>
                  <FieldLabel>Category</FieldLabel>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => {
                      const found = knownCategories.find((c) => String(c.categoryId) === e.target.value);
                      setForm({ ...form, categoryId: e.target.value, categoryName: found?.categoryName || "" });
                    }}
                    style={inputStyle}
                  >
                    <option value="">Select existing category</option>
                    {knownCategories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName} (#{c.categoryId})</option>
                    ))}
                  </select>
                  <p style={hintText}>
                    No category-management endpoint exists on the backend yet, so pick from
                    categories already in use, or type a new numeric ID below for a brand-new one.
                  </p>
                  <input
                    type="number"
                    placeholder="...or enter a new category ID"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    style={{ ...inputStyle, marginTop: 6 }}
                  />
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                    {EQUIPMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Institution</FieldLabel>
                  <select
                    required
                    value={form.institutionId}
                    onChange={(e) => setForm({ ...form, institutionId: e.target.value, departmentId: "" })}
                    style={inputStyle}
                  >
                    <option value="">Select institution</option>
                    {institutions.map((inst) => (
                      <option key={inst.institutionId} value={inst.institutionId}>{inst.institutionName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Department</FieldLabel>
                  <select
                    required
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    style={inputStyle}
                    disabled={!form.institutionId}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.departId} value={d.departId}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>

                <FormInput label="Hourly Rate" type="number" value={form.hourlyRate} onChange={(v) => setForm({ ...form, hourlyRate: v })} />
                <FormInput label="Purchase Cost" type="number" value={form.purchaseCost} onChange={(v) => setForm({ ...form, purchaseCost: v })} />
                <FormInput label="Purchase Date" type="date" value={form.purchaseDate} onChange={(v) => setForm({ ...form, purchaseDate: v })} />
                <FormInput label="Warranty Expiry" type="date" value={form.warrantyExpiry} onChange={(v) => setForm({ ...form, warrantyExpiry: v })} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}>
                <button type="button" onClick={resetForm} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>{editingId ? "Save Changes" : "Add Equipment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, bg, fg }) {
  return (
    <div style={statCardStyle}>
      <div style={{ ...iconBoxStyle, background: bg, color: fg }}>{icon}</div>
      <div>
        <p style={{ margin: "0 0 4px", color: "#718096", fontSize: 12 }}>{title}</p>
        <h2 style={{ margin: 0, fontSize: 23, color: "#172b4d" }}>{value}</h2>
      </div>
    </div>
  );
}

function TableHeader({ children }) {
  return <th style={thStyle}>{children}</th>;
}

function FieldLabel({ children }) {
  return <label style={labelStyle}>{children}</label>;
}

function FormInput({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function statusPill(status) {
  const map = {
    AVAILABLE: { bg: "#e8f7ee", fg: "#16834b" },
    BOOKED: { bg: "#fff4df", fg: "#b56a00" },
    IN_USE: { bg: "#fff4df", fg: "#b56a00" },
    UNDER_MAINTENANCE: { bg: "#fdecec", fg: "#c0392b" },
    OUT_OF_SERVICE: { bg: "#fdecec", fg: "#c0392b" },
    UNAVAILBALE: { bg: "#f1f5f9", fg: "#475569" },
    RETIRED: { bg: "#f1f5f9", fg: "#475569" },
  };
  const s = map[status] || { bg: "#f1f5f9", fg: "#475569" };
  return { background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 };
}

const page = { padding: "30px 34px", background: "#f6f8fc", minHeight: "100%", boxSizing: "border-box", color: "#172b4d" };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 };
const h1Style = { margin: 0, fontSize: 28, fontWeight: 700, color: "#172b4d" };
const subStyle = { margin: "7px 0 0", fontSize: 14, color: "#718096" };
const primaryBtn = { border: "none", background: "#2563eb", color: "white", padding: "11px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const cancelBtn = { padding: "9px 16px", borderRadius: 6, border: "1px solid #d8dee8", background: "white", color: "#64748b", cursor: "pointer" };
const statsRow = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 };
const statCardStyle = { background: "white", border: "1px solid #e4e8ef", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(20,40,70,0.04)" };
const iconBoxStyle = { width: 42, height: 42, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700 };
const card = { background: "#fff", border: "1px solid #e4e8ef", borderRadius: 12, boxShadow: "0 2px 8px rgba(20,40,70,0.04)" };
const filterBar = { padding: "17px 20px", borderBottom: "1px solid #e8ecf2", display: "flex", gap: 12, alignItems: "center" };
const searchInput = { flex: 1, height: 40, border: "1px solid #d9dfe8", borderRadius: 7, padding: "0 12px", fontSize: 13 };
const selectStyle = { height: 40, minWidth: 160, border: "1px solid #d9dfe8", borderRadius: 7, padding: "0 10px", background: "white", color: "#475569", fontSize: 13 };
const thStyle = { padding: "13px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
const tdStyle = { padding: "14px 16px", color: "#475569", fontSize: 13, whiteSpace: "nowrap" };
const editButton = { border: "1px solid #cbd5e1", background: "white", color: "#2563eb", padding: "5px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 };
const modalCard = { background: "white", borderRadius: 12, padding: 26, width: 620, maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#334155" };
const inputStyle = { width: "100%", height: 40, boxSizing: "border-box", border: "1px solid #d8dee8", borderRadius: 6, padding: "0 10px", fontSize: 13, outline: "none" };
const hintText = { fontSize: 11, color: "#94a3b8", margin: "4px 0 0" };

export default Equipment;
