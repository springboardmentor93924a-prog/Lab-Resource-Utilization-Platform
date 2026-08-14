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
        setError(
          err.response?.data?.message || "Failed to load equipment"
        );
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

      {/* SIDEBAR */}
      <div className="sidebar">
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* =====================================================
            TOP NAVBAR
        ===================================================== */}

        <nav className="navbar">

          <h4>Equipment catalog</h4>

          <div className="nav-right">

            <input
              type="text"
              className="form-control search-top"
              placeholder="Search..."
            />

            <button
              className="profile-circle"
              onClick={() => navigate("/profile")}
              title="My Profile"
              aria-label="My Profile"
            >
              👤
            </button>

          </div>

        </nav>


        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="filters">

          <input
            type="text"
            className="form-control search-box"
            placeholder="Search equipment"
          />

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


          {/* VIEW CALENDAR */}

          <button
            className="view-calendar-btn"
            onClick={handleViewCalendar}
          >
            View calendar
          </button>


          {/* ADD EQUIPMENT */}

          {userIsAdmin && (
            <button
              className="add-btn"
              onClick={handleAddEquipment}
            >
              + Add equipment
            </button>
          )}

        </div>


        {/* =====================================================
            LOADING / ERROR
        ===================================================== */}

        {loading && (
          <p className="loading-message">
            Loading equipment...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {/* =====================================================
            EQUIPMENT CATALOGUE
        ===================================================== */}

        {!loading && !error && (
          <div className="equipment-grid">

            {equipmentList.map((item) => (

              <div
                className="equipment-card"
                key={item.equipmentId}
              >

                {/* IMAGE */}

                <div className="image-placeholder">

                  <img
                    src={item.imageUrl || ""}
                    alt={item.name}
                  />

                </div>


                {/* EQUIPMENT NAME */}

                <h6>
                  {item.name}
                </h6>


                {/* CATEGORY + DEPARTMENT */}

                <p>
                  {item.category?.categoryName} — {item.department?.departmentName}
                </p>


                {/* STATUS */}

                <div
                  className={`status ${
                    item.status?.toLowerCase() || ""
                  }`}
                >
                  <span>
                    {item.status?.replace("_", " ")}
                  </span>
                </div>


                {/* VIEW BUTTON */}

                <button
                  className="view-equipment-btn"
                  onClick={() => handleView(item.equipmentId)}
                >
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