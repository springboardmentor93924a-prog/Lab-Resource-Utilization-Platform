import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "../services/notificationService";


function Topbar() {

  const navigate = useNavigate();


  /* =====================================================
     CURRENT USER
  ===================================================== */

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {

    user = storedUser
      ? JSON.parse(storedUser)
      : null;

  } catch {

    user = null;

  }


  const userId =
    user?.id ??
    user?.userId ??
    null;


  /* =====================================================
     STATE
  ===================================================== */

  const [unreadCount, setUnreadCount] = useState(0);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/login");

  };


  /* =====================================================
     LOAD UNREAD COUNT
  ===================================================== */

  const loadUnreadCount = async () => {

    if (!userId) {

      setUnreadCount(0);

      return;

    }

    try {

      const count =
        await getUnreadNotificationCount(userId);


      setUnreadCount(
        Number(count) || 0
      );

    } catch (error) {

      console.error(
        "Failed to load unread notification count:",
        error
      );

      setUnreadCount(0);

    }

  };


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  const loadNotifications = async () => {

    if (!userId) {

      setNotifications([]);

      return;

    }

    try {

      setNotificationsLoading(true);


      const data =
        await getNotifications(userId);


      console.log(
        "Notifications received:",
        data
      );


      const notificationList =
        Array.isArray(data)
          ? [...data]
          : [];


      /* =================================================
         SORT LATEST FIRST
      ================================================= */

      notificationList.sort(
        (a, b) => {

          const dateA =
            new Date(
              a.createdAt ??
              a.createdDate ??
              a.timestamp ??
              0
            );


          const dateB =
            new Date(
              b.createdAt ??
              b.createdDate ??
              b.timestamp ??
              0
            );


          return dateB - dateA;

        }
      );


      /* =================================================
         SHOW LATEST 6
      ================================================= */

      setNotifications(
        notificationList.slice(0, 6)
      );


    } catch (error) {

      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);

    } finally {

      setNotificationsLoading(false);

    }

  };


  /* =====================================================
     NOTIFICATION BELL CLICK
  ===================================================== */

  const handleNotificationBellClick =
    async () => {

      const nextState =
        !showNotifications;


      setShowNotifications(nextState);


      if (nextState) {

        await Promise.all([
          loadNotifications(),
          loadUnreadCount(),
        ]);

      }

    };


  /* =====================================================
     MARK SINGLE NOTIFICATION AS READ
  ===================================================== */

  const handleMarkAsRead =
    async (notificationId) => {

      if (!notificationId) {
        return;
      }


      try {

        await markNotificationAsRead(
          notificationId
        );


        setNotifications(
          (previousNotifications) =>

            previousNotifications.map(
              (notification) => {

                if (
                  notification.id ===
                  notificationId
                ) {

                  return {
                    ...notification,
                    read: true,
                    isRead: true,
                  };

                }


                return notification;

              }
            )
        );


        await loadUnreadCount();


      } catch (error) {

        console.error(
          "Failed to mark notification as read:",
          error
        );

      }

    };


  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const handleMarkAllAsRead =
    async () => {

      if (!userId) {
        return;
      }


      try {

        await markAllNotificationsAsRead(
          userId
        );


        setNotifications(
          (previousNotifications) =>

            previousNotifications.map(
              (notification) => ({
                ...notification,
                read: true,
                isRead: true,
              })
            )
        );


        setUnreadCount(0);


      } catch (error) {

        console.error(
          "Failed to mark all notifications as read:",
          error
        );

      }

    };


  /* =====================================================
     AUTO REFRESH
  ===================================================== */

  useEffect(() => {

    loadUnreadCount();


    const interval =
      setInterval(
        loadUnreadCount,
        30000
      );


    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          loadUnreadCount();

        }

      };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {

      clearInterval(interval);


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

    };

  }, [userId]);


  /* =====================================================
     NOTIFICATION ICON
  ===================================================== */

  const getNotificationIcon =
    (type) => {

      switch (type) {

        case "BOOKING_CONFIRMATION":
        case "BOOKING_APPROVED":
          return "📅";


        case "BOOKING_REJECTED":
          return "❌";


        case "MAINTENANCE_ALERT":
        case "MAINTENANCE_REQUEST":
          return "🛠️";


        case "WORK_ORDER_ASSIGNED":
        case "WORK_ORDER_COMPLETED":
          return "🔧";


        case "CALIBRATION_DUE":
        case "CALIBRATION_EXPIRED":
          return "⚙️";


        case "CERTIFICATION_EXPIRING":
          return "📜";


        case "WAITLIST_AVAILABLE":
          return "⏳";


        case "SHARING_REQUEST":
        case "SHARING_APPROVED":
          return "🤝";


        case "SHARING_REJECTED":
          return "❌";


        case "BILLING_GENERATED":
        case "PAYMENT_PENDING":
          return "💰";


        case "IDLE_EQUIPMENT":
          return "📊";


        default:
          return "🔔";

      }

    };


  /* =====================================================
     GET READ STATUS SAFELY
  ===================================================== */

  const isNotificationRead =
    (notification) => {

      if (
        notification.read === true ||
        notification.isRead === true
      ) {

        return true;

      }

      return false;

    };


  /* =====================================================
     FORMAT NOTIFICATION DATE
  ===================================================== */

  const formatNotificationDate =
    (notification) => {

      const dateValue =
        notification.createdAt ??
        notification.createdDate ??
        notification.timestamp;


      if (!dateValue) {
        return "";
      }


      try {

        return new Date(
          dateValue
        ).toLocaleString();

      } catch {

        return "";

      }

    };


  /* =====================================================
     JSX
  ===================================================== */

  return (

    <header className="topbar">


      {/* ===============================================
          PLATFORM HEADER
      =============================================== */}

      <div className="topbar-title">

        <h1>
          Lab Equipment Utilization Platform
        </h1>

        <p>
          Manage laboratory resources,
          bookings and utilization
        </p>

      </div>


      {/* ===============================================
          RIGHT SIDE
      =============================================== */}

      <div className="topbar-right">


        {/* =============================================
            NOTIFICATION BELL
        ============================================= */}

        <div className="notification-bell-wrapper">


          <button
            className="notification-button"
            title="Notifications"
            type="button"
            onClick={
              handleNotificationBellClick
            }
          >

            <span className="notification-bell-icon">
              🔔
            </span>


            {unreadCount > 0 && (

              <span className="notification-count-badge">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </button>


          {/* ===========================================
              NOTIFICATION DROPDOWN
          =========================================== */}

          {showNotifications && (

            <div className="notification-dropdown">


              {/* HEADER */}

              <div className="notification-dropdown-header">

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <span>

                    {unreadCount === 0
                      ? "No unread notifications"
                      : `${unreadCount} unread`}

                  </span>

                </div>


                {unreadCount > 0 && (

                  <button
                    type="button"
                    className="mark-all-read-btn"
                    onClick={
                      handleMarkAllAsRead
                    }
                  >

                    Mark all read

                  </button>

                )}

              </div>


              {/* =======================================
                  NOTIFICATION LIST
              ======================================= */}

              <div className="notification-dropdown-list">


                {notificationsLoading ? (

                  <div className="notification-dropdown-loading">

                    Loading notifications...

                  </div>


                ) : notifications.length === 0 ? (

                  <div className="notification-dropdown-empty">

                    <span>
                      🔔
                    </span>

                    <p>
                      No notifications yet
                    </p>

                  </div>


                ) : (

                  notifications.map(
                    (notification) => {

                      const isRead =
                        isNotificationRead(
                          notification
                        );


                      return (

                        <button
                          key={
                            notification.id
                          }
                          type="button"
                          className={
                            `notification-dropdown-item ${
                              isRead
                                ? "read"
                                : "unread"
                            }`
                          }
                          onClick={
                            () => {

                              if (!isRead) {

                                handleMarkAsRead(
                                  notification.id
                                );

                              }

                            }
                          }
                        >


                          {/* ICON */}

                          <div className="notification-item-icon">

                            {getNotificationIcon(
                              notification.type
                            )}

                          </div>


                          {/* CONTENT */}

                          <div className="notification-item-content">


                            <strong>

                              {notification.title ||
                                "Notification"}

                            </strong>


                            <p>

                              {notification.message ||
                                ""}

                            </p>


                            <small>

                              {formatNotificationDate(
                                notification
                              )}

                            </small>

                          </div>


                          {/* UNREAD DOT */}

                          {!isRead && (

                            <span className="unread-dot" />

                          )}

                        </button>

                      );

                    }
                  )

                )}

              </div>


              {/* =======================================
                  FOOTER
              ======================================= */}

              <div className="notification-dropdown-footer">

                <button
                  type="button"
                  onClick={
                    () => {

                      setShowNotifications(false);

                      navigate(
                        "/notifications"
                      );

                    }
                  }
                >

                  View All Notifications

                </button>

              </div>


            </div>

          )}


        </div>


        {/* =============================================
            USER INFORMATION
        ============================================= */}

        <div className="topbar-user">

          <div className="user-avatar">

            {user?.fullName
              ? user.fullName
                  .charAt(0)
                  .toUpperCase()
              : "U"}

          </div>


          <div className="user-info">

            <strong>

              {user?.fullName ||
                "User"}

            </strong>


            <span>

              {user?.role ||
                "Researcher"}

            </span>

          </div>

        </div>


        {/* =============================================
            LOGOUT
        ============================================= */}

        <button
          className="logout-button"
          onClick={
            handleLogout
          }
        >

          Logout

        </button>


      </div>


    </header>

  );

}


export default Topbar;