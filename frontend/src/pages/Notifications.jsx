import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  deleteReadNotifications,
} from "../services/notificationService";

import "./Notifications.css";


// =========================================================
// NOTIFICATION TYPE CONFIG
// =========================================================

function notificationConfig(type) {
  switch (type) {

    case "BOOKING_APPROVED":
      return {
        icon: "bi-calendar-check-fill",
        label: "Booking Approved",
        gradient: "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#2563eb",
        background: "#eff6ff",
      };

    case "BOOKING_REJECTED":
      return {
        icon: "bi-calendar-x-fill",
        label: "Booking Rejected",
        gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
        color: "#dc2626",
        background: "#fef2f2",
      };

    case "WAITLIST_SLOT_OPEN":
      return {
        icon: "bi-hourglass-split",
        label: "Waitlist Update",
        gradient: "linear-gradient(135deg, #f59e0b, #ea580c)",
        color: "#ea580c",
        background: "#fff7ed",
      };

    case "WORK_ORDER_ASSIGNED":
      return {
        icon: "bi-tools",
        label: "Work Order",
        gradient: "linear-gradient(135deg, #7c3aed, #9333ea)",
        color: "#7c3aed",
        background: "#f5f3ff",
      };

    case "ACCESS_REQUEST":
      return {
        icon: "bi-share-fill",
        label: "Access Request",
        gradient: "linear-gradient(135deg, #0891b2, #0e7490)",
        color: "#0891b2",
        background: "#ecfeff",
      };

    case "ACCESS_REQUEST_APPROVED":
      return {
        icon: "bi-check-circle-fill",
        label: "Access Approved",
        gradient: "linear-gradient(135deg, #059669, #0f766e)",
        color: "#059669",
        background: "#ecfdf5",
      };

    case "ACCESS_REQUEST_REJECTED":
      return {
        icon: "bi-x-circle-fill",
        label: "Access Rejected",
        gradient: "linear-gradient(135deg, #dc2626, #b91c1c)",
        color: "#dc2626",
        background: "#fef2f2",
      };

    case "CALIBRATION_DUE_SOON":
      return {
        icon: "bi-calendar-event-fill",
        label: "Calibration Reminder",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#d97706",
        background: "#fffbeb",
      };

    case "CALIBRATION_OVERDUE":
      return {
        icon: "bi-exclamation-triangle-fill",
        label: "Calibration Overdue",
        gradient: "linear-gradient(135deg, #dc2626, #ea580c)",
        color: "#dc2626",
        background: "#fef2f2",
      };

    case "CERTIFICATION_EXPIRING":
      return {
        icon: "bi-patch-exclamation-fill",
        label: "Certification Expiring",
        gradient: "linear-gradient(135deg, #7c3aed, #c026d3)",
        color: "#a21caf",
        background: "#fdf4ff",
      };

    case "CERTIFICATION_EXPIRED":
      return {
        icon: "bi-x-octagon-fill",
        label: "Certification Expired",
        gradient: "linear-gradient(135deg, #991b1b, #dc2626)",
        color: "#b91c1c",
        background: "#fef2f2",
      };

    default:
      return {
        icon: "bi-bell-fill",
        label: "Notification",
        gradient: "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "#2563eb",
        background: "#eff6ff",
      };
  }
}


// =========================================================
// NOTIFICATIONS PAGE
// =========================================================

export default function Notifications() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [deletingId, setDeletingId] = useState(null);

  const [clearingRead, setClearingRead] = useState(false);



// =========================================================
// LOAD NOTIFICATIONS
// =========================================================

async function loadNotifications() {
  try {
    const data = await getMyNotifications();

    setNotifications(data);

  } catch (err) {
    console.error(
      "Failed to load notifications:",
      err
    );

  } finally {
    setLoading(false);
  }
}


// =========================================================
// LOAD WHEN PAGE OPENS
// =========================================================

useEffect(() => {
  const timer = setTimeout(() => {
    loadNotifications();
  }, 0);

  return () => clearTimeout(timer);
}, []);
  // =========================================================
  // MARK AS READ
  // =========================================================

  async function handleMarkRead(id) {

    try {

      await markAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

    } catch (err) {

      console.error(
        "Failed to mark notification as read:",
        err
      );

    }
  }


  // =========================================================
  // DELETE SINGLE NOTIFICATION
  // =========================================================

  async function handleDelete(id) {

    const confirmed = window.confirm(
      "Delete this notification?"
    );

    if (!confirmed) return;

    try {

      setDeletingId(id);

      await deleteNotification(id);

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
      );

    } catch (err) {

      console.error(
        "Failed to delete notification:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete notification."
      );

    } finally {

      setDeletingId(null);

    }
  }


  // =========================================================
  // DELETE ALL READ NOTIFICATIONS
  // =========================================================

  async function handleClearRead() {

    if (readNotifications === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${readNotifications} read notifications?`
    );

    if (!confirmed) return;

    try {

      setClearingRead(true);

      await deleteReadNotifications();

      setNotifications((current) =>
        current.filter(
          (notification) =>
            !notification.isRead
        )
      );

    } catch (err) {

      console.error(
        "Failed to clear read notifications:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to clear read notifications."
      );

    } finally {

      setClearingRead(false);

    }
  }


  // =========================================================
  // COUNTS
  // =========================================================

  const totalNotifications =
    notifications.length;

  const unreadNotifications =
    notifications.filter(
      (n) => !n.isRead
    ).length;

  const readNotifications =
    notifications.filter(
      (n) => n.isRead
    ).length;


  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredNotifications = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    return notifications.filter((notification) => {

      // FILTER
      if (
        filter === "UNREAD" &&
        notification.isRead
      ) {
        return false;
      }

      if (
        filter === "READ" &&
        !notification.isRead
      ) {
        return false;
      }


      // SEARCH
      if (!query) {
        return true;
      }

      const config =
        notificationConfig(
          notification.type
        );

      return (
        notification.message
          ?.toLowerCase()
          .includes(query) ||

        notification.type
          ?.toLowerCase()
          .includes(query) ||

        config.label
          ?.toLowerCase()
          .includes(query)
      );
    });

  }, [
    notifications,
    search,
    filter,
  ]);


  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(date) {

    const value = new Date(date);

    return value.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }


  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatTime(date) {

    const value = new Date(date);

    return value.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="notifications-wrapper">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="notifications-content">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="notifications-header">

          <div className="notifications-header-left">

            <div className="notifications-title-icon">

              <i className="bi bi-bell-fill"></i>

              {unreadNotifications > 0 && (
                <span className="header-notification-dot"></span>
              )}

            </div>


            <div>

              <h1>
                Notifications
              </h1>

              <p>
                Stay updated with your laboratory activity
              </p>

            </div>

          </div>


          <button
            className="notifications-profile"
            onClick={() =>
              navigate("/profile")
            }
            title="My Profile"
          >

            <i className="bi bi-person-fill"></i>

          </button>

        </header>


        {/* ===================================================
            BODY
        =================================================== */}

        <div className="notifications-body">


          {/* =================================================
              HERO
          ================================================= */}

          <section className="notifications-intro">

            <div>

              <span>
                ACTIVITY CENTER
              </span>

              <h2>
                Your Notifications
              </h2>

              <p>
                Keep track of bookings, equipment access,
                waitlists, maintenance and important
                laboratory updates.
              </p>

            </div>


            <div className="notifications-intro-icon">

              <i className="bi bi-stars"></i>

            </div>

          </section>


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="notification-summary-grid">


            <div className="notification-summary-card total-card">

              <div className="summary-decoration"></div>

              <div className="summary-icon">

                <i className="bi bi-bell-fill"></i>

              </div>

              <div className="summary-content">

                <span>
                  TOTAL NOTIFICATIONS
                </span>

                <strong>
                  {totalNotifications}
                </strong>

                <small>
                  All your recent updates
                </small>

              </div>

            </div>


            <div className="notification-summary-card unread-card">

              <div className="summary-decoration"></div>

              <div className="summary-icon">

                <i className="bi bi-envelope-fill"></i>

              </div>

              <div className="summary-content">

                <span>
                  UNREAD
                </span>

                <strong>
                  {unreadNotifications}
                </strong>

                <small>
                  Awaiting your attention
                </small>

              </div>

            </div>


            <div className="notification-summary-card read-card">

              <div className="summary-decoration"></div>

              <div className="summary-icon">

                <i className="bi bi-check2-circle"></i>

              </div>

              <div className="summary-content">

                <span>
                  READ
                </span>

                <strong>
                  {readNotifications}
                </strong>

                <small>
                  Already viewed
                </small>

              </div>

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="notifications-loading">

              <div className="notifications-loading-icon">

                <i className="bi bi-bell-fill"></i>

              </div>

              <h3>
                Loading notifications
              </h3>

              <p>
                Fetching your latest updates...
              </p>

              <div className="notifications-loader"></div>

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            notifications.length === 0 && (

              <div className="notifications-empty">

                <div className="empty-notification-icon">

                  <i className="bi bi-bell-slash-fill"></i>

                </div>

                <h2>
                  You're all caught up!
                </h2>

                <p>
                  You don't have any notifications
                  right now. We'll let you know when
                  something important happens.
                </p>

                <button
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >

                  <i className="bi bi-grid-fill"></i>

                  Go to Dashboard

                </button>

              </div>

            )}


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {!loading &&
            notifications.length > 0 && (

              <section className="notifications-panel">


                {/* =================================================
                    PANEL HEADER
                ================================================= */}

                <div className="notifications-panel-header">

                  <div>

                    <h2>
                      Recent Activity
                    </h2>

                    <p>
                      Manage your laboratory notifications
                    </p>

                  </div>


                  <div className="notification-count-badge">

                    <i className="bi bi-bell"></i>

                    {filteredNotifications.length} Updates

                  </div>

                </div>


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="notifications-toolbar">


                  {/* SEARCH */}

                  <div className="notification-search">

                    <i className="bi bi-search"></i>

                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />

                    {search && (

                      <button
                        className="clear-search"
                        onClick={() =>
                          setSearch("")
                        }
                      >

                        <i className="bi bi-x-circle-fill"></i>

                      </button>

                    )}

                  </div>


                  {/* FILTERS */}

                  <div className="notification-filters">

                    <button
                      className={
                        filter === "ALL"
                          ? "filter-btn active"
                          : "filter-btn"
                      }
                      onClick={() =>
                        setFilter("ALL")
                      }
                    >

                      <i className="bi bi-grid-fill"></i>

                      All

                    </button>


                    <button
                      className={
                        filter === "UNREAD"
                          ? "filter-btn active unread-filter"
                          : "filter-btn"
                      }
                      onClick={() =>
                        setFilter("UNREAD")
                      }
                    >

                      <i className="bi bi-envelope-fill"></i>

                      Unread

                      {unreadNotifications > 0 && (
                        <span className="filter-count">
                          {unreadNotifications}
                        </span>
                      )}

                    </button>


                    <button
                      className={
                        filter === "READ"
                          ? "filter-btn active read-filter"
                          : "filter-btn"
                      }
                      onClick={() =>
                        setFilter("READ")
                      }
                    >

                      <i className="bi bi-check-circle-fill"></i>

                      Read

                    </button>

                  </div>


                  {/* CLEAR READ */}

                  <button
                    className="clear-read-btn"
                    onClick={handleClearRead}
                    disabled={
                      readNotifications === 0 ||
                      clearingRead
                    }
                  >

                    <i
                      className={
                        clearingRead
                          ? "bi bi-arrow-repeat spinning"
                          : "bi bi-trash3-fill"
                      }
                    ></i>

                    {clearingRead
                      ? "Clearing..."
                      : "Clear read"}

                  </button>

                </div>


                {/* =================================================
                    NO SEARCH RESULT
                ================================================= */}

                {filteredNotifications.length === 0 && (

                  <div className="no-results">

                    <div className="no-results-icon">

                      <i className="bi bi-search"></i>

                    </div>

                    <h3>
                      No notifications found
                    </h3>

                    <p>
                      Try another search or change the filter.
                    </p>

                    <button
                      onClick={() => {
                        setSearch("");
                        setFilter("ALL");
                      }}
                    >
                      Reset filters
                    </button>

                  </div>

                )}


                {/* =================================================
                    LIST
                ================================================= */}

                {filteredNotifications.length > 0 && (

                  <div className="notifications-list">

                    {filteredNotifications.map((n) => {

                      const config =
                        notificationConfig(
                          n.type
                        );

                      return (

                        <div
                          key={n.id}
                          className={`notification-item ${
                            !n.isRead
                              ? "notification-unread"
                              : ""
                          }`}
                        >


                          {/* COLOR LINE */}

                          <div
                            className="notification-color-line"
                            style={{
                              background:
                                config.gradient,
                            }}
                          ></div>


                          {/* ICON */}

                          <div
                            className="notification-item-icon"
                            style={{
                              background:
                                config.gradient,
                              boxShadow:
                                `0 8px 20px ${config.color}35`,
                            }}
                          >

                            <i
                              className={`bi ${config.icon}`}
                            ></i>

                          </div>


                          {/* CONTENT */}

                          <div
                            className="notification-item-content"
                            onClick={() => {

                              if (!n.isRead) {
                                handleMarkRead(n.id);
                              }

                            }}
                          >

                            <div className="notification-meta">

                              <span
                                className="notification-type"
                                style={{
                                  color:
                                    config.color,
                                  background:
                                    config.background,
                                }}
                              >
                                {config.label}
                              </span>


                              {!n.isRead && (

                                <span className="unread-label">

                                  <span className="unread-dot"></span>

                                  NEW

                                </span>

                              )}

                            </div>


                            <p
                              className={
                                !n.isRead
                                  ? "notification-message unread-message"
                                  : "notification-message"
                              }
                            >
                              {n.message}
                            </p>


                            <div className="notification-time">

                              <span>

                                <i className="bi bi-calendar3"></i>

                                {formatDate(
                                  n.createdAt
                                )}

                              </span>


                              <span>

                                <i className="bi bi-clock"></i>

                                {formatTime(
                                  n.createdAt
                                )}

                              </span>

                            </div>

                          </div>


                          {/* RIGHT ACTIONS */}

                          <div className="notification-right">


                            {!n.isRead && (

                              <button
                                className="mark-read-btn"
                                onClick={() =>
                                  handleMarkRead(
                                    n.id
                                  )
                                }
                                title="Mark as read"
                              >

                                <i className="bi bi-check2-circle"></i>

                                <span>
                                  Mark read
                                </span>

                              </button>

                            )}


                            <button
                              className="delete-notification-btn"
                              onClick={() =>
                                handleDelete(
                                  n.id
                                )
                              }
                              disabled={
                                deletingId === n.id
                              }
                              title="Delete notification"
                            >

                              <i
                                className={
                                  deletingId === n.id
                                    ? "bi bi-arrow-repeat spinning"
                                    : "bi bi-trash3-fill"
                                }
                              ></i>

                            </button>

                          </div>

                        </div>

                      );

                    })}

                  </div>

                )}

              </section>

            )}

        </div>

      </main>

    </div>
  );
}