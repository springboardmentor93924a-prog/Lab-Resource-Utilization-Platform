import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import api from "../services/api";

import "./ResearcherAnalyticsDashboard.css";

function ResearcherAnalyticsDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [utilization, setUtilization] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getLoggedInUser = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("Invalid stored user:", err);
      return null;
    }
  };

  // =========================================================
  // GET USER ID
  // =========================================================

  const getUserId = (currentUser) => {
    return (
      currentUser?.userId ??
      currentUser?.id ??
      currentUser?.user?.userId ??
      currentUser?.user?.id ??
      null
    );
  };

  // =========================================================
  // RESPONSE ARRAY HELPER
  // =========================================================

  const getArrayData = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.bookings)) {
      return data.bookings;
    }

    if (Array.isArray(data?.waitlists)) {
      return data.waitlists;
    }

    if (Array.isArray(data?.equipment)) {
      return data.equipment;
    }

    if (Array.isArray(data?.utilization)) {
      return data.utilization;
    }

    return [];
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const currentUser = getLoggedInUser();

      if (!currentUser) {
        setError("Please login to view your dashboard.");
        return;
      }

      setUser(currentUser);

      const userId = getUserId(currentUser);

      if (!userId) {
        setError(
          "User information is missing. Please login again."
        );
        return;
      }

      // =====================================================
      // LOAD ACTUAL DATABASE DATA
      // =====================================================

      const results = await Promise.allSettled([
        api.get(`/bookings/user/${userId}`),
        api.get(`/waitlists/user/${userId}`),
        api.get("/equipment"),
        api.get("/utilization"),
      ]);

      // =====================================================
      // BOOKINGS
      // =====================================================

      if (results[0].status === "fulfilled") {
        setBookings(
          getArrayData(results[0].value)
        );
      } else {
        console.error(
          "Bookings loading error:",
          results[0].reason
        );

        setBookings([]);
      }

      // =====================================================
      // WAITLISTS
      // =====================================================

      if (results[1].status === "fulfilled") {
        setWaitlists(
          getArrayData(results[1].value)
        );
      } else {
        console.error(
          "Waitlist loading error:",
          results[1].reason
        );

        setWaitlists([]);
      }

      // =====================================================
      // EQUIPMENT
      // =====================================================

      if (results[2].status === "fulfilled") {
        setEquipment(
          getArrayData(results[2].value)
        );
      } else {
        console.error(
          "Equipment loading error:",
          results[2].reason
        );

        setEquipment([]);
      }

      // =====================================================
      // UTILIZATION
      // =====================================================

      if (results[3].status === "fulfilled") {
        setUtilization(
          getArrayData(results[3].value)
        );
      } else {
        console.error(
          "Utilization loading error:",
          results[3].reason
        );

        setUtilization([]);
      }

      setLastUpdated(new Date());

    } catch (err) {
      console.error(
        "Researcher dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to load researcher dashboard."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    loadDashboard(false);
  };

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getBookingDate = (booking) => {
    if (!booking?.bookingDate) {
      return null;
    }

    const date = new Date(
      `${booking.bookingDate}T00:00:00`
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const isFutureOrToday = (booking) => {
    const date = getBookingDate(booking);

    return date && date >= today;
  };

  // =========================================================
  // BOOKING COUNTS
  // =========================================================

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const status = String(
          booking.status || ""
        ).toUpperCase();

        return (
          isFutureOrToday(booking) &&
          status !== "CANCELLED" &&
          status !== "NO_SHOW" &&
          status !== "COMPLETED"
        );
      })
      .sort(
        (a, b) =>
          new Date(
            `${a.bookingDate}T${a.startTime || "00:00:00"}`
          ) -
          new Date(
            `${b.bookingDate}T${b.startTime || "00:00:00"}`
          )
      );
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        String(booking.status || "").toUpperCase() ===
        "COMPLETED"
    );
  }, [bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        String(booking.status || "").toUpperCase() ===
        "PENDING_APPROVAL"
    );
  }, [bookings]);

  // =========================================================
  // WAITLIST COUNTS
  // =========================================================

  const activeWaitlists = useMemo(() => {
    return waitlists.filter((waitlist) => {
      const status = String(
        waitlist.status || ""
      ).toUpperCase();

      return (
        status === "WAITING" ||
        status === "NOTIFIED"
      );
    });
  }, [waitlists]);

  // =========================================================
  // EQUIPMENT STATUS
  // =========================================================

  const equipmentCounts = useMemo(() => {
    const counts = {
      total: equipment.length,
      available: 0,
      inUse: 0,
      booked: 0,
      maintenance: 0,
    };

    equipment.forEach((item) => {
      const status = String(
        item.status || ""
      ).toUpperCase();

      if (status === "AVAILABLE") {
        counts.available++;
      } else if (
        status === "IN_USE"
      ) {
        counts.inUse++;
      } else if (
        status === "BOOKED"
      ) {
        counts.booked++;
      } else if (
        status === "UNDER_MAINTENANCE" ||
        status === "MAINTENANCE"
      ) {
        counts.maintenance++;
      }
    });

    return counts;
  }, [equipment]);

  // =========================================================
  // USAGE HISTORY
  //
  // Researcher usage is derived from completed bookings.
  // =========================================================

  const usageHistory = useMemo(() => {
    return completedBookings
      .map((booking) => {
        const start = booking.startTime;
        const end = booking.endTime;

        let duration = 0;

        if (start && end) {
          const startParts = start
            .toString()
            .split(":")
            .map(Number);

          const endParts = end
            .toString()
            .split(":")
            .map(Number);

          const startMinutes =
            startParts[0] * 60 +
            startParts[1];

          const endMinutes =
            endParts[0] * 60 +
            endParts[1];

          if (endMinutes > startMinutes) {
            duration =
              (endMinutes - startMinutes) / 60;
          }
        }

        return {
          ...booking,
          duration,
        };
      })
      .sort(
        (a, b) =>
          new Date(
            `${b.bookingDate}T${b.startTime || "00:00:00"}`
          ) -
          new Date(
            `${a.bookingDate}T${a.startTime || "00:00:00"}`
          )
      );
  }, [completedBookings]);

  const totalUsageHours = useMemo(() => {
    return usageHistory.reduce(
      (total, booking) =>
        total + Number(booking.duration || 0),
      0
    );
  }, [usageHistory]);

  // =========================================================
  // AVAILABILITY LIST
  // =========================================================

  const availableEquipment = useMemo(() => {
    return equipment
      .filter(
        (item) =>
          String(item.status || "")
            .toUpperCase() === "AVAILABLE"
      )
      .slice(0, 6);
  }, [equipment]);

  // =========================================================
  // RESEARCHER NOTIFICATIONS / UPDATES
  //
  // Derived from actual booking and waitlist records.
  // =========================================================

  const notifications = useMemo(() => {
    const updates = [];

    pendingBookings.slice(0, 3).forEach((booking) => {
      updates.push({
        id: `pending-${booking.id}`,
        type: "pending",
        icon: "⏳",
        title: "Booking awaiting approval",
        message: `${
          booking.equipmentName ||
          booking.equipment?.name ||
          "Equipment"
        } booking is awaiting approval.`,
        date: booking.bookingDate,
      });
    });

    upcomingBookings.slice(0, 3).forEach((booking) => {
      updates.push({
        id: `upcoming-${booking.id}`,
        type: "upcoming",
        icon: "📅",
        title: "Upcoming booking",
        message: `${
          booking.equipmentName ||
          booking.equipment?.name ||
          "Equipment"
        } is booked for ${booking.bookingDate}.`,
        date: booking.bookingDate,
      });
    });

    activeWaitlists
      .filter(
        (waitlist) =>
          String(waitlist.status || "")
            .toUpperCase() === "NOTIFIED"
      )
      .slice(0, 3)
      .forEach((waitlist) => {
        updates.push({
          id: `notified-${waitlist.id}`,
          type: "success",
          icon: "🔔",
          title: "Waitlist update",
          message: `${
            waitlist.equipmentName ||
            "Equipment"
          } waitlist has been updated.`,
          date: waitlist.bookingDate,
        });
      });

    return updates.slice(0, 6);
  }, [
    pendingBookings,
    upcomingBookings,
    activeWaitlists,
  ]);

  // =========================================================
  // UTILIZATION LOOKUP
  // =========================================================

  const getUtilizationForEquipment = (item) => {
    const equipmentId =
      item.id ??
      item.equipmentId;

    const record = utilization.find(
      (entry) =>
        String(
          entry.equipmentId ??
          entry.equipment?.id
        ) === String(equipmentId)
    );

    if (!record) {
      return null;
    }

    return Number(
      record.utilizationPercentage ??
      record.utilization ??
      record.usagePercentage ??
      0
    );
  };

  // =========================================================
  // EQUIPMENT NAME
  // =========================================================

  const getEquipmentName = (booking) => {
    return (
      booking?.equipmentName ||
      booking?.equipment?.name ||
      "Equipment"
    );
  };

  // =========================================================
  // STATUS FORMAT
  // =========================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toString()
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    return (
      status
        ?.toString()
        .toLowerCase()
        .replaceAll("_", "-") ||
      "unknown"
    );
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString();
    } catch {
      return value;
    }
  };

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formatTime = (value) => {
    if (!value) {
      return "—";
    }

    return value.toString().slice(0, 5);
  };

  // =========================================================
  // USER NAME
  // =========================================================

  const userName =
    user?.fullName ||
    user?.name ||
    user?.user?.fullName ||
    user?.user?.name ||
    "Researcher";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="app-layout">

        <Sidebar />

        <div className="main-area">

          <Topbar />

          <main className="main-content">

            <div className="researcher-dashboard-loading">
              <div className="researcher-spinner"></div>

              <p>
                Loading your dashboard...
              </p>
            </div>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    // <div className="app-layout">

    //   <Sidebar />

    //   <div className="main-area">

    //     <Topbar />

        <main className="main-content">

          <div className="researcher-dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="researcher-header">

              <div>
                <span className="researcher-eyebrow">
                  RESEARCHER PORTAL
                </span>

                <h1>
                  Welcome, {userName}
                </h1>

                <p>
                  Track your bookings, equipment
                  availability, usage and waitlist
                  activity.
                </p>
              </div>

              <div className="researcher-header-actions">

                <button
                  className="researcher-secondary-button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing
                    ? "Refreshing..."
                    : "↻ Refresh"}
                </button>

                <button
                  className="researcher-primary-button"
                  onClick={() =>
                    navigate("/equipment")
                  }
                >
                  + Book Equipment
                </button>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="researcher-error">
                ⚠ {error}
              </div>
            )}

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="researcher-summary-grid">

              <div className="researcher-summary-card">
                <span className="researcher-card-icon">
                  📅
                </span>

                <div>
                  <span>
                    My Bookings
                  </span>

                  <strong>
                    {bookings.length}
                  </strong>
                </div>
              </div>

              <div className="researcher-summary-card">
                <span className="researcher-card-icon">
                  🔜
                </span>

                <div>
                  <span>
                    Upcoming
                  </span>

                  <strong>
                    {upcomingBookings.length}
                  </strong>
                </div>
              </div>

              <div className="researcher-summary-card">
                <span className="researcher-card-icon">
                  ⏳
                </span>

                <div>
                  <span>
                    Waitlists
                  </span>

                  <strong>
                    {activeWaitlists.length}
                  </strong>
                </div>
              </div>

              <div className="researcher-summary-card">
                <span className="researcher-card-icon">
                  🧪
                </span>

                <div>
                  <span>
                    Available Equipment
                  </span>

                  <strong>
                    {equipmentCounts.available}
                  </strong>
                </div>
              </div>

              <div className="researcher-summary-card">
                <span className="researcher-card-icon">
                  ⏱️
                </span>

                <div>
                  <span>
                    Usage Hours
                  </span>

                  <strong>
                    {totalUsageHours.toFixed(1)}
                  </strong>
                </div>
              </div>

            </div>

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="researcher-main-grid">

              {/* =================================================
                  UPCOMING BOOKINGS
              ================================================= */}

              <section className="researcher-panel">

                <div className="researcher-panel-header">

                  <div>
                    <h2>
                      Upcoming Bookings
                    </h2>

                    <p>
                      Your next scheduled equipment
                      sessions.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/my-bookings")
                    }
                  >
                    View All
                  </button>

                </div>

                {upcomingBookings.length === 0 ? (

                  <div className="researcher-empty">
                    <div>📅</div>

                    <h3>
                      No upcoming bookings
                    </h3>

                    <p>
                      You currently have no upcoming
                      equipment sessions.
                    </p>

                    <button
                      className="researcher-primary-button"
                      onClick={() =>
                        navigate("/equipment")
                      }
                    >
                      Browse Equipment
                    </button>
                  </div>

                ) : (

                  <div className="researcher-booking-list">

                    {upcomingBookings
                      .slice(0, 5)
                      .map((booking) => (

                        <div
                          className="researcher-booking-item"
                          key={booking.id}
                        >

                          <div className="researcher-booking-icon">
                            🧪
                          </div>

                          <div className="researcher-booking-info">

                            <strong>
                              {getEquipmentName(
                                booking
                              )}
                            </strong>

                            <span>
                              {formatDate(
                                booking.bookingDate
                              )}
                              {" • "}
                              {formatTime(
                                booking.startTime
                              )}
                              {" - "}
                              {formatTime(
                                booking.endTime
                              )}
                            </span>

                          </div>

                          <span
                            className={`researcher-status ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {formatStatus(
                              booking.status
                            )}
                          </span>

                        </div>

                      ))}

                  </div>

                )}

              </section>

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <section className="researcher-panel">

                <div className="researcher-panel-header">

                  <div>
                    <h2>
                      Updates & Notifications
                    </h2>

                    <p>
                      Important updates from your
                      activity.
                    </p>
                  </div>

                  <span className="researcher-notification-count">
                    {notifications.length}
                  </span>

                </div>

                {notifications.length === 0 ? (

                  <div className="researcher-empty-small">
                    <span>🔔</span>

                    <p>
                      No new updates.
                    </p>
                  </div>

                ) : (

                  <div className="researcher-notification-list">

                    {notifications.map(
                      (notification) => (

                        <div
                          className={`researcher-notification ${notification.type}`}
                          key={notification.id}
                        >

                          <span className="notification-icon">
                            {notification.icon}
                          </span>

                          <div>
                            <strong>
                              {notification.title}
                            </strong>

                            <p>
                              {notification.message}
                            </p>

                            {notification.date && (
                              <small>
                                {formatDate(
                                  notification.date
                                )}
                              </small>
                            )}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            </div>

            {/* =================================================
                SECOND GRID
            ================================================= */}

            <div className="researcher-main-grid">

              {/* =================================================
                  EQUIPMENT AVAILABILITY
              ================================================= */}

              <section className="researcher-panel">

                <div className="researcher-panel-header">

                  <div>
                    <h2>
                      Equipment Availability
                    </h2>

                    <p>
                      Equipment currently available
                      for booking.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/equipment")
                    }
                  >
                    Browse All
                  </button>

                </div>

                <div className="researcher-equipment-grid">

                  {availableEquipment.length === 0 ? (

                    <div className="researcher-empty">
                      <div>🧪</div>

                      <h3>
                        No equipment available
                      </h3>

                      <p>
                        Check again later for
                        available resources.
                      </p>
                    </div>

                  ) : (

                    availableEquipment.map(
                      (item) => {

                        const utilizationValue =
                          getUtilizationForEquipment(
                            item
                          );

                        return (
                          <div
                            className="researcher-equipment-card"
                            key={item.id}
                          >

                            <div className="researcher-equipment-top">

                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={
                                    item.name ||
                                    "Equipment"
                                  }
                                />
                              ) : (
                                <div className="researcher-equipment-placeholder">
                                  🧪
                                </div>
                              )}

                              <span className="available-badge">
                                Available
                              </span>

                            </div>

                            <h3>
                              {item.name ||
                                "Equipment"}
                            </h3>

                            <p>
                              {item.category ||
                                "Laboratory Equipment"}
                            </p>

                            <span className="researcher-asset-tag">
                              {item.assetTag ||
                                "No asset tag"}
                            </span>

                            {utilizationValue !==
                              null && (
                              <div className="researcher-utilization">

                                <div>
                                  <span>
                                    Utilization
                                  </span>

                                  <strong>
                                    {utilizationValue.toFixed(
                                      1
                                    )}
                                    %
                                  </strong>
                                </div>

                                <div className="researcher-progress">
                                  <div
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          utilizationValue,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>

                              </div>
                            )}

                            <button
                              onClick={() =>
                                navigate(
                                  `/equipment/${item.id}`
                                )
                              }
                            >
                              View Equipment
                            </button>

                          </div>
                        );
                      }
                    )

                  )}

                </div>

              </section>

              {/* =================================================
                  WAITLIST STATUS
              ================================================= */}

              <section className="researcher-panel">

                <div className="researcher-panel-header">

                  <div>
                    <h2>
                      My Waitlist Status
                    </h2>

                    <p>
                      Track your equipment waitlist
                      requests.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/my-waitlist")
                    }
                  >
                    View All
                  </button>

                </div>

                {waitlists.length === 0 ? (

                  <div className="researcher-empty">
                    <div>⏳</div>

                    <h3>
                      No waitlist requests
                    </h3>

                    <p>
                      You are not currently waiting
                      for any equipment.
                    </p>

                    <button
                      className="researcher-primary-button"
                      onClick={() =>
                        navigate("/equipment")
                      }
                    >
                      Browse Equipment
                    </button>
                  </div>

                ) : (

                  <div className="researcher-waitlist-list">

                    {waitlists
                      .slice(0, 6)
                      .map((waitlist) => (

                        <div
                          className="researcher-waitlist-item"
                          key={waitlist.id}
                        >

                          <div>
                            <strong>
                              {waitlist.equipmentName ||
                                "Equipment"}
                            </strong>

                            <span>
                              {formatDate(
                                waitlist.bookingDate
                              )}
                              {" • "}
                              {formatTime(
                                waitlist.startTime
                              )}
                              {" - "}
                              {formatTime(
                                waitlist.endTime
                              )}
                            </span>

                            {waitlist.assetTag && (
                              <small>
                                Asset:{" "}
                                {waitlist.assetTag}
                              </small>
                            )}
                          </div>

                          <span
                            className={`researcher-status ${getStatusClass(
                              waitlist.status
                            )}`}
                          >
                            {formatStatus(
                              waitlist.status
                            )}
                          </span>

                        </div>

                      ))}

                  </div>

                )}

              </section>

            </div>

            {/* =================================================
                USAGE HISTORY
            ================================================= */}

            <section className="researcher-panel researcher-history-panel">

              <div className="researcher-panel-header">

                <div>
                  <h2>
                    Usage History
                  </h2>

                  <p>
                    Your completed equipment sessions
                    and recorded usage.
                  </p>
                </div>

                <div className="researcher-history-total">
                  <strong>
                    {totalUsageHours.toFixed(1)}
                  </strong>
                  <span>
                    total hours
                  </span>
                </div>

              </div>

              {usageHistory.length === 0 ? (

                <div className="researcher-empty">
                  <div>📊</div>

                  <h3>
                    No usage history yet
                  </h3>

                  <p>
                    Completed equipment sessions
                    will appear here.
                  </p>
                </div>

              ) : (

                <div className="researcher-history-table-wrapper">

                  <table className="researcher-history-table">

                    <thead>
                      <tr>
                        <th>
                          Equipment
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Time
                        </th>

                        <th>
                          Duration
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {usageHistory
                        .slice(0, 8)
                        .map((booking) => (

                          <tr key={booking.id}>

                            <td>
                              <strong>
                                {getEquipmentName(
                                  booking
                                )}
                              </strong>
                            </td>

                            <td>
                              {formatDate(
                                booking.bookingDate
                              )}
                            </td>

                            <td>
                              {formatTime(
                                booking.startTime
                              )}
                              {" - "}
                              {formatTime(
                                booking.endTime
                              )}
                            </td>

                            <td>
                              {Number(
                                booking.duration
                              ).toFixed(1)}
                              {" hrs"}
                            </td>

                            <td>
                              <span className="researcher-status completed">
                                Completed
                              </span>
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="researcher-quick-actions">

              <button
                onClick={() =>
                  navigate("/equipment")
                }
              >
                <span>🧪</span>

                <div>
                  <strong>
                    Browse Equipment
                  </strong>

                  <small>
                    Find and book laboratory resources
                  </small>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate("/my-bookings")
                }
              >
                <span>📅</span>

                <div>
                  <strong>
                    My Bookings
                  </strong>

                  <small>
                    Manage your equipment bookings
                  </small>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate("/my-waitlist")
                }
              >
                <span>⏳</span>

                <div>
                  <strong>
                    My Waitlist
                  </strong>

                  <small>
                    Track your waiting requests
                  </small>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate("/calendar")
                }
              >
                <span>🗓️</span>

                <div>
                  <strong>
                    Equipment Calendar
                  </strong>

                  <small>
                    View equipment schedules
                  </small>
                </div>
              </button>

            </section>

            {/* =================================================
                LAST UPDATED
            ================================================= */}

            <div className="researcher-last-updated">

              Last updated:{" "}

              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : "—"}

            </div>

          </div>

        </main>

    //   </div>

    // </div>
  );
}

export default ResearcherAnalyticsDashboard;