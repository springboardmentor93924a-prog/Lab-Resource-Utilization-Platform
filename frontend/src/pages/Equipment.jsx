import { useEffect, useState } from "react";

function Equipment() {
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
  });

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    });
    setShowModal(true);
  };

  // Handle Save (Create or Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:8080/api/equipment/${currentId}`
      : "http://localhost:8080/api/equipment";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
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
        <button onClick={handleAddNew} style={btnPrimary}>
          + Add Equipment
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Category</th>
            <th style={cellStyle}>Serial Number</th>
            <th style={cellStyle}>Location</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Purchase Date</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.length > 0 ? (
            equipment.map((item) => (
              <tr key={item.equipmentId}>
                <td style={cellStyle}>{item.equipmentId}</td>
                <td style={cellStyle}>{item.equipmentName}</td>
                <td style={cellStyle}>{item.category}</td>
                <td style={cellStyle}>{item.serialNumber}</td>
                <td style={cellStyle}>{item.location}</td>
                <td style={cellStyle}>{item.status}</td>
                <td style={cellStyle}>{item.purchaseDate}</td>
                <td style={cellStyle}>
                  <button onClick={() => handleEdit(item)} style={btnEdit}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.equipmentId)} style={btnDelete}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ ...cellStyle, textAlign: "center" }}>
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
                  <option value="Under Maintenance">Under Maintenance</option>
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
