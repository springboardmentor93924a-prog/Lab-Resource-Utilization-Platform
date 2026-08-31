import { useState } from "react";
import "./ManagerWaitlist.css";

function ManagerWaitlist({ showToast }) {
  const [waitlist, setWaitlist] = useState([
    {
      equipment: "3D Printer",
      id: "EQ003",
      department: "Mechanical",
      waiting: 5,
      nextAvailable: "Aug 15, 2026",
      demand: "High",
    },
    {
      equipment: "Oscilloscope",
      id: "EQ001",
      department: "ECE",
      waiting: 2,
      nextAvailable: "Aug 14, 2026",
      demand: "Medium",
    },
    {
      equipment: "Digital Multimeter",
      id: "EQ002",
      department: "ECE",
      waiting: 1,
      nextAvailable: "Today",
      demand: "Low",
    },
  ]);

  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const totalWaiting = waitlist.reduce(
    (sum, item) => sum + item.waiting,
    0
  );

  const highDemandCount = waitlist.filter(
    (item) => item.demand === "High"
  ).length;

  const handleNotifyNextUser = (item) => {
    if (item.waiting <= 0) return;

    setWaitlist((prev) =>
      prev.map((w) =>
        w.id === item.id ? { ...w, waiting: w.waiting - 1 } : w
      )
    );

    if (showToast) {
      showToast(
        `Next waiting user notified for ${item.equipment}!`,
        "success"
      );
    }
  };

  const handleViewRequests = (item) => {
    setSelectedEquipment(item);

    if (showToast) {
      showToast(
        `Viewing active queue for ${item.equipment} (${item.waiting} waiting)`,
        "info"
      );
    }
  };

  return (
    <div className="manager-waitlist-page">

      <div className="manager-waitlist-header">
        <div>
          <h1>Waitlist Management</h1>

          <p>
            Monitor equipment demand and manage waiting requests
          </p>
        </div>

        <div className="manager-role-badge">
          Lab Manager
        </div>
      </div>


      {/* SUMMARY */}

      <div className="manager-waitlist-summary">

        <div className="manager-waitlist-card">
          <span className="manager-icon blue">◷</span>
          <div>
            <small>Active Waitlists</small>
            <strong>{waitlist.length}</strong>
          </div>
        </div>

        <div className="manager-waitlist-card">
          <span className="manager-icon orange">#</span>
          <div>
            <small>Total Waiting</small>
            <strong>{totalWaiting}</strong>
          </div>
        </div>

        <div className="manager-waitlist-card">
          <span className="manager-icon red">!</span>
          <div>
            <small>High Demand</small>
            <strong>{highDemandCount}</strong>
          </div>
        </div>

        <div className="manager-waitlist-card">
          <span className="manager-icon green">✓</span>
          <div>
            <small>Available Soon</small>
            <strong>2</strong>
          </div>
        </div>

      </div>


      {/* MANAGEMENT TABLE */}

      <div className="manager-waitlist-container">

        <div className="manager-section-header">

          <div>
            <h2>Equipment Waitlists</h2>

            <p>
              Current demand and queue information
            </p>
          </div>

        </div>


        <div className="manager-waitlist-table">

          <div className="manager-table-header">
            <div>Equipment</div>
            <div>Department</div>
            <div>Waiting</div>
            <div>Next Available</div>
            <div>Demand</div>
            <div>Action</div>
          </div>


          {waitlist.map((item) => (

            <div
              className="manager-table-row"
              key={item.id}
            >

              <div className="manager-equipment">

                <div className="manager-equipment-icon">
                  {item.equipment.charAt(0)}
                </div>

                <div>
                  <strong>{item.equipment}</strong>
                  <small>{item.id}</small>
                </div>

              </div>


              <div className="manager-department">
                {item.department}
              </div>


              <div className="waiting-count">
                {item.waiting} people
              </div>


              <div className="next-available">
                {item.nextAvailable}
              </div>


              <div>

                <span
                  className={`demand-badge ${item.demand.toLowerCase()}`}
                >
                  {item.demand}
                </span>

              </div>


              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="manage-request-btn"
                  onClick={() => handleViewRequests(item)}
                >
                  View Requests
                </button>

                <button
                  className="manage-request-btn"
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                  }}
                  disabled={item.waiting === 0}
                  onClick={() => handleNotifyNextUser(item)}
                >
                  Notify Next
                </button>
              </div>

            </div>

          ))}

        </div>

      </div>

      {/* QUEUE DETAILS MODAL */}
      {selectedEquipment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "480px",
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", color: "#172b4d" }}>
                {selectedEquipment.equipment} Queue
              </h2>
              <button
                onClick={() => setSelectedEquipment(null)}
                style={{
                  border: "none",
                  background: "#f1f4f8",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              Currently {selectedEquipment.waiting} user(s) waiting in queue. Next slot available: <strong>{selectedEquipment.nextAvailable}</strong>.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setSelectedEquipment(null)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleNotifyNextUser(selectedEquipment);
                  setSelectedEquipment(null);
                }}
                disabled={selectedEquipment.waiting === 0}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Release & Notify Next
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManagerWaitlist;