import Sidebar from "../components/Sidebar";
import "./EquipmentCatalog.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAllEquipment,
  getCalibrationAlerts,
} from "../services/equipmentService";
import { getUnreadCount } from "../services/notificationService";
import { isAdmin } from "../utils/auth";

export default function EquipmentCatalog() {
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overdueIds, setOverdueIds] = useState([]);

  // ==============================
  // SEARCH & FILTER STATES
  // ==============================

  const [topSearch, setTopSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // ==============================
  // NOTIFICATION STATE
  // ==============================

  const [unreadCount, setUnreadCount] = useState(0);

  const userIsAdmin = isAdmin();

  // ==============================
  // LOAD EQUIPMENT
  // ==============================

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await getAllEquipment();

        setEquipmentList(data);

        const alerts = await getCalibrationAlerts();

        setOverdueIds(
          alerts
            .filter((a) => a.urgency === "OVERDUE")
            .map((a) => a.equipmentId)
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load equipment"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, []);

  // ==============================
  // LOAD UNREAD NOTIFICATIONS
  // ==============================

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      try {
        const count = await getUnreadCount();

        if (!cancelled) {
          setUnreadCount(count);
        }
      } catch {
        if (!cancelled) {
          setUnreadCount(0);
        }
      }
    }

    loadUnreadCount();

    const interval = setInterval(
      loadUnreadCount,
      30000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ==============================
  // NAVIGATION FUNCTIONS
  // ==============================

  function handleView(id) {
    navigate(`/equipment/${id}`);
  }

  function handleAddEquipment() {
    navigate("/equipment/add");
  }

  function handleViewCalendar() {
    navigate("/equipment/calendar");
  }

  function handleNotifications() {
    navigate("/notifications");
  }

  // ==============================
  // DYNAMIC CATEGORY OPTIONS
  // ==============================

  const categories = [
    ...new Set(
      equipmentList
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ].sort();

  // ==============================
  // DYNAMIC DEPARTMENT OPTIONS
  // ==============================

  const departments = [
    ...new Set(
      equipmentList
        .map((item) => item.department)
        .filter(Boolean)
    ),
  ].sort();

  // ==============================
  // FILTER EQUIPMENT
  // ==============================

  const filteredEquipment = equipmentList.filter((item) => {
    const topSearchText =
      topSearch.trim().toLowerCase();

    const equipmentSearchText =
      equipmentSearch.trim().toLowerCase();

    const equipmentName =
      item.equipmentName?.toLowerCase() || "";

    const category =
      item.category?.toLowerCase() || "";

    const department =
      item.department?.toLowerCase() || "";

    const status =
      item.status?.toLowerCase() || "";

    // TOP SEARCH

    const matchesTopSearch =
      topSearchText === "" ||
      equipmentName.includes(topSearchText) ||
      category.includes(topSearchText) ||
      department.includes(topSearchText) ||
      status.includes(topSearchText);

    // EQUIPMENT SEARCH

    const matchesEquipmentSearch =
      equipmentSearchText === "" ||
      equipmentName.includes(equipmentSearchText);

    // CATEGORY

    const matchesCategory =
      categoryFilter === "" ||
      category === categoryFilter.toLowerCase();

    // STATUS

    const matchesStatus =
      statusFilter === "" ||
      status === statusFilter.toLowerCase();

    // DEPARTMENT

    const matchesDepartment =
      departmentFilter === "" ||
      department === departmentFilter.toLowerCase();

    return (
      matchesTopSearch &&
      matchesEquipmentSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesDepartment
    );
  });

  // ==============================
  // UI
  // ==============================

  return (
    <div className="wrapper">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="sidebar">
        <Sidebar />
      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="main-content">


        {/* =====================================================
            TOP NAVBAR
        ===================================================== */}

        <nav className="navbar">

          <h4>Equipment catalog</h4>

          <div className="nav-right">

            {/* TOP SEARCH */}

            <input
              type="text"
              className="form-control search-top"
              placeholder="Search..."
              value={topSearch}
              onChange={(e) =>
                setTopSearch(e.target.value)
              }
            />


            {/* =================================================
                NOTIFICATION BELL
            ================================================= */}

            <button
              type="button"
              onClick={handleNotifications}
              title="Notifications"
              aria-label="Notifications"
              style={{
                position: "relative",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border: "1px solid #2dd4bf",
                background: "#061a33",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
                marginLeft: "8px",
              }}
            >

              <i className="bi bi-bell"></i>

              {/* UNREAD COUNT */}

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#ef4444",
                    color: "#ffffff",
                    borderRadius: "999px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>


            {/* =================================================
                PROFILE
            ================================================= */}

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


          {/* EQUIPMENT SEARCH */}

          <input
            type="text"
            className="form-control search-box"
            placeholder="Search equipment"
            value={equipmentSearch}
            onChange={(e) =>
              setEquipmentSearch(e.target.value)
            }
          />


          {/* CATEGORY */}

          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >

            <option value="">
              All categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}

          </select>


          {/* STATUS */}

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="">
              All status
            </option>

            <option value="AVAILABLE">
              Available
            </option>

            <option value="IN_USE">
              In use
            </option>

            <option value="MAINTENANCE">
              Maintenance
            </option>

          </select>


          {/* DEPARTMENT */}

          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value)
            }
          >

            <option value="">
              All departments
            </option>

            {departments.map((department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
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
            LOADING
        ===================================================== */}

        {loading && (
          <p className="loading-message">
            Loading equipment...
          </p>
        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {/* =====================================================
            EQUIPMENT CATALOGUE
        ===================================================== */}

        {!loading && !error && (
          <>

            {/* RESULT COUNT */}

            <p
              style={{
                color: "#ffffff",
                margin: "10px 0 15px",
                fontSize: "14px",
              }}
            >
              Showing {filteredEquipment.length} of{" "}
              {equipmentList.length} equipment
            </p>


            {/* NO RESULTS */}

            {filteredEquipment.length === 0 ? (

              <div
                style={{
                  background: "#061a33",
                  border: "1px solid #1e4b73",
                  borderRadius: "10px",
                  padding: "30px",
                  textAlign: "center",
                  color: "#ffffff",
                }}
              >
                No equipment found matching your
                search or filters.
              </div>

            ) : (

              /* EQUIPMENT GRID */

              <div className="equipment-grid">

                {filteredEquipment.map((item) => (

                  <div
                    className="equipment-card"
                    key={item.id}
                  >

                    {/* IMAGE */}

                    <div className="image-placeholder">

                      <img
                        src={item.imageUrl}
                        alt={item.equipmentName}
                      />

                    </div>


                    {/* NAME */}

                    <h6>
                      {item.equipmentName}
                    </h6>


                    {/* CATEGORY + DEPARTMENT */}

                    <p>
                      {item.category} —{" "}
                      {item.department}
                    </p>


                    {/* CALIBRATION ALERT */}

                    {overdueIds.includes(item.id) && (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Calibration overdue
                      </span>
                    )}


                    {/* STATUS */}

                    <div
                      className={`status ${
                        item.status?.toLowerCase() || ""
                      }`}
                    ></div>


                    {/* VIEW */}

                    <button
                      className="btn btn-outline-dark w-100"
                      onClick={() =>
                        handleView(item.id)
                      }
                    >
                      View
                    </button>

                  </div>

                ))}

              </div>

            )}

          </>
        )}

      </div>

    </div>
  );
}