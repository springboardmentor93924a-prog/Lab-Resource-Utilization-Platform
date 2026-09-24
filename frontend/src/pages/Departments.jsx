import { useEffect, useState } from "react";

// Departments of an institution.
// A brand-new college starts with NO departments, and students / staff
// can only register into a department that belongs to their college - so
// the Institution Admin adds them here right after being approved.
//   Institution Admin -> their own institution only
//   System Admin      -> any institution

const API = import.meta.env.VITE_API_BASE_URL;

function Departments() {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const myInstitutionId = sessionStorage.getItem("institutionId");
  const isSystemAdmin = role === "SYSTEM_ADMIN";

  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState(isSystemAdmin ? "" : myInstitutionId || "");
  const [linked, setLinked] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [existingId, setExistingId] = useState("");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/api/institutions`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setInstitutions(list);
        if (isSystemAdmin && list.length > 0) {
          setInstitutionId(String(list[0].institutionId));
        }
      })
      .catch(() => setInstitutions([]));

    fetch(`${API}/api/departments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLinked = (id) => {
    if (!id) {
      setLinked([]);
      return;
    }
    fetch(`${API}/api/institutions/${id}/departments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLinked(Array.isArray(data) ? data : []))
      .catch(() => setLinked([]));
  };

  useEffect(() => {
    loadLinked(institutionId);
  }, [institutionId]);

  const linkedIds = new Set(linked.map((d) => d.departmentId));
  const availableCatalog = catalog.filter((d) => !linkedIds.has(d.departmentId));

  const addDepartment = async (body) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${API}/api/institutions/${institutionId}/departments`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        throw new Error(typeof data === "string" ? data : data?.message || "Could not add department");
      }

      setMessage(`Added ${data.departmentName || "department"}.`);
      setExistingId("");
      setNewName("");
      loadLinked(institutionId);

      // a brand-new name also joins the shared catalog
      fetch(`${API}/api/departments`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setCatalog(Array.isArray(d) ? d : []));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const card = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", marginBottom: "16px" };
  const input = { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", minWidth: "220px" };
  const btn = { padding: "8px 14px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };

  return (
    <div style={{ padding: "24px", maxWidth: "800px" }}>
      <h2 style={{ margin: 0 }}>Departments</h2>
      <p style={{ color: "#64748b", marginTop: "6px" }}>
        Students and staff can only register into a department that is listed
        here for your college.
      </p>

      {isSystemAdmin && (
        <div style={card}>
          <label style={{ marginRight: "8px" }}>Institution:</label>
          <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} style={input}>
            {institutions.map((i) => (
              <option key={i.institutionId} value={i.institutionId}>
                {i.institutionName}
              </option>
            ))}
          </select>
        </div>
      )}

      {message && <p style={{ color: "#166534" }}>{message}</p>}
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Departments in this college</h3>
        {linked.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            No departments yet. Add your first one below - nobody can register
            as a student or staff until it exists.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {linked.map((d) => (
              <li key={d.departmentId}>{d.departmentName}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Add a department</h3>

        {availableCatalog.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <select value={existingId} onChange={(e) => setExistingId(e.target.value)} style={input}>
              <option value="">Choose an existing department</option>
              {availableCatalog.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
            <button
              style={btn}
              disabled={!existingId || !institutionId || saving}
              onClick={() => addDepartment({ departmentId: Number(existingId) })}
            >
              Add
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="...or type a new department name"
            maxLength={100}
            style={input}
          />
          <button
            style={btn}
            disabled={!newName.trim() || !institutionId || saving}
            onClick={() => addDepartment({ departmentName: newName.trim() })}
          >
            Add new
          </button>
        </div>
      </div>
    </div>
  );
}

export default Departments;