import Sidebar from "../components/Sidebar";
import "./EquipmentCatalog.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAllEquipment } from "../services/equipmentService";
import { isAdmin } from "../utils/auth";

export default function EquipmentCatalog() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await getAllEquipment();
        setEquipmentList(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load equipment");
      } finally {
        setLoading(false);
      }
    }
    fetchEquipment();
  }, []);

  function handleView(id) {
    navigate(`/equipment/${id}`);
  }

  function handleAddEquipment() {
    navigate("/equipment/add");
  }

  function handleViewCalendar() {
    navigate("/equipment/calendar");
  }

  return (
    <div className="wrapper">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <nav className="navbar">
          <h4>Equipment catalog</h4>
          <div className="nav-right">
            <input type="text" className="form-control search-top" placeholder="Search..." />
            <div className="profile-circle"></div>
          </div>
        </nav>

        <div className="filters">
          <input type="text" className="form-control search-box" placeholder="Search equipment" />

          <select className="form-select">
            <option>All categories</option>
            <option>Microscope</option>
            <option>Spectrometer</option>
            <option>Centrifuge</option>
          </select>

          <select className="form-select">
            <option>All status</option>
            <option>Available</option>
            <option>Busy</option>
            <option>Maintenance</option>
          </select>

          <select className="form-select">
            <option>All departments</option>
            <option>Bio</option>
            <option>Chem</option>
            <option>Physics</option>
          </select>

          <button className="btn btn-outline-dark" onClick={handleViewCalendar}>
            View calendar
          </button>
          {userIsAdmin && (
  <button className="btn btn-dark add-btn" onClick={handleAddEquipment}>
    + Add equipment
  </button>
)}
        </div>

        {loading && <p>Loading equipment...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div className="equipment-grid">
            {equipmentList.map((item) => (
              <div className="equipment-card" key={item.id}>
                <div className="image-placeholder">
                  <img src={item.imageUrl} alt={item.equipmentName} />
                </div>
                <h6>{item.equipmentName}</h6>
                <p>{item.category} — {item.department}</p>
                <div className={`status ${item.status?.toLowerCase()}`}></div>
                <button className="btn btn-outline-dark w-100" onClick={() => handleView(item.id)}>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}