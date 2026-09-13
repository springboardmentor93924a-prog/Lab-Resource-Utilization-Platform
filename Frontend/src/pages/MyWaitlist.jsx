
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

function MyWaitlist() {
  const navigate = useNavigate();

  const [waitlists, setWaitlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getLoggedInUserId = () => {
    const storedUser = localStorage.getItem("user");

    console.log("Stored user:", storedUser);

    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      console.log("Parsed user:", user);

      const userId =
        user.userId ??
        user.id ??
        user.user?.userId ??
        user.user?.id;

      console.log("Logged-in User ID:", userId);

      return userId || null;
    } catch (err) {
      console.error("Invalid user data:", err);
      return null;
    }
  };

  // =========================================================
  // LOAD WAITLISTS
  // =========================================================

  useEffect(() => {
    loadWaitlists();
  }, []);

  const loadWaitlists = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        setError(
          "Please login to view your waitlists."
        );

        setWaitlists([]);
        return;
      }

      // =====================================================
      // GET USER WAITLISTS
      // =====================================================

      const response = await api.get(
        `/waitlists/user/${userId}`
      );

      console.log(
        "My Waitlist API Response:",
        response.data
      );

      const data = response.data;

      // =====================================================
      // HANDLE RESPONSE
      // =====================================================

      if (Array.isArray(data)) {
        setWaitlists(data);
      } else if (Array.isArray(data?.waitlists)) {
        setWaitlists(data.waitlists);
      } else if (Array.isArray(data?.data)) {
        setWaitlists(data.data);
      } else {
        console.warn(
          "Unexpected waitlist response:",
          data
        );

        setWaitlists([]);
      }

    } catch (err) {
      console.error(
        "My Waitlist API Error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const message = err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to load your waitlists."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setSuccess("");
    await loadWaitlists(false);
  };

  // =========================================================
  // CANCEL WAITLIST
  // =========================================================

  const handleCancel = async (waitlistId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this waitlist request?"
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(waitlistId);
    setError("");
    setSuccess("");

    try {
      console.log(
        "Cancelling waitlist:",
        waitlistId
      );

      const response = await api.put(
        `/waitlists/${waitlistId}/cancel`
      );

      console.log(
        "Cancel response:",
        response.data
      );

      setSuccess(
        "Waitlist cancelled successfully."
      );

      // =====================================================
      // UPDATE UI IMMEDIATELY
      // =====================================================

      setWaitlists((previous) =>
        previous.map((waitlist) =>
          waitlist.id === waitlistId
            ? {
                ...waitlist,
                status: "CANCELLED",
              }
            : waitlist
        )
      );

    } catch (err) {
      console.error(
        "Cancel waitlist error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const message = err.response?.data;

      setError(
        typeof message === "string"
          ? message
          : "Unable to cancel waitlist."
      );

    } finally {
      setCancellingId(null);
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "unknown";
    }

    return status
      .toString()
      .toLowerCase()
      .replaceAll("_", "-")
      .replaceAll(" ", "-");
  };

  // =========================================================
  // STATUS TEXT
  // =========================================================

  const getStatusText = (status) => {
    if (!status) {
      return "UNKNOWN";
    }

    return status
      .toString()
      .replaceAll("_", " ");
  };

  // =========================================================
  // FORMAT CREATED DATE
  // =========================================================

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) {
      return "Not available";
    }

    try {
      return new Date(createdAt).toLocaleString();
    } catch {
      return createdAt;
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      // <div className="app-layout">

      //   <Sidebar />

      //   <div className="main-area">

      //     <Topbar />

          <main className="main-content">

            <div className="loading">
              Loading your waitlists...
            </div>

          </main>

      //   </div>

      // </div>
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

          <div className=" my-waitlist-page">

          <div className=" my-waitlist-page-header">

            <div>

              <h1>
                My Waitlist
              </h1>

              <p>
                View and manage your equipment
                waitlist requests.
              </p>

            </div>

            <div className="page-header-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate("/equipment")
                }
              >
                + Browse Equipment
              </button>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {waitlists.length === 0 && !error && (

            <div className="empty-state">

              <div className="empty-icon">
                ⏳
              </div>

              <h2>
                No Waitlists Found
              </h2>

              <p>
                You have not joined any equipment
                waitlists yet.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate("/equipment")
                }
              >
                Browse Equipment
              </button>

            </div>
          )}

          {/* =================================================
              WAITLIST LIST
          ================================================= */}

          {waitlists.length > 0 && (

            <div className="waitlists-list">

              {waitlists.map((waitlist) => {

                // =================================================
                // EQUIPMENT DATA
                // =================================================

                const equipment =
                  waitlist.equipment || {};

                const equipmentName =
                  waitlist.equipmentName ||
                  equipment.name ||
                  "Equipment";

                const equipmentCategory =
                  waitlist.equipmentCategory ||
                  equipment.category ||
                  "Equipment";

                const equipmentAssetTag =
                  waitlist.equipmentAssetTag ||
                  equipment.assetTag ||
                  "";

                const equipmentImage =
                  waitlist.equipmentImageUrl ||
                  equipment.imageUrl ||
                  null;

                // =================================================
                // STATUS
                // =================================================

                const status =
                  waitlist.status ||
                  "WAITING";

                const normalizedStatus =
                  status
                    .toString()
                    .toUpperCase();

                const isCancelled =
                  normalizedStatus ===
                  "CANCELLED";

                return (

                  <div
                    className="waitlist-card"
                    key={waitlist.id}
                  >

                    {/* =========================================
                        EQUIPMENT INFORMATION
                    ========================================= */}

                    <div className="waitlist-equipment">

                      {equipmentImage ? (

                        <img
                          src={equipmentImage}
                          alt={equipmentName}
                          className="waitlist-equipment-image"
                        />

                      ) : (

                        <div className="waitlist-equipment-placeholder">
                          🔬
                        </div>

                      )}

                      <div className="waitlist-equipment-info">

                        <h2>
                          {equipmentName}
                        </h2>

                        <p>
                          {equipmentCategory}
                        </p>

                        {equipmentAssetTag && (
                          <span className="asset-tag">
                            Asset Tag:{" "}
                            {equipmentAssetTag}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* =========================================
                        WAITLIST DETAILS
                    ========================================= */}

                    <div className="waitlist-details">

                      {/* DATE */}

                      <div className="detail-item">

                        <span className="detail-label">
                          Date
                        </span>

                        <span>
                          {waitlist.bookingDate ||
                            "Not specified"}
                        </span>

                      </div>

                      {/* TIME */}

                      <div className="detail-item">

                        <span className="detail-label">
                          Time
                        </span>

                        <span>
                          {waitlist.startTime ||
                            "--:--"}

                          {" - "}

                          {waitlist.endTime ||
                            "--:--"}
                        </span>

                      </div>

                      {/* PURPOSE */}

                      <div className="detail-item">

                        <span className="detail-label">
                          Purpose
                        </span>

                        <span>
                          {waitlist.purpose ||
                            "Not specified"}
                        </span>

                      </div>

                      {/* STATUS */}

                      <div className="detail-item">

                        <span className="detail-label">
                          Status
                        </span>

                        <span
                          className={`waitlist-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>

                      </div>

                      {/* CREATED AT */}

                      <div className="detail-item">

                        <span className="detail-label">
                          Joined
                        </span>

                        <span>
                          {formatCreatedAt(
                            waitlist.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    <div className="waitlist-actions">

                      {!isCancelled ? (

                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() =>
                            handleCancel(
                              waitlist.id
                            )
                          }
                          disabled={
                            cancellingId ===
                            waitlist.id
                          }
                        >

                          {cancellingId ===
                          waitlist.id
                            ? "Cancelling..."
                            : "Cancel Waitlist"}

                        </button>

                      ) : (

                        <span className="waitlist-action-info">
                          ✓ Waitlist cancelled
                        </span>

                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}
        
        </div>
        </main>

    //   </div>

    // </div>
  );
}

export default MyWaitlist;
