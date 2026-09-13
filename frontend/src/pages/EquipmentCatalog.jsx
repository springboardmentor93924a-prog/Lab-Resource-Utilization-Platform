import Sidebar from "../components/Sidebar";
import "./EquipmentCatalog.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getAllEquipment } from "../services/equipmentService";
import { isAdmin } from "../utils/auth";
import { getCalibrationAlerts } from "../services/equipmentService";

const STATUS_OPTIONS = ["Available", "Booked", "Under Maintenance", "Out of Service", "Retired"];

export default function EquipmentCatalog() {
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overdueIds, setOverdueIds] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");

  const userIsAdmin = isAdmin();

  useEffect(() => {
  async function fetchEquipment() {
    try {
      const data = await getAllEquipment();
      setEquipmentList(data);

      const alerts = await getCalibrationAlerts();
      setOverdueIds(alerts.filter((a) => a.urgency === "OVERDUE").map((a) => a.equipmentId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }
  fetchEquipment();
}, []);

  const categoryOptions = useMemo(() => {
    const names = equipmentList
      .map((item) => item.category?.categoryName)
      .filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [equipmentList]);

  const departmentOptions = useMemo(() => {
    const names = equipmentList
      .map((item) => item.department?.departmentName)
      .filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [equipmentList]);

  const filteredList = useMemo(() => {
    return equipmentList.filter((item) => {
      if (categoryFilter !== "All categories" && item.category?.categoryName !== categoryFilter) {
        return false;
      }
      if (statusFilter === "All status") {
        if (item.status === "Retired") {
          return false;
        }
      } else if (item.status !== statusFilter) {
        return false;
      }
      if (departmentFilter !== "All departments" && item.department?.departmentName !== departmentFilter) {
        return false;
      }
      if (searchText.trim() !== "") {
        const q = searchText.trim().toLowerCase();
        const haystack = [
          item.name,
          item.assetTag,
          item.manufacturer,
          item.modelNumber,
          item.category?.categoryName,
          item.department?.departmentName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [equipmentList, categoryFilter, statusFilter, departmentFilter, searchText]);

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
    <div className="wrapper equipment-catalog-page">

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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All categories</option>
            {categoryOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All status</option>
            {STATUS_OPTIONS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option>All departments</option>
            {departmentOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
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

            {filteredList.map((item) => (


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


                {/* CALIBRATION OVERDUE BADGE */}

                {overdueIds.includes(item.equipmentId) && (
                  <span style={{ background: "#ef4444", color: "#fff", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
                    Calibration overdue
                  </span>
                )}


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
