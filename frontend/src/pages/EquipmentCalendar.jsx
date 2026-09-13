import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./EquipmentCalendar.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Each entry corresponds to one column (Mon..Sun). null = no event that day.
const initialEvents = [
  { label: "Rao — Microscope", color: "blue", top: 50 },
  { label: "Iyer — HPLC", color: "blue", top: 115 },
  null,
  { label: "Singh — UV-Vis", color: "blue", top: 75 },
  { label: "Rao — Microscope", color: "blue", top: 180 },
  { label: "Open slot", color: "blue", top: 145 },
  null,
];

export default function EquipmentCalendar() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 22)); // 22 Jul 2026
  const [currentWeek, setCurrentWeek] = useState(22);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);

  function goToPrevWeek() {
    setCurrentWeek((w) => w - 1);
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }

  function goToNextWeek() {
    setCurrentWeek((w) => w + 1);
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }

  // Keyboard left/right arrow navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") goToPrevWeek();
      if (e.key === "ArrowRight") goToNextWeek();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const weekStart = currentDate;
  const weekEnd = new Date(currentDate);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `Week ${currentWeek} (${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]})`;

  // Highlight today's column (Mon=0 ... Sun=6)
  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  function isEventVisible(label) {
    const search = searchValue.toLowerCase();
    const filter = filterValue.toLowerCase();
    return label.toLowerCase().includes(search) && label.toLowerCase().includes(filter);
  }

  function handleEventClick(label) {
    setActiveEvent(label);
    alert("Equipment Booking\n\n" + label);
  }

  function handleDayDoubleClick() {
    alert("Open Booking Form");
  }

  return (
    <div className="container equipment-calendar-page">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="main">
        <header className="header">
          <h2>Equipment availability calendar</h2>
          <div className="header-right">
            <div className="search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <button
  className="profile-circle"
  onClick={() => navigate("/profile")}
  title="My Profile"
  aria-label="My Profile"
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.1c0 .7.5 1.2 1.2 1.2h17.2c.7 0 1.2-.5 1.2-1.2v-2.1c0-3.3-6.5-4.9-9.8-4.9z"/></svg>
</button>
          </div>
        </header>

        <section className="toolbar">
          <input
            type="text"
            placeholder="Filter equipment"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />

          <div className="week-navigation">
            <button onClick={goToPrevWeek}>
              <i className="fa-solid fa-angle-left"></i> Week
            </button>
            <span>{weekLabel}</span>
            <button onClick={goToNextWeek}>
              Week <i className="fa-solid fa-angle-right"></i>
            </button>
          </div>
        </section>

        <section className="calendar">
          <div className="calendar-header">
            {dayLabels.map((day, index) => (
              <div
                key={day}
                style={{ fontWeight: 700 }}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {initialEvents.map((event, index) => (
              <div
  className="day"
  key={dayLabels[index]}
  onDoubleClick={handleDayDoubleClick}
  style={
    index === todayIndex
      ? {
          background: "#f0f6ff",
        }
      : undefined
  }
>
                {event && isEventVisible(event.label) && (
                  <div
                    className={`event ${event.color} ${activeEvent === event.label ? "active-event" : ""}`}
                    style={{ top: `${event.top}px`, animationDelay: `${index * 150}ms` }}
                    title="Click to view booking details"
                    onClick={() => handleEventClick(event.label)}
                  >
                    {event.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
