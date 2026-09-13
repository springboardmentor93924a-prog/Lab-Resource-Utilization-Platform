import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./BookEquipment.css";
import { createBooking } from "../services/bookingService";
import { getEquipmentById } from "../services/equipmentService";
import { getCurrentUserId,canMakePriorityBooking } from"../utils/auth";
import { joinWaitlist } from "../services/waitlistService";

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

  const [equipment, setEquipment] = useState(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("2 hours");
  const [recurring, setRecurring] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [notes, setNotes] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [priorityBooking, setPriorityBooking] = useState(false);
  const showPriorityOption = canMakePriorityBooking();

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

// ... inside the component:

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
  const endTime = addHoursToTime(time, durationHours);

  try {
    await joinWaitlist({
      equipmentId: Number(equipmentId),
      requestedDate: date,
      startTime: `${time}:00`,
      endTime: `${endTime}:00`,
    });
    alert("You have been added to the waitlist. You'll be notified if a slot opens up.");
    navigate("/my-bookings");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to join waitlist.");
  }
}

  function handleCancel() {
    if (window.confirm("Cancel booking?")) {
      setDate("");
      setTime("10:00");
      setDuration("2 hours");
      setRecurring(false);
      setRepeatWeeks(4);
      setNotes("");
      setSelectedSlot(null);
    }
  }

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
      alert("Could not identify logged-in user. Please log in again.");
      return;
    }

    const durationHours = parseInt(duration, 10) || 2;
    const endTime = addHoursToTime(time, durationHours);

    const payload = {
      equipment: { equipmentId: Number(equipmentId) },
      bookingStart: `${date}T${time}:00`,
      bookingEnd: `${date}T${endTime}:00`,
      purpose: notes,
      recurring,
      recurringWeeks: recurring ? Number(repeatWeeks) : null,
      priorityBooking: showPriorityOption ? priorityBooking : false,
    };

    try {
      setSubmitting(true);
      const response = await createBooking(payload);
      alert(
        `Booking Successful!\n\nEquipment: ${response.equipmentName}\nDate: ${response.bookingDate}\nStart: ${response.startTime}\nEnd: ${response.endTime}\nStatus: ${response.bookingStatus}`
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
      "You don't have access to this equipment since itbelongs to another institution. Go to the Sharing page to request access first."
    );
  } else {
    alert(err.response?.data?.message || "Failed to create booking. Please try again.");
  }
} finally {
  setSubmitting(false);
}
  }

  return (
    <div className="container book-equipment-page">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="main">
        <header className="topbar">
          <h2>Book equipment</h2>
          <div className="top-right">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search..." />
            </div>
            <div
  className="profile"
  onClick={() => navigate("/profile")}
  title="My Profile"
  aria-label="My Profile"
>
  <i className="fa-solid fa-user"></i>
</div>
          </div>
        </header>

        <div className="close-row">
          <button className="close-btn" onClick={() => navigate(-1)}>
            X
          </button>
        </div>

        <div className="equipment-card">
          {loadingEquipment
            ? "Loading equipment..."
            : equipment
              ? `${equipment.name} - ${equipment.department?.departmentName} dept`
              : "Equipment not found"}
        </div>

        <section className="booking-section">
          <div className="form-row">
            <div className="input-group">
              <label>Date</label>
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Start time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Duration</label>
              <select value={duration} onChange={(e) =>setDuration(e.target.value)}>
                <option>2 hours</option>
                <option>1 hour</option>
                <option>3 hours</option>
                <option>4 hours</option>
              </select>
            </div>
          </div>

          <div className="recurring">
            <label>
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
              Recurring booking?
            </label>
            <label>Repeat weekly for</label>
            <input
              type="number"
              value={repeatWeeks}
              disabled={!recurring}
              onChange={(e) => setRepeatWeeks(e.target.value)}
            />
            <span>wks</span>
          </div>
          {showPriorityOption && (
  <div className="recurring">
    <label>
      <input
        type="checkbox"
        checked={priorityBooking}
        onChange={(e) => setPriorityBooking(e.target.checked)}
      />
      Priority booking (Researcher/Admin only)
    </label>
  </div>
)}

          <div className="notes">
            <label>Purpose / notes</label>
            <textarea maxLength={250} value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            <small>{notes.length} / 250</small>
          </div>
        </section>

        <section className="availability">
          <h3>Availability preview</h3>
          <div className="slots">
            {slots.map((slot) => (
              <div
                key={slot.time}
                className={`slot ${slot.status} ${selectedSlot === slot.time ? "selected" : ""}`}
                onClick={() => setSelectedSlot(slot.time)}
              >
                <p>{slot.time}</p>
                <span>{slot.status === "free" ? "Free" : "Conflict"}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="buttons">
          <button className="waitlist" onClick={handleWaitlist}>
            Join waitlist
          </button>
          <button className="cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="next" onClick={handleNext}disabled={submitting}>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </main>
    </div>
  );
}
