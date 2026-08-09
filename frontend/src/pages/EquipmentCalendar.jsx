import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "./EquipmentCalendar.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Each entry corresponds to one column (Mon..Sun). null = no event that day.
const initialEvents = [
  { label: "Rao — Microscope", color: "blue", top: 50 },
  { label: "Iyer — HPLC", color: "blue", top: 115 },
  { label: "Lab maint.", color: "orange", top: 250 },
  { label: "Singh — UV-Vis", color: "blue", top: 75 },
  { label: "Rao — Microscope", color: "blue", top: 180 },
  { label: "Open slot", color: "blue", top: 145 },
  null,
];

export default function EquipmentCalendar() {
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
    <div className="container">
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
            <div className="profile"></div>
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
                style={
                  index === todayIndex
                    ? { background: "#dbe8ff", fontWeight: 700 }
                    : undefined
                }
              >
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {initialEvents.map((event, index) => (
              <div className="day" key={dayLabels[index]} onDoubleClick={handleDayDoubleClick}>
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