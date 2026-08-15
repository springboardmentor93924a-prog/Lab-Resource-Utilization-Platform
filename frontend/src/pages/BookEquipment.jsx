import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./BookEquipment.css";
import { createBooking } from "../services/bookingService";
import { getEquipmentById } from "../services/equipmentService";
import { getCurrentUserId, canMakePriorityBooking } from "../utils/auth";
import { joinWaitlist } from "../services/waitlistService";
import { getUnreadCount } from "../services/notificationService";

const slots = [
  { time: "9:00-10:00", status: "free" },
  { time: "10:00-11:00", status: "free" },
  { time: "11:00-12:00", status: "conflict" },
  { time: "12:00-1:00", status: "free" },
];

const today = new Date().toISOString().split("T")[0];

function addHoursToTime(timeStr, hours) {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setHours(date.getHours() + hours);
  return date.toTimeString().slice(0, 5);
}

export default function BookEquipment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const equipmentId = searchParams.get("equipmentId") || "1";

  // ==============================
  // EQUIPMENT
  // ==============================

  const [equipment, setEquipment] = useState(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  // ==============================
  // BOOKING FORM
  // ==============================

  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("2 hours");
  const [recurring, setRecurring] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [notes, setNotes] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [priorityBooking, setPriorityBooking] = useState(false);

  // ==============================
  // TOP SEARCH
  // ==============================

  const [searchValue, setSearchValue] = useState("");

  // ==============================
  // NOTIFICATIONS
  // ==============================

  const [unreadCount, setUnreadCount] = useState(0);

  const showPriorityOption = canMakePriorityBooking();

  // ==============================
  // LOAD EQUIPMENT
  // ==============================

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await getEquipmentById(equipmentId);
        setEquipment(data);
      } catch {
        setEquipment(null);
      } finally {
        setLoadingEquipment(false);
      }
    }

    fetchEquipment();
  }, [equipmentId]);

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
  // SEARCH EQUIPMENT
  // ==============================

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      const query = searchValue.trim();

      if (query !== "") {
        navigate(
          `/equipment?search=${encodeURIComponent(query)}`
        );
      } else {
        navigate("/equipment");
      }
    }
  }

  // ==============================
  // NOTIFICATIONS
  // ==============================

  function handleNotifications() {
    navigate("/notifications");
  }

  // ==============================
  // WAITLIST
  // ==============================

  async function handleWaitlist() {
    if (date === "") {
      alert("Please select a date first.");
      return;
    }

    if (time === "") {
      alert("Please select a start time first.");
      return;
    }

    const durationHours = parseInt(duration, 10) || 2;
    const endTime = addHoursToTime(
      time,
      durationHours
    );

    try {
      await joinWaitlist({
        equipmentId: Number(equipmentId),
        requestedDate: date,
        startTime: `${time}:00`,
        endTime: `${endTime}:00`,
      });

      alert(
        "You have been added to the waitlist. You'll be notified if a slot opens up."
      );

      navigate("/my-bookings");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to join waitlist."
      );
    }
  }

  // ==============================
  // CANCEL BOOKING FORM
  // ==============================

  function handleCancel() {
    if (window.confirm("Cancel booking?")) {
      setDate("");
      setTime("10:00");
      setDuration("2 hours");
      setRecurring(false);
      setRepeatWeeks(4);
      setNotes("");
      setSelectedSlot(null);
      setPriorityBooking(false);
    }
  }

  // ==============================
  // CREATE BOOKING
  // ==============================

  async function handleNext() {
    if (date === "") {
      alert("Please select booking date.");
      return;
    }

    if (time === "") {
      alert("Please select start time.");
      return;
    }

    if (notes.trim() === "") {
      alert("Please enter purpose.");
      return;
    }

    const userId = getCurrentUserId();

    if (!userId) {
      alert(
        "Could not identify logged-in user. Please log in again."
      );
      return;
    }

    const durationHours =
      parseInt(duration, 10) || 2;

    const endTime = addHoursToTime(
      time,
      durationHours
    );

    const payload = {
      userId,
      equipmentId: Number(equipmentId),
      bookingDate: date,
      startTime: `${time}:00`,
      endTime: `${endTime}:00`,
      durationHours,
      purpose: notes,
      recurring,
      recurringWeeks: recurring
        ? Number(repeatWeeks)
        : null,
      priorityBooking: showPriorityOption
        ? priorityBooking
        : false,
    };

    try {
      setSubmitting(true);

      const response = await createBooking(payload);

      alert(
        `Booking Successful!\n\nEquipment: ${response.equipmentName}\nDate: ${response.bookingDate}\nTime: ${response.startTime} - ${response.endTime}\nStatus: ${response.bookingStatus}`
      );

      navigate("/equipment");
    } catch (err) {
      if (err.response?.status === 409) {
        const wantsWaitlist = window.confirm(
          "This slot is already booked. Would you like to join the waitlist instead?"
        );

        if (wantsWaitlist) {
          await handleWaitlist();
        }
      } else if (err.response?.status === 403) {
        alert(
          "You don't have access to this equipment since it belongs to another institution. Go to the Sharing page to request access first."
        );
      } else {
        alert(
          err.response?.data?.message ||
            "Failed to create booking. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="container">

      {/* ==============================
          SIDEBAR
      ============================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* ==============================
          MAIN CONTENT
      ============================== */}

      <main className="main">

        {/* ==============================
            TOP BAR
        ============================== */}

        <header className="topbar">

          <h2>Book equipment</h2>

          <div className="top-right">

            {/* SEARCH */}

            <div className="search-box">

              <i className="fa-solid fa-magnifying-glass"></i>

              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) =>
                  setSearchValue(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
              />

            </div>


            {/* ==============================
                NOTIFICATION BELL
            ============================== */}

            <button
              type="button"
              className="notification-button"
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


            {/* ==============================
                PROFILE
            ============================== */}

            <div
              className="profile"
              onClick={() => navigate("/profile")}
              title="My Profile"
              aria-label="My Profile"
              role="button"
              tabIndex={0}
            >
              <i className="fa-solid fa-user"></i>
            </div>

          </div>

        </header>


        {/* ==============================
            CLOSE BUTTON
        ============================== */}

        <div className="close-row">

          <button
            className="close-btn"
            onClick={() => navigate(-1)}
          >
            ×
          </button>

        </div>


        {/* ==============================
            EQUIPMENT NAME
        ============================== */}

        <div className="equipment-card">

          {loadingEquipment
            ? "Loading equipment..."
            : equipment
              ? `${equipment.equipmentName} — ${equipment.department} dept`
              : "Equipment not found"}

        </div>


        {/* ==============================
            BOOKING SECTION
        ============================== */}

        <section className="booking-section">

          <div className="form-row">

            {/* DATE */}

            <div className="input-group">

              <label>Date</label>

              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />

            </div>


            {/* START TIME */}

            <div className="input-group">

              <label>Start time</label>

              <input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
              />

            </div>


            {/* DURATION */}

            <div className="input-group">

              <label>Duration</label>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
              >

                <option>2 hours</option>
                <option>1 hour</option>
                <option>3 hours</option>
                <option>4 hours</option>

              </select>

            </div>

          </div>


          {/* ==============================
              RECURRING BOOKING
          ============================== */}

          <div className="recurring">

            <label>

              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) =>
                  setRecurring(e.target.checked)
                }
              />

              Recurring booking?

            </label>

            <label>
              Repeat weekly for
            </label>

            <input
              type="number"
              value={repeatWeeks}
              disabled={!recurring}
              onChange={(e) =>
                setRepeatWeeks(e.target.value)
              }
            />

            <span>wks</span>

          </div>


          {/* ==============================
              PRIORITY BOOKING
          ============================== */}

          {showPriorityOption && (

            <div className="recurring">

              <label>

                <input
                  type="checkbox"
                  checked={priorityBooking}
                  onChange={(e) =>
                    setPriorityBooking(
                      e.target.checked
                    )
                  }
                />

                Priority booking
                (Researcher/Admin only)

              </label>

            </div>

          )}


          {/* ==============================
              NOTES
          ============================== */}

          <div className="notes">

            <label>
              Purpose / notes
            </label>

            <textarea
              maxLength={250}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
            ></textarea>

            <small>
              {notes.length} / 250
            </small>

          </div>

        </section>


        {/* ==============================
            AVAILABILITY
        ============================== */}

        <section className="availability">

          <h3>
            Availability preview
          </h3>

          <div className="slots">

            {slots.map((slot) => (

              <div
                key={slot.time}
                className={`slot ${slot.status} ${
                  selectedSlot === slot.time
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedSlot(slot.time)
                }
              >

                <p>
                  {slot.time}
                </p>

                <span>
                  {slot.status === "free"
                    ? "Free"
                    : "Conflict"}
                </span>

              </div>

            ))}

          </div>

        </section>


        {/* ==============================
            BUTTONS
        ============================== */}

        <div className="buttons">

          <button
            className="waitlist"
            onClick={handleWaitlist}
          >
            Join waitlist
          </button>

          <button
            className="cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            className="next"
            onClick={handleNext}
            disabled={submitting}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>

        </div>

      </main>

    </div>
  );
}