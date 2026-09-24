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
  // Equipment IDs currently blocked by an unresolved issue report —
  // fetched once up front so the dropdown can warn before submission
  // instead of only failing after (see fetchUnresolvedEquipmentIds below).
  // Any unresolved issue (NORMAL or URGENT) blocks booking, matching
  // the backend rule.
  const [unresolvedEquipmentIds, setUnresolvedEquipmentIds] = useState(new Set());
  // Inline "Submit Feedback" panel state — replaces the old navigate-to-
  // /feedback-page flow. feedbackOpenFor holds the bookingId whose row
  // currently has the panel expanded (only one open at a time).
  const [feedbackOpenFor, setFeedbackOpenFor] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ description: "", urgency: "NORMAL" });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [submittedFeedbackBookingIds, setSubmittedFeedbackBookingIds] = useState(new Set());

  const FEEDBACK_REASONS = [
    "Not functioning properly",
    "Improper / inaccurate results",
    "Physical damage",
    "Missing accessory or part",
    "Unusual noise or overheating",
    "Other",
  ];

  const [formData, setFormData] = useState({
    equipmentId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    repeat: "NONE",
    occurrences: 4,
  });

  // Booking history / audit trail popup
  const [historyFor, setHistoryFor] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const myUserId = sessionStorage.getItem("userId");

  const isStudent = role === "STUDENT";
  // Lab Technician and Institution Admin no longer reach this page at
  // all (see AppRoutes.jsx) — trimmed to who's actually here now.
  const canManageBookings = [
    "LAB_MANAGER",
    "DEPARTMENT_HEAD",
    "INSTITUTION_ADMIN",
    "SYSTEM_ADMIN",
  ].includes(role);

  const myInstitutionId = sessionStorage.getItem("institutionId");
  const myDepartmentId = sessionStorage.getItem("departmentId");

  // What can the logged-in official actually do on THIS booking?
  // Mirrors the backend rules in BookingServiceImpl so buttons are only
  // shown when the action will really be accepted:
  //  - Cross-institution requests ("Pending Institution Approval") are
  //    reviewed first by the Institution Admin of the equipment owner's
  //    institution.
  //  - After that (and for normal same-institution requests), the Lab
  //    Manager / Department Head of the department that OWNS the
  //    equipment approves ("Pending Approval").
  const getStaffActions = (booking) => {
    const none = { canReview: false, canComplete: false, canEditOrCancel: false, canNoShow: false, waitingOn: "" };
    if (!canManageBookings) return none;

    const status = booking.bookingStatus;
    const isPendingInstitution = status === "Pending Institution Approval";
    const isPendingManager = status === "Pending Approval";
    const isPending = isPendingInstitution || isPendingManager;
    const isLive = status === "Confirmed" || status === "In Use";

    // No Show: only once the slot has started and the person never came.
    const slotStarted = booking.startTime && new Date(booking.startTime) <= new Date();
    const noShowEligible = isLive && slotStarted;

    if (role === "SYSTEM_ADMIN") {
      return { canReview: isPending, canComplete: isLive, canEditOrCancel: isPending, canNoShow: noShowEligible, waitingOn: "" };
    }

    const sameInstitution =
      String(booking.equipment?.institution?.institutionId) === String(myInstitutionId);
    const sameDepartment =
      sameInstitution &&
      String(booking.equipment?.department?.departmentId) === String(myDepartmentId);

    if (role === "INSTITUTION_ADMIN") {
      return {
        canReview: isPendingInstitution && sameInstitution,
        canComplete: false,
        canEditOrCancel: false,
        canNoShow: false,
        waitingOn: "",
      };
    }

    // LAB_MANAGER / DEPARTMENT_HEAD
    return {
      canReview: isPendingManager && sameDepartment,
      canComplete: isLive && sameDepartment,
      canEditOrCancel: isPending && sameDepartment,
      canNoShow: noShowEligible && sameDepartment,
      waitingOn: isPendingInstitution && sameDepartment ? "Institution Admin" : "",
    };
  };

  const nowLocalString = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fetchEquipmentList = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment`, {
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

    const fetchUnresolvedEquipmentIds = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment-feedback/unresolved-equipment-ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setUnresolvedEquipmentIds(new Set(Array.isArray(data) ? data : [])))
      .catch((err) => console.error("Unresolved equipment list error:", err));
  };

  const fetchBookings = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`, {
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

  // Populates submittedFeedbackBookingIds so a booking that already has
  // feedback on it shows "Feedback submitted ✓" instead of the button —
  // prevents duplicate submissions from the UI side (backend also blocks
  // it via existsByBooking_BookingId).
  const fetchMyFeedback = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment-feedback/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const ids = new Set(
          (Array.isArray(data) ? data : [])
            .filter((f) => f.booking && f.booking.bookingId)
            .map((f) => f.booking.bookingId)
        );
        setSubmittedFeedbackBookingIds(ids);
      })
      .catch((err) => console.error("Feedback list error:", err));
  };

  // Safety net: if something links here with a prefilled equipmentId
  // that turns out to be blocked by an unresolved issue (a stale
  // "Book" link, browser back/forward, etc.), redirect straight to
  // the waitlist instead of leaving the student staring at a form
  // that will just fail on submit. Runs once the unresolved-ids fetch
  // above actually resolves.
  useEffect(() => {
    const prefillId = searchParams.get("equipmentId");
    if (prefillId && isStudent && unresolvedEquipmentIds.has(Number(prefillId))) {
      navigate(`/waitlist?equipmentId=${prefillId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unresolvedEquipmentIds]);

  useEffect(() => {
    fetchBookings();
    fetchEquipmentList();
    fetchMyFeedback();
    fetchUnresolvedEquipmentIds();

    const prefillId = searchParams.get("equipmentId");
    if (prefillId && isStudent) {
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
      repeat: "NONE",
      occurrences: 4,
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
      // Recurring: one request creates a daily / weekly series.
      if (!editingId && formData.repeat !== "NONE") {
        const recurringResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/bookings/recurring`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              equipmentId: Number(formData.equipmentId),
              startTime: formData.startTime,
              endTime: formData.endTime,
              purpose: formData.purpose,
              repeat: formData.repeat,
              occurrences: Number(formData.occurrences),
            }),
          }
        );

        const recurringData = await recurringResponse.json().catch(() => null);

        if (!recurringResponse.ok) {
          throw new Error(recurringData?.message || "Failed to create recurring booking");
        }

        const skippedList = Array.isArray(recurringData.skipped) ? recurringData.skipped : [];

        alert(
          `${recurringData.createdCount} booking(s) created.` +
            (skippedList.length > 0
              ? `\n\n${skippedList.length} skipped:\n` +
                skippedList
                  .map((x) => `• ${String(x.startTime).replace("T", " ")} - ${x.reason}`)
                  .join("\n")
              : "")
        );

        resetForm();
        fetchBookings();
        return;
      }

      const url = editingId
        ? `${import.meta.env.VITE_API_BASE_URL}/api/bookings/${editingId}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/bookings`;

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
        `${import.meta.env.VITE_API_BASE_URL}/api/resource-sharing/requests`,
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}`, {
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

  const handleNoShow = async (id) => {
    if (!window.confirm("Mark this booking as a No Show? The slot will be released.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}/no-show`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Could not mark this booking as No Show");
      }

      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelSeries = async (groupId) => {
    if (!window.confirm("Cancel all upcoming bookings in this recurring series?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/recurring/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Could not cancel the series");
      }

      alert(
        `${data.cancelledCount} booking(s) cancelled.` +
          (data.couldNotCancelCount > 0
            ? ` ${data.couldNotCancelCount} could not be cancelled (already approved or started).`
            : "")
      );

      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const openHistory = async (booking) => {
    setHistoryFor(booking);
    setHistoryRows([]);
    setHistoryLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${booking.bookingId}/audit`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setHistoryRows(await response.json());
      }
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}/approve`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}/reject`, {
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

  // Minutes remaining in the 1-hour post-completion feedback window for a
  // Completed booking, based on its endTime. Returns null for bookings
  // that aren't Completed (window doesn't apply — In Use has no deadline).
  const getFeedbackMinutesLeft = (booking) => {
    if (booking.bookingStatus !== "Completed" || !booking.endTime) return null;
    const endMs = new Date(booking.endTime).getTime();
    const deadlineMs = endMs + 60 * 60 * 1000;
    const minutesLeft = Math.round((deadlineMs - Date.now()) / 60000);
    return minutesLeft;
  };

  const openFeedbackPanel = (booking) => {
    setFeedbackError("");
    setFeedbackForm({ description: "", urgency: "NORMAL" });
    setFeedbackOpenFor(booking.bookingId);
  };

  const closeFeedbackPanel = () => {
    setFeedbackOpenFor(null);
    setFeedbackError("");
  };

  const pickFeedbackReason = (reason) => {
    setFeedbackForm((prev) => ({ ...prev, description: reason === "Other" ? "" : reason }));
  };

  // Submits the inline feedback form. `booking` is the Completed booking
  // the panel is attached to — bookingId is included so the backend can
  // validate ownership + the 1-hour window and prevent duplicates
  // (see EquipmentFeedbackServiceImpl.submitFeedback).
  const submitInlineFeedback = async (booking) => {
    if (!feedbackForm.description.trim()) {
      setFeedbackError("Please describe what happened.");
      return;
    }
    setFeedbackSubmitting(true);
    setFeedbackError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipment: { equipmentId: booking.equipment.equipmentId },
          booking: { bookingId: booking.bookingId },
          description: feedbackForm.description,
          urgency: feedbackForm.urgency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Could not submit feedback — the window may have closed.");
      }

      setSubmittedFeedbackBookingIds((prev) => new Set(prev).add(booking.bookingId));
      setFeedbackOpenFor(null);
    } catch (error) {
      setFeedbackError(error.message);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "UPCOMING") return b.bookingStatus === "Confirmed";
      if (activeTab === "IN_USE") return b.bookingStatus === "In Use";
      if (activeTab === "PENDING") {
        return b.bookingStatus === "Pending Approval"
          || b.bookingStatus === "Pending Institution Approval";
      }
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
      case "Pending Institution Approval":
        return <span className="res-status-badge res-status-pending">🏛️ Owner Approval</span>;
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
            Pending Approval ({bookings.filter((b) =>
              b.bookingStatus === "Pending Approval"
              || b.bookingStatus === "Pending Institution Approval"
            ).length})
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

          {/* Booking creation is STUDENT-only on the backend (see
              BookingController.createBooking) — hide the button for
              every other role instead of letting them hit a 403 on
              submit. */}
          {isStudent && (
            <button
              className="btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + New Reservation
            </button>
          )}
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
                  {getFilteredBookings().map((booking) => {
                    const isOwner = String(booking.user?.userId) === String(myUserId);
                    const isInUseNow = booking.bookingStatus === "In Use";
                    const isCompletedNow = booking.bookingStatus === "Completed";
                    const minutesLeft = getFeedbackMinutesLeft(booking);
                    const alreadySubmitted = submittedFeedbackBookingIds.has(booking.bookingId);
                    // Students can report an issue two ways: anytime while
                    // the booking is actively "In Use" (no deadline — the
                    // equipment is right in front of them), or within 1
                    // hour after it's "Completed" (see getFeedbackMinutesLeft).
                    const feedbackEligible = (isInUseNow || isCompletedNow) && isOwner && booking.equipment;
                    const panelOpen = feedbackOpenFor === booking.bookingId;

                    return (
                    <>
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
                      <td>
                        {booking.purpose || "—"}
                        {booking.recurrenceGroupId && (
                          <div style={{ fontSize: "11px", color: "#1d4ed8" }}>🔁 Recurring series</div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                          {/* Edit: only the student who owns the pending booking.
                              Cancel: the owner, or staff within their own scope. */}
                          {(booking.bookingStatus === "Pending Approval"
                            || booking.bookingStatus === "Pending Institution Approval")
                            && (isOwner || getStaffActions(booking).canEditOrCancel) && (
                            <>
                              {isOwner && (
                                <button
                                  onClick={() => handleEdit(booking)}
                                  style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(booking.bookingId)}
                                style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #fca5a5", background: "#fee2e2", color: "#991b1b", cursor: "pointer" }}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {/* Manager / Tech Approval */}
                          {getStaffActions(booking).waitingOn && (
                            <span style={{ fontSize: "11px", color: "#92400e" }}>
                              Waiting for {getStaffActions(booking).waitingOn}
                            </span>
                          )}

                          {getStaffActions(booking).canReview && (
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

                          {getStaffActions(booking).canNoShow && (
                            <button
                              onClick={() => handleNoShow(booking.bookingId)}
                              style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #94a3b8", background: "#f1f5f9", color: "#334155", cursor: "pointer" }}
                              title="The person did not come - release the slot"
                            >
                              No Show
                            </button>
                          )}

                          {booking.recurrenceGroupId
                            && (isOwner || getStaffActions(booking).canEditOrCancel)
                            && ["Pending Approval", "Pending Institution Approval", "Confirmed"].includes(booking.bookingStatus) && (
                            <button
                              onClick={() => handleCancelSeries(booking.recurrenceGroupId)}
                              style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #fca5a5", background: "#fff", color: "#991b1b", cursor: "pointer" }}
                              title="Cancel every upcoming booking of this recurring series"
                            >
                              Cancel series
                            </button>
                          )}

                          <button
                            onClick={() => openHistory(booking)}
                            style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                            title="Who changed this booking, and when"
                          >
                            History
                          </button>

                          {/* Inline issue reporting — two windows, same panel:
                              anytime while "In Use" (no deadline), or within
                              1 hour after "Completed". Right here in Actions,
                              no separate page. */}
                          {feedbackEligible && alreadySubmitted && (
                            <span style={{ fontSize: "11px", color: "#166534" }}>Feedback submitted ✓</span>
                          )}
                          {feedbackEligible && !alreadySubmitted && isInUseNow && (
                            <button
                              onClick={() => (panelOpen ? closeFeedbackPanel() : openFeedbackPanel(booking))}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                borderRadius: "4px",
                                background: "#fff3cd",
                                border: "1px solid #ffeeba",
                                color: "#854d0e",
                                cursor: "pointer",
                              }}
                              title="Report a problem with the equipment while you're using it"
                            >
                              ⚠️ {panelOpen ? "Close" : "Report Issue"}
                            </button>
                          )}
                          {feedbackEligible && !alreadySubmitted && isCompletedNow && minutesLeft > 0 && (
                            <>
                              <button
                                onClick={() => (panelOpen ? closeFeedbackPanel() : openFeedbackPanel(booking))}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  borderRadius: "4px",
                                  background: "#fff3cd",
                                  border: "1px solid #ffeeba",
                                  color: "#854d0e",
                                  cursor: "pointer",
                                }}
                                title="Report a defect or inaccurate results from this session"
                              >
                                ⚠️ {panelOpen ? "Close" : "Submit Feedback"}
                              </button>
                              <span style={{ fontSize: "10.5px", color: "#b45309", fontWeight: 600 }}>
                                ⏱ {minutesLeft} min left
                              </span>
                            </>
                          )}
                          {feedbackEligible && !alreadySubmitted && isCompletedNow && minutesLeft <= 0 && (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Feedback window closed</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {panelOpen && (
                      <tr key={`${booking.bookingId}-feedback`}>
                        <td colSpan={9} style={{ background: "#fdfaf5", borderTop: "1px dashed #d8cdbf", padding: "12px 16px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                            {isInUseNow ? "Report an Issue — " : "Submit Feedback — "}{booking.equipment?.equipmentName}
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                            {FEEDBACK_REASONS.map((reason) => (
                              <button
                                key={reason}
                                onClick={() => pickFeedbackReason(reason)}
                                style={{
                                  padding: "3px 8px",
                                  fontSize: "10.5px",
                                  borderRadius: "999px",
                                  border: "1px solid #d8cdbf",
                                  background: feedbackForm.description === reason ? "#fdeecb" : "#fff",
                                  cursor: "pointer",
                                }}
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px", gap: "8px", alignItems: "end" }}>
                            <div>
                              <label style={{ fontSize: "10.5px", color: "#64748b" }}>Description</label>
                              <textarea
                                value={feedbackForm.description}
                                onChange={(e) => setFeedbackForm((prev) => ({ ...prev, description: e.target.value }))}
                                rows={1}
                                style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: "10.5px", color: "#64748b" }}>Urgency</label>
                              <select
                                value={feedbackForm.urgency}
                                onChange={(e) => setFeedbackForm((prev) => ({ ...prev, urgency: e.target.value }))}
                                style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                              >
                                <option value="NORMAL">Normal</option>
                                <option value="URGENT">Urgent</option>
                              </select>
                            </div>
                            <button
                              onClick={() => submitInlineFeedback(booking)}
                              disabled={feedbackSubmitting}
                              style={{ padding: "8px", fontSize: "12px", borderRadius: "4px", border: "none", background: "#8a5a1a", color: "#fff", cursor: "pointer" }}
                            >
                              {feedbackSubmitting ? "Submitting…" : "Submit"}
                            </button>
                          </div>
                          {feedbackError && (
                            <div style={{ marginTop: "6px", fontSize: "11px", color: "#991b1b" }}>{feedbackError}</div>
                          )}
                        </td>
                      </tr>
                    )}
                    </>
                    );
                  })}
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
                    const hasUnresolvedIssue = unresolvedEquipmentIds.has(item.equipmentId);
                    const isBookable =
                      item.status !== "Under Maintenance" &&
                      item.status !== "Out of Service" &&
                      item.status !== "Retired" &&
                      !hasUnresolvedIssue;

                    return (
                      <option key={item.equipmentId} value={item.equipmentId} disabled={!isBookable}>
                        {item.equipmentName} ({item.status}) {item.institution?.institutionName ? `— ${item.institution.institutionName}` : ""}
                        {hasUnresolvedIssue
                          ? " [⚠ ISSUE REPORTED — JOIN WAITLIST INSTEAD]"
                          : !isBookable
                          ? " [NOT BOOKABLE]"
                          : ""}
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

              {!editingId && isStudent && (
                <div className="form-group">
                  <label>Repeat</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <select name="repeat" value={formData.repeat} onChange={handleChange}>
                      <option value="NONE">Does not repeat</option>
                      <option value="DAILY">Every day</option>
                      <option value="WEEKLY">Every week</option>
                    </select>

                    {formData.repeat !== "NONE" && (
                      <>
                        <input
                          type="number"
                          name="occurrences"
                          min="2"
                          max="12"
                          value={formData.occurrences}
                          onChange={handleChange}
                          style={{ width: "70px" }}
                        />
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          bookings in total (2-12). Clashing dates are skipped.
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

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

      {historyFor && (
        <div className="res-modal-overlay" onClick={() => setHistoryFor(null)}>
          <div className="res-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <h3>Booking #{historyFor.bookingId} history</h3>

            {historyLoading ? (
              <p>Loading...</p>
            ) : historyRows.length === 0 ? (
              <p style={{ color: "#64748b" }}>No history recorded for this booking yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {historyRows.map((row) => (
                  <li key={row.auditId} style={{ padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
                    <strong>
                      {row.fromStatus ? `${row.fromStatus} → ${row.toStatus}` : row.toStatus}
                    </strong>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {row.changedAt ? String(row.changedAt).replace("T", " ").slice(0, 16) : ""} ·{" "}
                      {row.actorName}
                      {row.actorRole && row.actorRole !== "SYSTEM" ? ` (${String(row.actorRole).replace(/_/g, " ").toLowerCase()})` : ""}
                      {row.note ? ` · ${row.note}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="res-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setHistoryFor(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservations;