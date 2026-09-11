import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEquipmentRealtime from "../hooks/useEquipmentRealtime";

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
    purchaseCost: "",
    ratePerHour: "",
    requiresApproval: true,
  });

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const myInstitutionId = sessionStorage.getItem("institutionId");

  // NEW: search state + filtered list
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEquipment = equipment.filter((item) =>
    item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Equipment create/update/delete is LAB_MANAGER-only — technicians,
  // institution admins, and system admins are read-only here, same
  // restriction now enforced backend-side in EquipmentController.
  const myDepartmentId = sessionStorage.getItem("departmentId");

const ownsEquipment = (item) =>
  role === "LAB_MANAGER" &&
  String(item.institution?.institutionId) === String(myInstitutionId) &&
  String(item.department?.departmentId) === String(myDepartmentId);

  // Fetch all equipment
  const fetchEquipment = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment`, {
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

  useEffect(() => {
    fetchEquipment();

    // Fallback safety net only — the real update path is now the
    // WebSocket push below (useEquipmentRealtime). If the socket ever
    // drops and hasn't reconnected yet, this still catches up within
    // a minute instead of leaving the page stale indefinitely.
    const interval = setInterval(fetchEquipment, 60000);
    return () => clearInterval(interval);
  }, []);

  // Instant push: the backend pings "/topic/equipment-updates" the
  // moment any booking or equipment change affects status (create,
  // approve, reject, complete, or the 60s scheduler sweep) — this
  // re-fetches immediately instead of waiting for the next poll tick,
  // which is what was making the page look stale/idle.
  useEquipmentRealtime(fetchEquipment);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
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
      purchaseCost: "",
      ratePerHour: "",
      requiresApproval: true,
    });
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.equipmentId);
    setFormData({
      equipmentName: item.equipmentName || "",
      category: item.category || "",
      serialNumber: item.serialNumber || "",
      location: item.location || "",
      status: item.status || "Available",
      purchaseDate: item.purchaseDate || "",
      purchaseCost: item.purchaseCost ?? "",
      ratePerHour: item.ratePerHour ?? "",
      requiresApproval: item.requiresApproval !== false,
    });
    setShowModal(true);
  };

  // Handle Save (Create or Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing
      ? `${import.meta.env.VITE_API_BASE_URL}/api/equipment/${currentId}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/equipment`;
    const method = isEditing ? "PUT" : "POST";

    // Institution and department are deliberately NOT sent here — the
    // backend always derives them from the logged-in Lab Manager's own
    // account (see EquipmentController.createEquipment) and update
    // never lets them change. There's no selection for it anymore.
    const payload = {
      equipmentName: formData.equipmentName,
      category: formData.category,
      serialNumber: formData.serialNumber,
      location: formData.location,
      status: formData.status,
      purchaseDate: formData.purchaseDate,
      purchaseCost: formData.purchaseCost === "" ? null : Number(formData.purchaseCost),
      ratePerHour: formData.ratePerHour === "" ? 0 : Number(formData.ratePerHour),
      requiresApproval: formData.requiresApproval,
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

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment/${id}`, {
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
                  {/* Quick Booking — STUDENT only, matching
                      BookingController.createBooking (backend-enforced;
                      this just avoids showing a button that would 403). */}
                  {item.status === "Available" && role === "STUDENT" && (
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

                  {role !== "STUDENT" && (
                    <button
                      // The standalone /feedback page is gone — general
                      // (non-booking) issue reports now open inline from
                      // the Equipment Issue Reports section on the
                      // Maintenance page instead.
                      onClick={() => navigate(`/maintenance?equipmentId=${item.equipmentId}`)}
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
                  )}

                  {ownsEquipment(item) && (
  <button onClick={() => handleEdit(item)} style={btnEdit}>
    Edit
  </button>
)}
{ownsEquipment(item) && (
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
                <label>Purchase Cost:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="purchaseCost"
                  value={formData.purchaseCost}
                  onChange={handleChange}
                  placeholder="e.g. 25000.00"
                  style={inputStyle}
                />
              </div>
              <div style={formGroup}>
                <label>Rate per Hour:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="ratePerHour"
                  value={formData.ratePerHour}
                  onChange={handleChange}
                  placeholder="e.g. 5.00"
                  style={inputStyle}
                />
              </div>
              {/* Institution/Department fields removed intentionally —
                  equipment is always created under the logged-in Lab
                  Manager's own institution and department, decided by
                  the backend. There's no longer a way to pick a
                  different one from this form. */}
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
  padding: "20px",
  boxSizing: "border-box",
  overflowY: "auto",
  zIndex: 1000, // above Navbar's z-index: 100 — otherwise the navbar
                // renders on top and visually clips the modal's top
};

const modalBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
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