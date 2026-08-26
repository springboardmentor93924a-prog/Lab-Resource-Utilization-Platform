import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Equipment() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    equipmentName: "",
    category: "",
    serialNumber: "",
    location: "",
    status: "Available",
    purchaseDate: "",
    requiresApproval: true,
    institutionId: "",
    departmentId: "",
  });

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const myInstitutionId = sessionStorage.getItem("institutionId");

  // NEW: search state + filtered list
  const [searchTerm, setSearchTerm] = useState("");

  // Institutions/departments for the Add/Edit form
  const [institutions, setInstitutions] = useState([]);
  const [formDepartments, setFormDepartments] = useState([]);

  const filteredEquipment = equipment.filter((item) =>
    item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageEquipment = [
    "LAB_TECHNICIAN",
    "LAB_MANAGER",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const canDeleteEquipment = [
    "LAB_MANAGER",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  // Fetch all equipment
  const fetchEquipment = () => {
    fetch("http://localhost:8080/api/equipment", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch equipment");
        return res.json();
      })
      .then((data) => {
        setEquipment(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Equipment error:", err);
        setLoading(false);
      });
  };

  const fetchInstitutions = () => {
    fetch("http://localhost:8080/api/institutions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setInstitutions(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Institutions error:", err));
  };

  // Departments depend on which institution is selected in the form
  const fetchDepartmentsForInstitution = (institutionId) => {
    if (!institutionId) {
      setFormDepartments([]);
      return;
    }
    fetch(`http://localhost:8080/api/institutions/${institutionId}/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFormDepartments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Departments error:", err));
  };

  useEffect(() => {
    fetchEquipment();
    fetchInstitutions();

    // Poll so status/institution changes made by other users show up
    // without a manual page refresh.
    const interval = setInterval(fetchEquipment, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (name === "institutionId") {
      // Changing the institution invalidates the previously selected
      // department, since departments belong to a specific institution.
      setFormData((prev) => ({ ...prev, institutionId: value, departmentId: "" }));
      fetchDepartmentsForInstitution(value);
    }
  };

  // Open Modal for Create
  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      equipmentName: "",
      category: "",
      serialNumber: "",
      location: "",
      status: "Available",
      purchaseDate: "",
      requiresApproval: true,
      institutionId: myInstitutionId || "",
      departmentId: "",
    });
    if (myInstitutionId) {
      fetchDepartmentsForInstitution(myInstitutionId);
    } else {
      setFormDepartments([]);
    }
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.equipmentId);
    const institutionId = item.institution?.institutionId || "";
    setFormData({
      equipmentName: item.equipmentName || "",
      category: item.category || "",
      serialNumber: item.serialNumber || "",
      location: item.location || "",
      status: item.status || "Available",
      purchaseDate: item.purchaseDate || "",
      requiresApproval: item.requiresApproval !== false,
      institutionId,
      departmentId: item.department?.departmentId || "",
    });
    if (institutionId) {
      fetchDepartmentsForInstitution(institutionId);
    }
    setShowModal(true);
  };

  // Handle Save (Create or Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:8080/api/equipment/${currentId}`
      : "http://localhost:8080/api/equipment";
    const method = isEditing ? "PUT" : "POST";

    const payload = {
      equipmentName: formData.equipmentName,
      category: formData.category,
      serialNumber: formData.serialNumber,
      location: formData.location,
      status: formData.status,
      purchaseDate: formData.purchaseDate,
      requiresApproval: formData.requiresApproval,
      institution: formData.institutionId
        ? { institutionId: Number(formData.institutionId) }
        : null,
      department: formData.departmentId
        ? { departmentId: Number(formData.departmentId) }
        : null,
    };

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save equipment");
        return res.json();
      })
      .then(() => {
        setShowModal(false);
        fetchEquipment();
      })
      .catch((err) => console.error("Error saving equipment:", err));
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;

    fetch(`http://localhost:8080/api/equipment/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          fetchEquipment();
        } else {
          alert("Failed to delete equipment");
        }
      })
      .catch((err) => console.error("Error deleting equipment:", err));
  };

  if (loading) {
    return <h2>Loading equipment...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Equipment Management</h2>
        {canManageEquipment && (
          <button onClick={handleAddNew} style={btnPrimary}>
            + Add Equipment
          </button>
        )}
      </div>

      {/* NEW: search box */}
      <input
        type="text"
        placeholder="Search equipment by name or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ ...inputStyle, marginTop: "15px", width: "300px" }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            {/* CHANGED: ID header hidden for students */}
            {role !== "STUDENT" && <th style={cellStyle}>ID</th>}
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Institution</th>
            <th style={cellStyle}>Category</th>
            <th style={cellStyle}>Serial Number</th>
            <th style={cellStyle}>Location</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Purchase Date</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map((item) => (
              <tr key={item.equipmentId}>
                {/* CHANGED: ID cell hidden for students */}
                {role !== "STUDENT" && <td style={cellStyle}>{item.equipmentId}</td>}
                <td style={cellStyle}><strong>{item.equipmentName}</strong></td>
                <td style={cellStyle}>
                  {item.institution?.institutionName || "—"}
                  {myInstitutionId &&
                    String(item.institution?.institutionId) === String(myInstitutionId) && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#166534",
                          background: "#dcfce7",
                          borderRadius: "999px",
                          padding: "2px 8px",
                        }}
                      >
                        Your Institution
                      </span>
                    )}
                </td>
                <td style={cellStyle}>{item.category}</td>
                <td style={cellStyle}>{item.serialNumber}</td>
                <td style={cellStyle}>{item.location}</td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      background:
                        item.status === "Available"
                          ? "#dcfce7"
                          : item.status === "Booked"
                          ? "#e0e7ff"
                          : item.status === "In Use"
                          ? "#dbeafe"
                          : item.status === "Under Maintenance"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        item.status === "Available"
                          ? "#166534"
                          : item.status === "Booked"
                          ? "#3730a3"
                          : item.status === "In Use"
                          ? "#1e40af"
                          : item.status === "Under Maintenance"
                          ? "#92400e"
                          : "#991b1b",
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={cellStyle}>{item.purchaseDate || "—"}</td>
                <td style={cellStyle}>
                  {/* Quick Booking / Waitlist for Students & Users */}
                  {item.status === "Available" && (
                    <button
                      onClick={() => navigate(`/reservations?equipmentId=${item.equipmentId}`)}
                      style={{
                        padding: "4px 8px",
                        marginRight: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      title="Book a slot on this equipment"
                    >
                      📅 Book
                    </button>
                  )}

                  {(item.status === "Booked" || item.status === "In Use") && (
                    <button
                      onClick={() => navigate(`/waitlist?equipmentId=${item.equipmentId}`)}
                      style={{
                        padding: "4px 8px",
                        marginRight: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      title="Join waitlist for this equipment"
                    >
                      ⏳ Waitlist
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/feedback?equipmentId=${item.equipmentId}`)}
                    style={{
                      padding: "4px 8px",
                      marginRight: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                      background: "#fff3cd",
                      border: "1px solid #ffeeba",
                      color: "#854d0e",
                      borderRadius: "4px",
                    }}
                    title="Report a defect or inaccurate results"
                  >
                    ⚠️ Report
                  </button>

                  {canManageEquipment && (
                    <button onClick={() => handleEdit(item)} style={btnEdit}>
                      Edit
                    </button>
                  )}
                  {canDeleteEquipment && (
                    <button onClick={() => handleDelete(item.equipmentId)} style={btnDelete}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={(role !== "STUDENT" ? 1 : 0) + 8}
                style={{ ...cellStyle, textAlign: "center" }}
              >
                No equipment found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Popup for Add / Edit */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>{isEditing ? "Edit Equipment" : "Add New Equipment"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  name="equipmentName"
                  value={formData.equipmentName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={formGroup}>
                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={formGroup}>
                <label>Serial Number:</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={formGroup}>
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={formGroup}>
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Available">Available</option>
<option value="In Use">In Use</option>
<option value="Booked">Booked</option>
<option value="Under Maintenance">Under Maintenance</option>
<option value="Out of Service">Out of Service</option>
<option value="Retired">Retired</option>
                </select>
              </div>
              <div style={formGroup}>
                <label>Purchase Date:</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div style={formGroup}>
                <label>Institution:</label>
                <select
                  name="institutionId"
                  value={formData.institutionId}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Select Institution --</option>
                  {institutions.map((inst) => (
                    <option key={inst.institutionId} value={inst.institutionId}>
                      {inst.institutionName}
                    </option>
                  ))}
                </select>
              </div>
              <div style={formGroup}>
                <label>Department:</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  disabled={!formData.institutionId}
                  style={inputStyle}
                >
                  <option value="">
                    {formData.institutionId
                      ? "-- Select Department --"
                      : "Select an institution first"}
                  </option>
                  {formDepartments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ ...formGroup, flexDirection: "row", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="requiresApproval"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                />
                <label htmlFor="requiresApproval" style={{ margin: 0 }}>
                  Requires approval before booking
                </label>
              </div>
              <div style={{ marginTop: "15px", textAlign: "right" }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnCancel}>
                  Cancel
                </button>
                <button type="submit" style={btnPrimary}>
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles
const cellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

const btnPrimary = {
  padding: "8px 14px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnEdit = {
  padding: "5px 10px",
  marginRight: "5px",
  backgroundColor: "#ffc107",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnDelete = {
  padding: "5px 10px",
  backgroundColor: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnCancel = {
  padding: "8px 14px",
  marginRight: "10px",
  backgroundColor: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
};

const formGroup = {
  marginBottom: "12px",
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  marginTop: "4px",
};

export default Equipment;