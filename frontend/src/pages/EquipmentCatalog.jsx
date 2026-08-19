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

  // =========================================================
  // EQUIPMENT STATE
  // =========================================================

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overdueIds, setOverdueIds] = useState([]);

  // =========================================================
  // SEARCH & FILTER STATES
  // =========================================================

  const [topSearch, setTopSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // =========================================================
  // NOTIFICATION STATE
  // =========================================================

  const [unreadCount, setUnreadCount] = useState(0);

  const userIsAdmin = isAdmin();

  // =========================================================
  // LOAD EQUIPMENT
  // =========================================================

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

  // =========================================================
  // LOAD UNREAD NOTIFICATIONS
  // =========================================================

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

  // =========================================================
  // NAVIGATION FUNCTIONS
  // =========================================================

  function handleView(id) {
    navigate(`/equipment/${id}`);
  }

  function getStatusLabel(status) {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "AVAILABLE";

      case "IN_USE":
        return "IN USE";

      case "MAINTENANCE":
        return "MAINTENANCE";

      case "RETIRED":
        return "RETIRED";

      case "OUT_OF_SERVICE":
        return "OUT OF SERVICE";

      default:
        return status || "UNKNOWN";
    }
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

  // =========================================================
  // DYNAMIC CATEGORY OPTIONS
  // =========================================================

  const categories = [
    ...new Set(
      equipmentList
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ].sort();

  // =========================================================
  // DYNAMIC DEPARTMENT OPTIONS
  // =========================================================

  const departments = [
    ...new Set(
      equipmentList
        .map((item) => item.department)
        .filter(Boolean)
    ),
  ].sort();

  // =========================================================
  // FILTER EQUIPMENT
  // =========================================================

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

  // =========================================================
  // COUNTS
  // =========================================================

  const availableCount = equipmentList.filter(
    (item) =>
      item.status?.toUpperCase() === "AVAILABLE"
  ).length;

  const maintenanceCount = equipmentList.filter(
    (item) =>
      item.status?.toUpperCase() === "MAINTENANCE"
  ).length;

  const inUseCount = equipmentList.filter(
    (item) =>
      item.status?.toUpperCase() === "IN_USE"
  ).length;

  // =========================================================
  // UI
  // =========================================================

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

          <div className="catalog-title">

            <div className="catalog-title-icon">
              <i className="bi bi-grid-3x3-gap-fill"></i>
            </div>

            <div>
              <h4>Equipment Catalog</h4>

              <span>
                Laboratory resource management
              </span>
            </div>

          </div>


          <div className="nav-right">

            {/* TOP SEARCH */}

            <div className="top-search-wrapper">

              <i className="bi bi-search"></i>

              <input
                type="text"
                className="search-top"
                placeholder="Search equipment, bookings..."
                value={topSearch}
                onChange={(e) =>
                  setTopSearch(e.target.value)
                }
              />

            </div>


            {/* NOTIFICATION BELL */}

            <button
              type="button"
              className="notification-button"
              onClick={handleNotifications}
              title="Notifications"
              aria-label="Notifications"
            >

              <i className="bi bi-bell"></i>

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>


            {/* PROFILE */}

            <button
              className="profile-circle"
              onClick={() =>
                navigate("/profile")
              }
              title="My Profile"
              aria-label="My Profile"
            >
              👤
            </button>

          </div>

        </nav>


        {/* =====================================================
            HERO SECTION
        ===================================================== */}

        <section className="catalog-hero">

          <div className="catalog-hero-content">

            <div className="catalog-eyebrow">
              <i className="bi bi-stars"></i>

              LABORATORY RESOURCE CENTER
            </div>


            <h1>
              Explore Your
              <span> Equipment.</span>
            </h1>


            <p>
              Discover, monitor and manage laboratory
              equipment across your institution.
            </p>


            {/* HERO STATS */}

            <div className="catalog-hero-stats">

              {/* TOTAL */}

              <div className="hero-mini-stat">

                <div className="hero-mini-icon blue">
                  <i className="bi bi-box-seam-fill"></i>
                </div>

                <div>
                  <strong>
                    {equipmentList.length}
                  </strong>

                  <span>
                    Total Equipment
                  </span>
                </div>

              </div>


              {/* AVAILABLE */}

              <div className="hero-mini-stat">

                <div className="hero-mini-icon green">
                  <i className="bi bi-check-circle-fill"></i>
                </div>

                <div>
                  <strong>
                    {availableCount}
                  </strong>

                  <span>
                    Available
                  </span>
                </div>

              </div>


              {/* IN USE */}

              <div className="hero-mini-stat">

                <div className="hero-mini-icon purple">
                  <i className="bi bi-activity"></i>
                </div>

                <div>
                  <strong>
                    {inUseCount}
                  </strong>

                  <span>
                    In Use
                  </span>
                </div>

              </div>


              {/* MAINTENANCE */}

              <div className="hero-mini-stat">

                <div className="hero-mini-icon orange">
                  <i className="bi bi-tools"></i>
                </div>

                <div>
                  <strong>
                    {maintenanceCount}
                  </strong>

                  <span>
                    Maintenance
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* MAGICAL HERO GRAPHIC */}

          <div className="catalog-hero-art">

            <div className="hero-orbit orbit-one"></div>

            <div className="hero-orbit orbit-two"></div>

            <div className="hero-main-icon">
              <i className="bi bi-boxes"></i>
            </div>

            <div className="floating-icon icon-one">
              <i className="bi bi-microscope"></i>
            </div>

            <div className="floating-icon icon-two">
              <i className="bi bi-beaker-fill"></i>
            </div>

            <div className="floating-icon icon-three">
              <i className="bi bi-cpu-fill"></i>
            </div>

          </div>

        </section>


        {/* =====================================================
            FILTER SECTION
        ===================================================== */}

        <div className="filters">

          <div className="filter-heading">

            <div className="filter-heading-icon">
              <i className="bi bi-sliders2"></i>
            </div>

            <div>

              <h3>
                Find Equipment
              </h3>

              <p>
                Search and filter laboratory resources
              </p>

            </div>

          </div>


          <div className="filter-controls">

            {/* EQUIPMENT SEARCH */}

            <div className="input-icon-wrapper">

              <i className="bi bi-search"></i>

              <input
                type="text"
                className="form-control search-box"
                placeholder="Search equipment"
                value={equipmentSearch}
                onChange={(e) =>
                  setEquipmentSearch(
                    e.target.value
                  )
                }
              />

            </div>


            {/* CATEGORY */}

            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
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
                setStatusFilter(
                  e.target.value
                )
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
                setDepartmentFilter(
                  e.target.value
                )
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

          </div>


          {/* FILTER ACTIONS */}

          <div className="filter-actions">

            <button
              className="view-calendar-btn"
              onClick={handleViewCalendar}
            >
              <i className="bi bi-calendar3"></i>

              View Calendar
            </button>


            {userIsAdmin && (
              <button
                className="add-btn"
                onClick={handleAddEquipment}
              >
                <i className="bi bi-plus-lg"></i>

                Add Equipment
              </button>
            )}

          </div>

        </div>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="loading-container">

            <div className="loading-spinner">
              <i className="bi bi-arrow-repeat"></i>
            </div>

            <p>
              Loading equipment...
            </p>

          </div>
        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="error-container">

            <i className="bi bi-exclamation-triangle-fill"></i>

            <p>
              {error}
            </p>

          </div>
        )}


        {/* =====================================================
            EQUIPMENT CATALOGUE
        ===================================================== */}

        {!loading && !error && (
          <>

            {/* SECTION HEADING */}

            <div className="catalog-section-heading">

              <div className="section-title-left">

                <div className="section-title-icon">
                  <i className="bi bi-grid-fill"></i>
                </div>

                <div>

                  <span className="section-eyebrow">
                    EQUIPMENT COLLECTION
                  </span>

                  <h2>
                    Available Laboratory Equipment
                  </h2>

                  <p>
                    Browse equipment available across
                    your laboratory
                  </p>

                </div>

              </div>


              <div className="equipment-count-badge">

                <i className="bi bi-box-seam"></i>

                {filteredEquipment.length} Equipment

              </div>

            </div>


            {/* NO RESULTS */}

            {filteredEquipment.length === 0 ? (

              <div className="no-results">

                <div className="no-results-icon">
                  <i className="bi bi-search"></i>
                </div>

                <h3>
                  No Equipment Found
                </h3>

                <p>
                  No equipment matches your
                  current search or filters.
                </p>

                <button
                  onClick={() => {
                    setTopSearch("");
                    setEquipmentSearch("");
                    setCategoryFilter("");
                    setStatusFilter("");
                    setDepartmentFilter("");
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                  Clear Filters
                </button>

              </div>

            ) : (

              /* EQUIPMENT GRID */

              <div className="equipment-grid">

                {filteredEquipment.map((item) => (

                  <div
                    className="equipment-card"
                    key={item.id}
                    onClick={() =>
                      handleView(item.id)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" ||
                        e.key === " "
                      ) {
                        handleView(item.id);
                      }
                    }}
                  >

                    {/* IMAGE */}

                    <div className="image-placeholder">

                      <img
                        src={item.imageUrl}
                        alt={item.equipmentName}
                      />

                      <div className="image-glow"></div>


                      {/* CATEGORY BADGE */}

                      <div className="equipment-category-badge">

                        <i className="bi bi-box-seam"></i>

                        {item.category ||
                          "Laboratory Equipment"}

                      </div>

                    </div>


                    {/* CARD BODY */}

                    <div className="equipment-card-body">

                      <div className="equipment-icon-small">

                        <i className="bi bi-cpu-fill"></i>

                      </div>


                      <div className="equipment-info">

                        <h6>
                          {item.equipmentName}
                        </h6>

                        <p>

                          <i className="bi bi-building"></i>

                          {item.department ||
                            "General Department"}

                        </p>

                      </div>

                    </div>


                    {/* CALIBRATION ALERT */}

                    {overdueIds.includes(item.id) && (

                      <div className="calibration-warning">

                        <i className="bi bi-exclamation-triangle-fill"></i>

                        Calibration overdue

                      </div>

                    )}


                    {/* STATUS */}

                    <div
                      className={`status ${
                        item.status?.toLowerCase() || ""
                      }`}
                    >

                      <i className="bi bi-circle-fill"></i>

                      {getStatusLabel(
                        item.status
                      )}

                    </div>


                    {/* VIEW BUTTON */}

                    <button
                      className="view-equipment-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(item.id);
                      }}
                    >

                      <span>
                        View Equipment
                      </span>

                      <i className="bi bi-arrow-right"></i>

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