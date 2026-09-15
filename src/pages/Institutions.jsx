import { useEffect, useState } from "react";
import {
  getAllInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "../api/institutionApi";
import { extractErrorMessage } from "../api/client";
import {
  page, headerRow, h1Style, subStyle, primaryBtn, cancelBtn, card, filterBar,
  searchInput, thStyle, tdStyle, actionBtn, modalOverlay, modalCard, labelStyle,
  inputStyle, errorText, emptyText,
} from "../styles/shared";

// Only SYSTEM_ADMIN manages institutions in practice, though the backend
// currently leaves POST/PUT/DELETE open (see SecurityConfig) - the UI still
// only exposes the controls to admins to match intended usage.
const WRITE_ROLES = ["SYSTEM_ADMIN"];

const emptyForm = {
  institutionName: "", institutionCode: "", address: "", city: "",
  state: "", country: "", pincode: "", contactEmail: "", contactPhone: "",
};

function Institutions({ userRole, showToast }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const canWrite = WRITE_ROLES.includes(userRole);

  const load = () => {
    setLoading(true);
    getAllInstitutions()
      .then(setInstitutions)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load institutions.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = institutions.filter((i) =>
    (i.institutionName || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.institutionCode || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openEdit = (inst) => {
    setForm({
      institutionName: inst.institutionName || "",
      institutionCode: inst.institutionCode || "",
      address: inst.address || "",
      city: inst.city || "",
      state: inst.state || "",
      country: inst.country || "",
      pincode: inst.pincode || "",
      contactEmail: inst.contactEmail || "",
      contactPhone: inst.contactPhone || "",
    });
    setEditingId(inst.institutionId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateInstitution(editingId, form);
        showToast?.(`"${form.institutionName}" updated.`, "success");
      } else {
        await createInstitution(form);
        showToast?.(`"${form.institutionName}" created.`, "success");
      }
      resetForm();
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to save institution."), "warning");
    }
  };

  const handleDelete = async (inst) => {
    if (!window.confirm(`Delete "${inst.institutionName}"?`)) return;
    try {
      await deleteInstitution(inst.institutionId);
      showToast?.(`"${inst.institutionName}" deleted.`, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to delete institution."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Institutions</h1>
          <p style={subStyle}>Manage partner institutions on the platform</p>
        </div>
        {canWrite && (
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} style={primaryBtn}>
            + Add Institution
          </button>
        )}
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={filterBar}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or city..."
            style={searchInput}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading institutions...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>Contact Email</th>
                  <th style={thStyle}>Phone</th>
                  {canWrite && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => (
                  <tr key={inst.institutionId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{inst.institutionId}</td>
                    <td style={tdStyle}>{inst.institutionName}</td>
                    <td style={tdStyle}>{inst.institutionCode}</td>
                    <td style={tdStyle}>{inst.city || "-"}</td>
                    <td style={tdStyle}>{inst.country || "-"}</td>
                    <td style={tdStyle}>{inst.contactEmail || "-"}</td>
                    <td style={tdStyle}>{inst.contactPhone || "-"}</td>
                    {canWrite && (
                      <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(inst)} style={actionBtn}>Edit</button>
                        <button onClick={() => handleDelete(inst)} style={{ ...actionBtn, color: "#c0392b" }}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={emptyText}>No institutions found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>{editingId ? "Edit Institution" : "Add Institution"}</h2>
              <button onClick={resetForm} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Institution Name" value={form.institutionName} onChange={(v) => setForm({ ...form, institutionName: v })} required />
                <Field label="Institution Code" value={form.institutionCode} onChange={(v) => setForm({ ...form, institutionCode: v })} required />
                <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                <Field label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
                <Field label="Contact Email" type="email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} />
                <Field label="Contact Phone" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}>
                <button type="button" onClick={resetForm} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>{editingId ? "Save Changes" : "Create Institution"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

export default Institutions;
