import {
  useEffect,
  useState,
} from "react";

import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService";


function Notifications() {

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const storedUser =
    localStorage.getItem("user");


  let user = null;

  try {

    user =
      storedUser
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

  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState("ALL");


  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  const loadNotifications =
    async (
      selectedFilter = filter
    ) => {

      if (!userId) {

        setNotifications([]);
        setLoading(false);

        return;
      }


      try {

        setLoading(true);
        setError("");


        let data;


        if (
          selectedFilter ===
          "UNREAD"
        ) {

          data =
            await getUnreadNotifications(
              userId
            );

        } else {

          data =
            await getNotifications(
              userId
            );
        }


        const notificationList =
          Array.isArray(data)
            ? [...data]
            : [];


        /* Latest first */

        notificationList.sort(
          (a, b) => {

            const dateA =
              new Date(
                a.createdAt ??
                a.createdDate ??
                0
              );


            const dateB =
              new Date(
                b.createdAt ??
                b.createdDate ??
                0
              );


            return dateB - dateA;
          }
        );


        setNotifications(
          notificationList
        );

      } catch (err) {

        console.error(
          "Failed to load notifications:",
          err
        );


        setError(
          "Failed to load notifications. Please try again."
        );


        setNotifications([]);

      } finally {

        setLoading(false);
      }
    };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(
    () => {

      loadNotifications(
        filter
      );

    },
    [filter, userId]
  );


  /* =====================================================
     MARK SINGLE AS READ
  ===================================================== */

  const handleMarkAsRead =
    async (
      notificationId
    ) => {

      if (!notificationId) {
        return;
      }


      try {

        await markNotificationAsRead(
          notificationId
        );


        if (
          filter ===
          "UNREAD"
        ) {

          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.filter(
                (
                  notification
                ) =>
                  notification.id !==
                  notificationId
              )
          );

        } else {

          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.map(
                (
                  notification
                ) => {

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
        }

      } catch (err) {

        console.error(
          "Failed to mark notification as read:",
          err
        );


        setError(
          "Failed to update notification."
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

        setActionLoading(true);
        setError("");


        await markAllNotificationsAsRead(
          userId
        );


        if (
          filter ===
          "UNREAD"
        ) {

          setNotifications([]);

        } else {

          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.map(
                (
                  notification
                ) => ({
                  ...notification,
                  read: true,
                  isRead: true,
                })
              )
          );
        }

      } catch (err) {

        console.error(
          "Failed to mark all notifications as read:",
          err
        );


        setError(
          "Failed to mark all notifications as read."
        );

      } finally {

        setActionLoading(false);
      }
    };


  /* =====================================================
     DELETE NOTIFICATION
  ===================================================== */

  const handleDelete =
    async (
      notificationId
    ) => {

      if (!notificationId) {
        return;
      }


      const confirmed =
        window.confirm(
          "Are you sure you want to delete this notification?"
        );


      if (!confirmed) {
        return;
      }


      try {

        await deleteNotification(
          notificationId
        );


        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.filter(
              (
                notification
              ) =>
                notification.id !==
                notificationId
            )
        );

      } catch (err) {

        console.error(
          "Failed to delete notification:",
          err
        );


        setError(
          "Failed to delete notification."
        );
      }
    };


  /* =====================================================
     NOTIFICATION ICON
  ===================================================== */

  const getNotificationIcon =
    (
      type
    ) => {

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


        case "SYSTEM_ALERT":
          return "⚠️";


        default:
          return "🔔";
      }
    };


  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate =
    (
      date
    ) => {

      if (!date) {
        return "";
      }


      const parsedDate =
        new Date(date);


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return "";
      }


      return parsedDate.toLocaleString();
    };


  /* =====================================================
     UNREAD COUNT
  ===================================================== */

  const unreadCount =
    notifications.filter(
      (
        notification
      ) =>
        !(
          notification.read ??
          notification.isRead ??
          false
        )
    ).length;


  /* =====================================================
     JSX
  ===================================================== */

  return (

    <div className="notifications-page">


      {/* ===============================================
          PAGE HEADER
      =============================================== */}

      <div className="notifications-page-header">

        <div>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with your bookings,
            maintenance, calibration and laboratory activities.
          </p>

        </div>


        <button
          type="button"
          className="notifications-mark-all-button"
          onClick={
            handleMarkAllAsRead
          }
          disabled={
            actionLoading ||
            notifications.length === 0
          }
        >

          {actionLoading
            ? "Updating..."
            : "Mark All as Read"}

        </button>

      </div>


      {/* ===============================================
          FILTERS
      =============================================== */}

      <div className="notifications-toolbar">

        <div className="notifications-filters">

          <button
            type="button"
            className={
              `notification-filter-button ${
                filter === "ALL"
                  ? "active"
                  : ""
              }`
            }
            onClick={
              () =>
                setFilter(
                  "ALL"
                )
            }
          >

            All

          </button>


          <button
            type="button"
            className={
              `notification-filter-button ${
                filter === "UNREAD"
                  ? "active"
                  : ""
              }`
            }
            onClick={
              () =>
                setFilter(
                  "UNREAD"
                )
            }
          >

            Unread

          </button>

        </div>


        <div className="notifications-summary">

          {filter === "ALL"
            ? `${unreadCount} unread`
            : `${notifications.length} unread notifications`}

        </div>

      </div>


      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (

        <div className="notifications-error">

          <span>
            ⚠️
          </span>

          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={
              () =>
                loadNotifications(
                  filter
                )
            }
          >

            Retry

          </button>

        </div>

      )}


      {/* ===============================================
          LOADING
      =============================================== */}

      {loading ? (

        <div className="notifications-loading">

          Loading notifications...

        </div>

      ) : notifications.length === 0 ? (

        /* =============================================
            EMPTY STATE
        ============================================= */

        <div className="notifications-empty">

          <div className="notifications-empty-icon">

            🔔

          </div>


          <h3>
            No notifications yet
          </h3>


          <p>

            {filter === "UNREAD"
              ? "You have no unread notifications."
              : "Notifications from bookings, maintenance, calibration and other activities will appear here."}

          </p>

        </div>

      ) : (

        /* =============================================
            NOTIFICATION LIST
        ============================================= */

        <div className="notifications-list">

          {notifications.map(
            (
              notification
            ) => {

              const isRead =
                notification.read ??
                notification.isRead ??
                false;


              return (

                <div
                  key={
                    notification.id
                  }
                  className={
                    `notification-card ${
                      isRead
                        ? "read"
                        : "unread"
                    }`
                  }
                >


                  {/* ICON */}

                  <div className="notification-card-icon">

                    {getNotificationIcon(
                      notification.type
                    )}

                  </div>


                  {/* CONTENT */}

                  <div className="notification-card-content">

                    <div className="notification-card-title-row">

                      <h3>

                        {notification.title ||
                          "Notification"}

                      </h3>


                      {!isRead && (

                        <span className="notification-unread-label">

                          New

                        </span>

                      )}

                    </div>


                    <p>

                      {notification.message ||
                        ""}

                    </p>


                    <span className="notification-card-date">

                      {formatDate(
                        notification.createdAt ??
                        notification.createdDate
                      )}

                    </span>

                  </div>


                  {/* ACTIONS */}

                  <div className="notification-card-actions">


                    {!isRead && (

                      <button
                        type="button"
                        className="notification-read-button"
                        onClick={
                          () =>
                            handleMarkAsRead(
                              notification.id
                            )
                        }
                      >

                        Mark as Read

                      </button>

                    )}


                    <button
                      type="button"
                      className="notification-delete-button"
                      onClick={
                        () =>
                          handleDelete(
                            notification.id
                          )
                      }
                    >

                      Delete

                    </button>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>

  );
}


export default Notifications;