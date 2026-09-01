import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

import "./ResearcherDashboard.css";

import { getAllEquipment } from "../services/equipmentService";
import { getBookingsByUser } from "../services/bookingService";
import { getCurrentUserId } from "../utils/auth";
import { getUnreadCount } from "../services/notificationService";


// =========================================================
// RESEARCHER DASHBOARD
// =========================================================

export default function ResearcherDashboard() {

  const navigate = useNavigate();

  const { user } = useAuth();


  // =========================================================
  // ROLE NAMES
  // =========================================================

  const roleNames = {
    STUDENT: "Student",
    RESEARCHER: "Researcher",
    LAB_TECHNICIAN: "Lab Technician",
    LAB_MANAGER: "Lab Manager",
    DEPARTMENT_HEAD: "Department Head",
    INSTITUTION_ADMIN: "Institution Administrator",
    SYSTEM_ADMIN: "System Administrator",
  };


  const roleName =
    roleNames[user?.role] || "User";


  // =========================================================
  // STATES
  // =========================================================

  const [equipmentList, setEquipmentList] =
    useState([]);

  const [myBookings, setMyBookings] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);
  // =========================================================
  // SEARCH
  // =========================================================

  const [searchValue, setSearchValue] =
    useState("");

  const [showSearchResults, setShowSearchResults] =
    useState(false);


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    async function fetchData() {

      try {

        // ---------------------------------------------
        // EQUIPMENT
        // ---------------------------------------------

        const equipment =
          await getAllEquipment();

        setEquipmentList(equipment);


        // ---------------------------------------------
        // USER BOOKINGS
        // ---------------------------------------------

        const userId =
          getCurrentUserId();

        if (userId) {

          try {

            const bookings =
              await getBookingsByUser(userId);

            setMyBookings(bookings);

          } catch {

            setMyBookings([]);

          }

        }


        // ---------------------------------------------
        // NOTIFICATIONS
        // ---------------------------------------------

        try {

          const count =
            await getUnreadCount();

          setUnreadCount(count || 0);

        } catch (error) {

          console.error(
            "Failed to fetch unread notifications:",
            error
          );

          setUnreadCount(0);

        }

      } catch {

        setEquipmentList([]);

      }

    }


    fetchData();

  }, []);


  // =========================================================
  // SEARCH
  // =========================================================

  function handleSearchChange(e) {

    const value =
      e.target.value;

    setSearchValue(value);

    setShowSearchResults(
      value.trim().length > 0
    );

  }


  function handleSearchResultClick(path) {

    setSearchValue("");

    setShowSearchResults(false);

    navigate(path);

  }


  // =========================================================
  // SEARCH EQUIPMENT
  // =========================================================

  const matchingEquipment =
    equipmentList
      .filter((equipment) => {

        const search =
          searchValue
            .toLowerCase()
            .trim();

        return (

          equipment.equipmentName
            ?.toLowerCase()
            .includes(search)

          ||

          equipment.category
            ?.toLowerCase()
            .includes(search)

          ||

          equipment.status
            ?.toLowerCase()
            .includes(search)

        );

      })
      .slice(0, 5);


  // =========================================================
  // SEARCH BOOKINGS
  // =========================================================

  const matchingBookings =
    myBookings
      .filter((booking) => {

        const search =
          searchValue
            .toLowerCase()
            .trim();

        return (

          booking.equipmentName
            ?.toLowerCase()
            .includes(search)

          ||

          booking.bookingDate
            ?.toLowerCase()
            .includes(search)

          ||

          booking.bookingStatus
            ?.toLowerCase()
            .includes(search)

        );

      })
      .slice(0, 5);


  const totalSearchResults =
    matchingEquipment.length +
    matchingBookings.length;


  // =========================================================
  // DASHBOARD CALCULATIONS
  // =========================================================

  const availableCount =
    equipmentList.filter(
      (e) =>
        e.status === "AVAILABLE"
    ).length;


  const upcomingBookings =
    myBookings.filter(
      (b) =>
        b.bookingStatus === "PENDING" ||
        b.bookingStatus === "CONFIRMED"
    );


  


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <div
      className="container-main"
      style={{
        minHeight: "100vh",
      }}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="content">


        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div className="topbar">

          <h4>
            Welcome to {roleName} Dashboard
          </h4>


          <div className="top-right">


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="dashboard-search-wrapper">

              <input
                type="text"
                placeholder="Search equipment, bookings..."
                className="form-control search"
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => {

                  if (searchValue.trim()) {

                    setShowSearchResults(true);

                  }

                }}
              />


              {/* SEARCH RESULTS */}

              {showSearchResults && (

                <div className="search-results">

                  {totalSearchResults === 0 && (

                    <div className="search-no-results">
                      No results found
                    </div>

                  )}


                  {/* EQUIPMENT RESULTS */}

                  {matchingEquipment.length > 0 && (

                    <>

                      <div className="search-section-title">
                        Equipment
                      </div>


                      {matchingEquipment.map(
                        (equipment) => (

                          <button
                            key={`equipment-${equipment.id}`}
                            className="search-result-item"
                            onClick={() =>
                              handleSearchResultClick(
                                "/equipment"
                              )
                            }
                          >

                            <span className="search-result-icon">
                              <i className="bi bi-box-seam"></i>
                            </span>


                            <span className="search-result-content">

                              <strong>
                                {equipment.equipmentName}
                              </strong>

                              <small>
                                {equipment.category ||
                                  "Equipment"}{" "}
                                •{" "}
                                {equipment.status ||
                                  "Unknown status"}
                              </small>

                            </span>

                          </button>

                        )
                      )}

                    </>

                  )}


                  {/* BOOKING RESULTS */}

                  {matchingBookings.length > 0 && (

                    <>

                      <div className="search-section-title">
                        My bookings
                      </div>


                      {matchingBookings.map(
                        (booking) => (

                          <button
                            key={`booking-${booking.id}`}
                            className="search-result-item"
                            onClick={() =>
                              handleSearchResultClick(
                                "/my-bookings"
                              )
                            }
                          >

                            <span className="search-result-icon">
                              <i className="bi bi-calendar-check"></i>
                            </span>


                            <span className="search-result-content">

                              <strong>
                                {booking.equipmentName}
                              </strong>

                              <small>
                                {booking.bookingDate}{" "}
                                •{" "}
                                {booking.bookingStatus}
                              </small>

                            </span>

                          </button>

                        )
                      )}

                    </>

                  )}

                </div>

              )}

            </div>


            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <button
              className="notification-circle"
              onClick={() =>
                navigate("/notifications")
              }
              title="Notifications"
              aria-label="Notifications"
              style={{
                position: "relative",
              }}
            >

              <i className="bi bi-bell"></i>


              {unreadCount > 0 && (

                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "9px",
                    height: "9px",
                    background: "#ef4444",
                    borderRadius: "50%",
                    border:
                      "2px solid #020d20",
                  }}
                />

              )}

            </button>


            {/* =================================================
                PROFILE
            ================================================= */}

            <button
              type="button"
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

        </div>


        {/* ===================================================
            PREMIUM STAT CARDS
        =================================================== */}

        <div
          className="stats"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >


          {/* =================================================
              MY BOOKINGS
          ================================================= */}

          <div
            className="dashboard-kpi-card"
            onClick={() =>
              navigate("/my-bookings")
            }
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: "145px",
              padding: "24px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%)",
              color: "#ffffff",
              boxShadow:
                "0 10px 25px rgba(37,99,235,0.25)",
              cursor: "pointer",
            }}
          >

            {/* BIG CIRCLE */}

            <div
              style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.10)",
                right: "-35px",
                top: "-35px",
              }}
            />


            {/* SMALL CIRCLE */}

            <div
              style={{
                position: "absolute",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.06)",
                right: "45px",
                bottom: "-25px",
              }}
            />


            {/* CONTENT */}

            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    opacity: 0.85,
                    marginBottom: "10px",
                  }}
                >
                  MY BOOKINGS
                </div>


                <div
                  style={{
                    fontSize: "42px",
                    lineHeight: 1,
                    fontWeight: 800,
                  }}
                >
                  {upcomingBookings.length}
                </div>


                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    opacity: 0.85,
                  }}
                >
                  Upcoming reservations
                </div>

              </div>


              {/* ICON */}

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >

                <i className="bi bi-calendar-check-fill"></i>

              </div>

            </div>


            {/* BOTTOM LABEL */}

            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "24px",
                fontSize: "10px",
                opacity: 0.65,
                letterSpacing: "0.5px",
              }}
            >
              CLICK TO VIEW BOOKINGS
            </div>

          </div>


          {/* =================================================
              AVAILABLE NOW
          ================================================= */}

          <div
            className="dashboard-kpi-card"
            onClick={() =>
              navigate(
                "/equipment?status=AVAILABLE"
              )
            }
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: "145px",
              padding: "24px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #16a34a 0%, #15803d 55%, #166534 100%)",
              color: "#ffffff",
              boxShadow:
                "0 10px 25px rgba(22,163,74,0.23)",
              cursor: "pointer",
            }}
          >

            <div
              style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.10)",
                right: "-35px",
                top: "-35px",
              }}
            />


            <div
              style={{
                position: "absolute",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.06)",
                right: "45px",
                bottom: "-25px",
              }}
            />


            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    opacity: 0.85,
                    marginBottom: "10px",
                  }}
                >
                  AVAILABLE NOW
                </div>


                <div
                  style={{
                    fontSize: "42px",
                    lineHeight: 1,
                    fontWeight: 800,
                  }}
                >
                  {availableCount}
                </div>


                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    opacity: 0.85,
                  }}
                >
                  Equipment ready to book
                </div>

              </div>


              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >

                <i className="bi bi-check-circle-fill"></i>

              </div>

            </div>


            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "24px",
                fontSize: "10px",
                opacity: 0.65,
                letterSpacing: "0.5px",
              }}
            >
              READY FOR BOOKING
            </div>

          </div>


          {/* =================================================
              WAITLISTED
          ================================================= */}

          <div
            className="dashboard-kpi-card"
            onClick={() =>
              navigate("/my-waitlist")
            }
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: "145px",
              padding: "24px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #f59e0b 0%, #d97706 55%, #b45309 100%)",
              color: "#ffffff",
              boxShadow:
                "0 10px 25px rgba(245,158,11,0.23)",
              cursor: "pointer",
            }}
          >

            <div
              style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.10)",
                right: "-35px",
                top: "-35px",
              }}
            />


            <div
              style={{
                position: "absolute",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.06)",
                right: "45px",
                bottom: "-25px",
              }}
            />


            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    opacity: 0.85,
                    marginBottom: "10px",
                  }}
                >
                  WAITLISTED
                </div>


                <div
                  style={{
                    fontSize: "42px",
                    lineHeight: 1,
                    fontWeight: 800,
                  }}
                >
                  0
                </div>


                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    opacity: 0.85,
                  }}
                >
                  Items awaiting availability
                </div>

              </div>


              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >

                <i className="bi bi-hourglass-split"></i>

              </div>

            </div>


            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "24px",
                fontSize: "10px",
                opacity: 0.65,
                letterSpacing: "0.5px",
              }}
            >
              VIEW MY WAITLIST
            </div>

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div
            className="dashboard-kpi-card"
            onClick={() =>
              navigate("/notifications")
            }
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: "145px",
              padding: "24px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #64748b 0%, #475569 55%, #334155 100%)",
              color: "#ffffff",
              boxShadow:
                "0 10px 25px rgba(71,85,105,0.23)",
              cursor: "pointer",
            }}
          >

            <div
              style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.10)",
                right: "-35px",
                top: "-35px",
              }}
            />


            <div
              style={{
                position: "absolute",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.06)",
                right: "45px",
                bottom: "-25px",
              }}
            />


            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    opacity: 0.85,
                    marginBottom: "10px",
                  }}
                >
                  NOTIFICATIONS
                </div>


                <div
                  style={{
                    fontSize: "42px",
                    lineHeight: 1,
                    fontWeight: 800,
                  }}
                >
                  {unreadCount}
                </div>


                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    opacity: 0.85,
                  }}
                >
                  Unread notifications
                </div>

              </div>


              <div
                style={{
                  position: "relative",
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >

                <i className="bi bi-bell-fill"></i>


                {unreadCount > 0 && (

                  <span
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      width: "10px",
                      height: "10px",
                      background: "#ef4444",
                      borderRadius: "50%",
                      border:
                        "2px solid rgba(255,255,255,0.8)",
                    }}
                  />

                )}

              </div>

            </div>


            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "24px",
                fontSize: "10px",
                opacity: 0.65,
                letterSpacing: "0.5px",
              }}
            >
              CLICK TO VIEW ALERTS
            </div>

          </div>


        </div>


        {/* ===================================================
    UPCOMING RESERVATIONS - PREMIUM COLORFUL CARD
=================================================== */}

