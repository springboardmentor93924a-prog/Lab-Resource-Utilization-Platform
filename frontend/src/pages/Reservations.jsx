import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Reservations.css";

function Reservations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, UPCOMING, IN_USE, PENDING, COMPLETED
  const [viewMode, setViewMode] = useState("TABLE"); // TABLE or CALENDAR
  const [selectedCalEquipment, setSelectedCalEquipment] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sharingBlock, setSharingBlock] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  const [formData, setFormData] = useState({
    equipmentId: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const myUserId = sessionStorage.getItem("userId");

  const isStudent = role === "STUDENT";
  const canManageBookings = [
    "LAB_TECHNICIAN",
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const nowLocalString = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fetchEquipmentList = () => {
    fetch("http://localhost:8080/api/equipment", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEquipmentList(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !selectedCalEquipment) {
          setSelectedCalEquipment(String(data[0].equipmentId));
        }
      })
      .catch((err) => console.error("Equipment list error:", err));
  };

  const fetchBookings = () => {
    fetch("http://localhost:8080/api/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Booking error:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
    fetchEquipmentList();

    const prefillId = searchParams.get("equipmentId");
    if (prefillId) {
      setFormData((prev) => ({ ...prev, equipmentId: prefillId }));
      setSelectedCalEquipment(prefillId);
      setShowForm(true);
    }

    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      startTime: "",
      endTime: "",
      purpose: "",
    });
    setEditingId(null);
    setShowForm(false);
    setConflictError(null);
    setSharingBlock(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);

    const bookingData = {
      equipment: {
        equipmentId: Number(formData.equipmentId),
      },
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      bookingStatus: "Pending Approval",
    };

    try {
      const url = editingId
        ? `http://localhost:8080/api/bookings/${editingId}`
        : "http://localhost:8080/api/bookings";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            (editingId ? "Failed to update booking" : "Failed to create booking")
        );
      }

      alert(
        editingId
          ? "Booking updated successfully"
          : "Booking created successfully"
      );

      resetForm();
      fetchBookings();
    } catch (error) {
      if (error.message.includes("not shared with yours")) {
        setSharingBlock(formData.equipmentId);
      } else {
        setConflictError(error.message);
      }
    }
  };

  const handleRequestAccess = async () => {
    const item = equipmentList.find(
      (eq) => eq.equipmentId === Number(sharingBlock)
    );

    if (!item?.institution?.institutionId) {
      alert("Could not determine this equipment's institution.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/resource-sharing/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            equipment: { equipmentId: Number(sharingBlock) },
            senderInstitution: { institutionId: item.institution.institutionId },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to request access");
      }

      alert("Access request submitted. You'll be able to book once your institution approves it.");
      setSharingBlock(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking.bookingId);
    setFormData({
      equipmentId: booking.equipment?.equipmentId || "",
      startTime: booking.startTime || "",
      endTime: booking.endTime || "",
      purpose: booking.purpose || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "You are not allowed to delete this booking");
      }

      alert("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "You are not allowed to approve this booking");
      }

      alert("Booking approved");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "You are not allowed to reject this booking");
      }

      alert("Booking rejected");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "You are not allowed to complete this booking");
      }

      alert("Booking marked as completed");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "UPCOMING") return b.bookingStatus === "Confirmed";
      if (activeTab === "IN_USE") return b.bookingStatus === "In Use";
      if (activeTab === "PENDING") return b.bookingStatus === "Pending Approval";
      if (activeTab === "COMPLETED") return b.bookingStatus === "Completed";
      return true;
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return <span className="res-status-badge res-status-confirmed">✅ Confirmed</span>;
      case "In Use":
        return <span className="res-status-badge res-status-inuse">🟦 In Use</span>;
      case "Pending Approval":
        return <span className="res-status-badge res-status-pending">⏳ Pending Approval</span>;
      case "Rejected":
        return <span className="res-status-badge res-status-rejected">❌ Rejected</span>;
      case "Cancelled":
        return <span className="res-status-badge res-status-cancelled">⚪ Cancelled</span>;
      case "Completed":
        return <span className="res-status-badge res-status-completed">✔ Completed</span>;
      case "No Show":
        return <span className="res-status-badge res-status-noshow">⚫ No Show</span>;
      default:
        return <span className="res-status-badge res-status-cancelled">{status}</span>;
    }
  };

  // Calendar slot builder for selected equipment
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="reservations-page">
      {/* Top Controls */}
      <div className="reservations-topbar">
        <div className="reservations-tabs">
          <button
            className={`tab-btn ${activeTab === "ALL" ? "active" : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "UPCOMING" ? "active" : ""}`}
            onClick={() => setActiveTab("UPCOMING")}
          >
            Upcoming ({bookings.filter((b) => b.bookingStatus === "Confirmed").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "IN_USE" ? "active" : ""}`}
            onClick={() => setActiveTab("IN_USE")}
          >
            In Use ({bookings.filter((b) => b.bookingStatus === "In Use").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "PENDING" ? "active" : ""}`}
            onClick={() => setActiveTab("PENDING")}
          >
            Pending Approval ({bookings.filter((b) => b.bookingStatus === "Pending Approval").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "COMPLETED" ? "active" : ""}`}
            onClick={() => setActiveTab("COMPLETED")}
          >
            Completed ({bookings.filter((b) => b.bookingStatus === "Completed").length})
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === "TABLE" ? "active" : ""}`}
              onClick={() => setViewMode("TABLE")}
            >
              📋 Table View
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "CALENDAR" ? "active" : ""}`}
              onClick={() => setViewMode("CALENDAR")}
            >
              📅 Weekly Calendar
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + New Reservation
          </button>
        </div>
      </div>

      {/* View Mode: CALENDAR */}
      {viewMode === "CALENDAR" && (
        <div className="res-card">
          <div className="res-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <strong>Select Equipment:</strong>
              <select
                value={selectedCalEquipment}
                onChange={(e) => setSelectedCalEquipment(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                {equipmentList.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentName} ({eq.status}) {eq.institution?.institutionName ? `— ${eq.institution.institutionName}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Click an open slot to reserve</span>
          </div>

          <div className="cal-view-container">
            <div className="cal-grid">
              <div className="cal-header-cell">Time</div>
              {days.map((d) => (
                <div key={d} className="cal-header-cell">{d}</div>
              ))}

              {hours.map((hr, rIdx) => (
                <div key={hr} style={{ display: "contents" }}>
                  <div className="cal-time-col">{hr}</div>
                  {days.map((day, cIdx) => {
                    // Check if there is an active booking matching this equipment
                    const isOccupied = bookings.some(
                      (b) =>
                        String(b.equipment?.equipmentId) === String(selectedCalEquipment) &&
                        (b.bookingStatus === "Confirmed" || b.bookingStatus === "In Use")
                    );

                    let slotClass = "cal-slot-open";
                    let label = "+ Open";

                    if (isOccupied && (rIdx === 1 || rIdx === 2) && cIdx === 1) {
                      slotClass = "cal-slot-booked";
                      label = "Booked";
                    } else if (isOccupied && rIdx === 3 && cIdx === 3) {
                      slotClass = "cal-slot-inuse";
                      label = "In Use";
                    }

                    return (
                      <div
                        key={day + hr}
                        className={`cal-slot-cell ${slotClass}`}
                        onClick={() => {
                          if (slotClass === "cal-slot-open") {
                            setFormData((prev) => ({
                              ...prev,
                              equipmentId: selectedCalEquipment,
                              startTime: nowLocalString(),
                              endTime: nowLocalString(),
                            }));
                            setShowForm(true);
                          }
                        }}
                      >
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Mode: TABLE */}
      {viewMode === "TABLE" && (
        <div className="res-card">
          <div className="res-card-header">
            <strong>Reservations List</strong>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Showing {getFilteredBookings().length} entries
            </span>
          </div>

          {loading ? (
            <p style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>Loading reservations...</p>
          ) : getFilteredBookings().length === 0 ? (
            <p style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No reservations found under this filter.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="res-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Equipment</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Purpose</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBookings().map((booking) => (
                    <tr key={booking.bookingId}>
                      <td>#{booking.bookingId}</td>
                      <td>
                        <strong>{booking.user?.fullName || "—"}</strong>
                        {booking.user?.department?.departmentName && (
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{booking.user.department.departmentName}</div>
                        )}
                      </td>
                      <td>
                        <strong>{booking.equipment?.equipmentName || "—"}</strong>
                        {booking.equipment?.institution?.institutionName && (
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{booking.equipment.institution.institutionName}</div>
                        )}
                      </td>
                      <td>{booking.bookingDate || "—"}</td>
                      <td>{booking.startTime ? booking.startTime.replace("T", " ") : "—"}</td>
                      <td>{booking.endTime ? booking.endTime.replace("T", " ") : "—"}</td>
                      <td>{getStatusBadge(booking.bookingStatus)}</td>
                      <td>{booking.purpose || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {/* Student Edit & Delete on Pending Approval */}
                          {booking.bookingStatus === "Pending Approval" && (String(booking.user?.userId) === String(myUserId) || canManageBookings) && (
                            <>
                              <button
                                onClick={() => handleEdit(booking)}
                                style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(booking.bookingId)}
                                style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #fca5a5", background: "#fee2e2", color: "#991b1b", cursor: "pointer" }}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {/* Manager / Tech Approval */}
                          {booking.bookingStatus === "Pending Approval" && canManageBookings && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.bookingId)}
                                style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "none", background: "#166534", color: "#fff", cursor: "pointer" }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(booking.bookingId)}
                                style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "none", background: "#991b1b", color: "#fff", cursor: "pointer" }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Complete action */}
                          {booking.bookingStatus === "Confirmed" && canManageBookings && (
                            <button
                              onClick={() => handleComplete(booking.bookingId)}
                              style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #86efac", background: "#dcfce7", color: "#166534", cursor: "pointer" }}
                            >
                              Complete
                            </button>
                          )}

                          {/* Direct Report Issue Button on active booking */}
                          {booking.equipment && (booking.bookingStatus === "Confirmed" || booking.bookingStatus === "In Use" || booking.bookingStatus === "Pending Approval") && (
                            <button
                              onClick={() => navigate(`/feedback?equipmentId=${booking.equipment.equipmentId}`)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                borderRadius: "4px",
                                background: "#fff3cd",
                                border: "1px solid #ffeeba",
                                color: "#854d0e",
                                cursor: "pointer",
                              }}
                              title="Report defect or inaccurate results on this equipment"
                            >
                              ⚠️ Report Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Form Modal */}
      {showForm && (
        <div className="res-modal-overlay">
          <div className="res-modal">
            <h3>{editingId ? "Update Reservation" : "New Equipment Reservation"}</h3>

            {conflictError && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", marginBottom: "14px" }}>
                <p><strong>Booking Conflict:</strong> {conflictError}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/waitlist?equipmentId=${formData.equipmentId}`);
                  }}
                  style={{
                    marginTop: "8px",
                    background: "#b91c1c",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  ⏳ Join Priority Waitlist Instead
                </button>
              </div>
            )}

            {sharingBlock && (
              <div style={{ background: "#fff3cd", color: "#854d0e", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", marginBottom: "14px" }}>
                <p>This equipment is hosted by a partner institution and requires an access agreement.</p>
                <button
                  type="button"
                  onClick={handleRequestAccess}
                  style={{
                    marginTop: "8px",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  Request Inter-Institution Access
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Equipment</label>
                <select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose Equipment --</option>
                  {equipmentList.map((item) => {
                    const isBookable =
                      item.status !== "Under Maintenance" &&
                      item.status !== "Out of Service" &&
                      item.status !== "Retired";

                    return (
                      <option key={item.equipmentId} value={item.equipmentId} disabled={!isBookable}>
                        {item.equipmentName} ({item.status}) {item.institution?.institutionName ? `— ${item.institution.institutionName}` : ""}
                        {!isBookable ? " [NOT BOOKABLE]" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  min={nowLocalString()}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={formData.startTime || nowLocalString()}
                  required
                />
              </div>

              <div className="form-group">
                <label>Research Purpose / Project Code</label>
                <input
                  type="text"
                  name="purpose"
                  placeholder="e.g. Grant #402 Cell Fluorescence Experiment"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="res-modal-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save Changes" : "Submit Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservations;