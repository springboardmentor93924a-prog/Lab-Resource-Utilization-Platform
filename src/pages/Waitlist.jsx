import { useState } from "react";
import "./Waitlist.css";

function Waitlist({ showToast }) {
  const [myWaitlist, setMyWaitlist] = useState([
    {
      id: 1,
      equipment: "3D Printer",
      equipmentId: "EQ003",
      position: 2,
      requestedDate: "Aug 12, 2026",
      expectedDate: "Aug 15, 2026",
      status: "Waiting",
    },
    {
      id: 2,
      equipment: "Oscilloscope",
      equipmentId: "EQ001",
      position: 1,
      requestedDate: "Aug 11, 2026",
      expectedDate: "Aug 14, 2026",
      status: "Available Soon",
    },
  ]);

  const activeRequestsCount = myWaitlist.length;

  const nextPosition =
    myWaitlist.length > 0
      ? `#${Math.min(...myWaitlist.map((item) => item.position))}`
      : "-";

  const availableSoonCount = myWaitlist.filter(
    (item) => item.status === "Available Soon"
  ).length;

  const handleCancelWaitlist = (id, equipmentName) => {
    setMyWaitlist((prev) => prev.filter((item) => item.id !== id));

    if (showToast) {
      showToast(`Removed from waitlist for ${equipmentName}.`, "info");
    }
  };

  return (
    <div className="waitlist-page">
      {/* HEADER */}
      <div className="waitlist-header">
        <div>
          <h1>My Waitlist</h1>
          <p>Track equipment you are waiting to access</p>
        </div>

        <div className="waitlist-role-badge">Researcher</div>
      </div>

      {/* SUMMARY */}
      <div className="waitlist-summary">
        <div className="waitlist-summary-card">
          <span className="summary-icon blue">◷</span>
          <div>
            <small>Active Requests</small>
            <strong>{activeRequestsCount}</strong>
          </div>
        </div>

        <div className="waitlist-summary-card">
          <span className="summary-icon orange">#</span>
          <div>
            <small>Next Position</small>
            <strong>{nextPosition}</strong>
          </div>
        </div>

        <div className="waitlist-summary-card">
          <span className="summary-icon green">✓</span>
          <div>
            <small>Available Soon</small>
            <strong>{availableSoonCount}</strong>
          </div>
        </div>
      </div>

      {/* WAITLIST CONTAINER */}
      <div className="my-waitlist-container">
        <div className="waitlist-section-header">
          <div>
            <h2>My Requests</h2>
            <p>Equipment you have joined the waitlist for</p>
          </div>
        </div>

        <div className="my-waitlist-list">
          {myWaitlist.length === 0 ? (
            <div className="no-my-bookings" style={{ padding: "40px", textAlign: "center" }}>
              <div className="no-booking-icon" style={{ fontSize: "32px", color: "#94a3b8" }}>
                ◷
              </div>
              <h3 style={{ margin: "10px 0 6px", color: "#1e293b" }}>No active waitlist requests</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                You are currently not waiting on any booked equipment.
              </p>
            </div>
          ) : (
            myWaitlist.map((item) => (
              <div className="my-waitlist-row" key={item.id}>
                <div className="waitlist-equipment">
                  <div className="waitlist-equipment-icon">
                    {item.equipment.charAt(0)}
                  </div>

                  <div>
                    <strong>{item.equipment}</strong>
                    <small>{item.equipmentId}</small>
                  </div>
                </div>

                <div className="waitlist-position">
                  <span>Queue Position</span>
                  <strong>#{item.position}</strong>
                </div>

                <div className="waitlist-date">
                  <span>Requested</span>
                  <strong>{item.requestedDate}</strong>
                </div>

                <div className="waitlist-date">
                  <span>Expected</span>
                  <strong>{item.expectedDate}</strong>
                </div>

                <div>
                  <span
                    className={`my-waitlist-status ${
                      item.status === "Waiting" ? "waiting" : "soon"
                    }`}
                  >
                    <span></span>
                    {item.status}
                  </span>
                </div>

                <button
                  className="cancel-waitlist-btn"
                  onClick={() => handleCancelWaitlist(item.id, item.equipment)}
                >
                  Cancel
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Waitlist;