import { useEffect, useState } from "react";
import { getAllInstitutions } from "../api/institutionApi";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../api/departmentApi";
import { extractErrorMessage } from "../api/client";
import {
  page, headerRow, h1Style, subStyle, primaryBtn, cancelBtn, card, filterBar,
  searchInput, selectStyle, thStyle, tdStyle, actionBtn, modalOverlay, modalCard,
  labelStyle, inputStyle, errorText, emptyText,
} from "../styles/shared";

// DepartmentServiceImpl restricts create/update/delete to admins in practice.
const WRITE_ROLES = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"];

function Departments({ userRole, showToast }) {
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ departmentName: "", description: "", institutionId: "" });

  const canWrite = WRITE_ROLES.includes(userRole);

  const load = () => {
    setLoading(true);
    getAllDepartments()
      .then(setDepartments)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load departments.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAllInstitutions().then(setInstitutions).catch(() => setInstitutions([]));
  }, []);

  const filtered = departments.filter((d) => {
    const matchesSearch = (d.departmentName || "").toLowerCase().includes(search.toLowerCase());
    const matchesInstitution =
      institutionFilter === "All" || String(d.institution?.institutionId) === institutionFilter;
    return matchesSearch && matchesInstitution;
  });

  const resetForm = () => {
    setForm({ departmentName: "", description: "", institutionId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (d) => {
    setForm({
      departmentName: d.departmentName || "",
      description: d.description || "",
      institutionId: d.institution?.institutionId || "",
    });
    setEditingId(d.departId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Department entity has a nested `institution` object, not a flat institutionId.
    const payload = {
      departmentName: form.departmentName,
      description: form.description,
      institution: { institutionId: Number(form.institutionId) },
    };
    try {
      if (editingId) {
        await updateDepartment(editingId, payload);
        showToast?.(`"${form.departmentName}" updated.`, "success");
      } else {
        await createDepartment(payload);
        showToast?.(`"${form.departmentName}" created.`, "success");
      }
      resetForm();
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to save department."), "warning");
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete "${d.departmentName}"?`)) return;
    try {
      await deleteDepartment(d.departId);
      showToast?.(`"${d.departmentName}" deleted.`, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to delete department."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Departments</h1>
          <p style={subStyle}>Manage departments within institutions</p>
        </div>
        {canWrite && (
          <button onClick={() => { setForm({ departmentName: "", description: "", institutionId: "" }); setEditingId(null); setShowForm(true); }} style={primaryBtn}>
            + Add Department
          </button>
        )}
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={filterBar}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by department name..."
            style={searchInput}
          />
          <select value={institutionFilter} onChange={(e) => setInstitutionFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Institutions</option>
            {institutions.map((i) => (
              <option key={i.institutionId} value={i.institutionId}>{i.institutionName}</option>
            ))}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading departments...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Institution</th>
                  <th style={thStyle}>Description</th>
                  {canWrite && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.departId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{d.departId}</td>
                    <td style={tdStyle}>{d.departmentName}</td>
                    <td style={tdStyle}>{d.institution?.institutionName || "-"}</td>
                    <td style={tdStyle}>{d.description || "-"}</td>
                    {canWrite && (
                      <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(d)} style={actionBtn}>Edit</button>
                        <button onClick={() => handleDelete(d)} style={{ ...actionBtn, color: "#c0392b" }}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={emptyText}>No departments found.</td></tr>
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
              <h2 style={{ margin: 0, fontSize: 19 }}>{editingId ? "Edit Department" : "Add Department"}</h2>
              <button onClick={resetForm} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Department Name</label>
                <input required value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Institution</label>
                <select required value={form.institutionId} onChange={(e) => setForm({ ...form, institutionId: e.target.value })} style={inputStyle}>
                  <option value="">Select institution</option>
                  {institutions.map((i) => (
                    <option key={i.institutionId} value={i.institutionId}>{i.institutionName}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20 }}>
                <button type="button" onClick={resetForm} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>{editingId ? "Save Changes" : "Create Department"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