<div
  style={{
    position: "relative",
    overflow: "hidden",

    /* REDUCED LEFT + RIGHT WIDTH */
    width: "calc(100% - 40px)",
    marginLeft: "20px",
    marginRight: "20px",

    marginBottom: "30px",
    padding: "25px",

    borderRadius: "20px",

    /* MAGICAL BLUE/PURPLE GRADIENT */
    background:
      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 45%, #4338ca 100%)",

    color: "#ffffff",

    boxShadow:
      "0 12px 30px rgba(37, 99, 235, 0.25)",

    border:
      "1px solid rgba(255,255,255,0.12)",
  }}
>

  {/* =================================================
      DECORATIVE LARGE CIRCLE
  ================================================= */}

  <div
    style={{
      position: "absolute",
      width: "220px",
      height: "220px",
      borderRadius: "50%",

      background:
        "rgba(255,255,255,0.09)",

      right: "-90px",
      top: "-100px",

      pointerEvents: "none",
    }}
  />


  {/* =================================================
      DECORATIVE SMALL CIRCLE
  ================================================= */}

  <div
    style={{
      position: "absolute",
      width: "100px",
      height: "100px",
      borderRadius: "50%",

      background:
        "rgba(255,255,255,0.07)",

      right: "130px",
      bottom: "-55px",

      pointerEvents: "none",
    }}
  />


  {/* =================================================
      DECORATIVE GLOW
  ================================================= */}

  <div
    style={{
      position: "absolute",
      width: "180px",
      height: "180px",
      borderRadius: "50%",

      background:
        "rgba(129,140,248,0.16)",

      left: "-100px",
      bottom: "-100px",

      filter: "blur(5px)",

      pointerEvents: "none",
    }}
  />


  {/* =================================================
      HEADER
  ================================================= */}

  <div
    style={{
      position: "relative",
      zIndex: 2,

      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",

      marginBottom: "20px",

      flexWrap: "wrap",
      gap: "12px",
    }}
  >

    {/* LEFT HEADER */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >

      {/* MAGIC ICON */}

      <div
        style={{
          width: "52px",
          height: "52px",

          borderRadius: "15px",

          background:
            "rgba(255,255,255,0.16)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontSize: "23px",

          boxShadow:
            "0 6px 15px rgba(0,0,0,0.12)",

          backdropFilter: "blur(8px)",

          border:
            "1px solid rgba(255,255,255,0.18)",
        }}
      >

        <i className="bi bi-calendar-event-fill"></i>

      </div>


      {/* TITLE */}

      <div>

        <h5
          style={{
            margin: 0,

            color: "#ffffff",

            fontSize: "19px",

            fontWeight: 800,

            letterSpacing: "0.2px",
          }}
        >
          Upcoming Reservations
        </h5>


        <p
          style={{
            margin: "5px 0 0",

            color:
              "rgba(255,255,255,0.78)",

            fontSize: "13px",
          }}
        >
          Your upcoming equipment bookings
        </p>

      </div>

    </div>


    {/* =================================================
        UPCOMING COUNT
    ================================================= */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        background:
          "rgba(255,255,255,0.13)",

        color: "#ffffff",

        border:
          "1px solid rgba(255,255,255,0.22)",

        padding: "8px 14px",

        borderRadius: "999px",

        fontSize: "12px",

        fontWeight: 700,

        backdropFilter: "blur(8px)",
      }}
    >

      <i className="bi bi-calendar-check-fill"></i>

      {upcomingBookings.length} Upcoming

    </div>

  </div>


  {/* =================================================
      EMPTY STATE
  ================================================= */}

  {upcomingBookings.length === 0 && (

    <div
      style={{
        position: "relative",
        zIndex: 2,

        padding: "35px 20px",

        textAlign: "center",

        background:
          "rgba(255,255,255,0.96)",

        borderRadius: "16px",

        border:
          "1px solid rgba(255,255,255,0.35)",

        boxShadow:
          "0 8px 20px rgba(0,0,0,0.10)",
      }}
    >

      {/* =================================================
          MAGIC CALENDAR ICON
      ================================================= */}

      <div
        style={{
          width: "62px",
          height: "62px",

          margin: "0 auto 14px",

          borderRadius: "18px",

          background:
            "linear-gradient(135deg, #dbeafe, #c7d2fe)",

          color: "#2563eb",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontSize: "25px",

          boxShadow:
            "0 7px 16px rgba(37,99,235,0.18)",
        }}
      >

        <i className="bi bi-calendar-x-fill"></i>

      </div>


      {/* TITLE */}

      <h6
        style={{
          margin: "0 0 7px",

          color: "#0f172a",

          fontSize: "16px",

          fontWeight: 800,
        }}
      >
        No upcoming reservations
      </h6>


      {/* DESCRIPTION */}

      <p
        style={{
          margin: "0 0 18px",

          color: "#64748b",

          fontSize: "13px",
        }}
      >
        You don't have any upcoming equipment
        bookings right now.
      </p>


      {/* =================================================
          BROWSE EQUIPMENT BUTTON
      ================================================= */}

      <button
        onClick={() =>
          navigate(
            "/equipment?status=AVAILABLE"
          )
        }
        style={{
          border: "none",

          background:
            "linear-gradient(135deg, #2563eb, #1d4ed8)",

          color: "#ffffff",

          padding: "10px 19px",

          borderRadius: "11px",

          fontSize: "12px",

          fontWeight: 700,

          cursor: "pointer",

          boxShadow:
            "0 7px 15px rgba(37,99,235,0.25)",

          transition:
            "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >

        <i
          className="bi bi-search"
          style={{
            marginRight: "7px",
          }}
        ></i>

        Browse Equipment

      </button>

    </div>

  )}


  {/* =================================================
      RESERVATION LIST
  ================================================= */}

  {upcomingBookings.length > 0 && (

    <div
      style={{
        position: "relative",
        zIndex: 2,

        display: "grid",

        gap: "12px",
      }}
    >

      {upcomingBookings.map(
        (b) => (

          <div
            className="reservation"
            key={b.id}

            style={{
              display: "flex",

              alignItems: "center",

              justifyContent:
                "space-between",

              gap: "15px",

              padding:
                "15px 17px",

              borderRadius: "14px",

              background:
                "rgba(255,255,255,0.96)",

              border:
                "1px solid rgba(255,255,255,0.45)",

              boxShadow:
                "0 5px 15px rgba(0,0,0,0.10)",

              flexWrap: "wrap",
            }}
          >

            {/* =================================================
                EQUIPMENT
            ================================================= */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "12px",

                minWidth: "220px",
              }}
            >

              <div
                style={{
                  width: "43px",
                  height: "43px",

                  borderRadius: "12px",

                  background:
                    "linear-gradient(135deg, #dbeafe, #c7d2fe)",

                  color: "#2563eb",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  fontSize: "18px",

                  flexShrink: 0,

                  boxShadow:
                    "0 4px 10px rgba(37,99,235,0.12)",
                }}
              >

                <i className="bi bi-box-seam-fill"></i>

              </div>


              <div>

                <div
                  style={{
                    color: "#0f172a",

                    fontSize: "14px",

                    fontWeight: 800,
                  }}
                >
                  {b.equipmentName}
                </div>


                <div
                  style={{
                    color: "#64748b",

                    fontSize: "11px",

                    marginTop: "3px",
                  }}
                >
                  Equipment reservation
                </div>

              </div>

            </div>


            {/* =================================================
                DATE
            ================================================= */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "8px",

                color: "#475569",

                fontSize: "12px",

                fontWeight: 600,
              }}
            >

              <i
                className="bi bi-calendar3"
                style={{
                  color: "#2563eb",
                }}
              ></i>

              {b.bookingDate}

            </div>


            {/* =================================================
                TIME
            ================================================= */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "8px",

                color: "#475569",

                fontSize: "12px",

                fontWeight: 600,
              }}
            >

              <i
                className="bi bi-clock-fill"
                style={{
                  color: "#0d9488",
                }}
              ></i>

              {b.startTime} - {b.endTime}

            </div>


            {/* =================================================
                STATUS
            ================================================= */}

            <span
              style={{
                background:
                  b.bookingStatus ===
                  "CONFIRMED"
                    ? "#dcfce7"
                    : "#fef3c7",

                color:
                  b.bookingStatus ===
                  "CONFIRMED"
                    ? "#15803d"
                    : "#b45309",

                border:
                  b.bookingStatus ===
                  "CONFIRMED"
                    ? "1px solid #bbf7d0"
                    : "1px solid #fde68a",

                padding:
                  "6px 11px",

                borderRadius:
                  "999px",

                fontSize:
                  "10px",

                fontWeight:
                  800,
              }}
            >

              <i
                className={
                  b.bookingStatus ===
                  "CONFIRMED"
                    ? "bi bi-check-circle-fill"
                    : "bi bi-hourglass-split"
                }

                style={{
                  marginRight: "5px",
                }}
              ></i>

              {b.bookingStatus}

            </span>

          </div>

        )
      )}

    </div>

  )}

</div>

      

      </main>

    </div>

  );

}