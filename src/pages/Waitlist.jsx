import "./Waitlist.css";

function Waitlist() {
  const myWaitlist = [
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
  ];

  return (
    <div className="waitlist-page">

      <div className="waitlist-header">
        <div>
          <h1>My Waitlist</h1>
          <p>
            Track equipment you are waiting to access
          </p>
        </div>

        <div className="waitlist-role-badge">
          Researcher
        </div>
      </div>


      {/* SUMMARY */}

      <div className="waitlist-summary">

        <div className="waitlist-summary-card">
          <span className="summary-icon blue">◷</span>
          <div>
            <small>Active Requests</small>
            <strong>{myWaitlist.length}</strong>
          </div>
        </div>

        <div className="waitlist-summary-card">
          <span className="summary-icon orange">#</span>
          <div>
            <small>Next Position</small>
            <strong>#1</strong>
          </div>
        </div>

        <div className="waitlist-summary-card">
          <span className="summary-icon green">✓</span>
          <div>
            <small>Available Soon</small>
            <strong>1</strong>
          </div>
        </div>

      </div>


      {/* WAITLIST */}

      <div className="my-waitlist-container">

        <div className="waitlist-section-header">
          <div>
            <h2>My Requests</h2>
            <p>
              Equipment you have joined the waitlist for
            </p>
          </div>
        </div>


        <div className="my-waitlist-list">

          {myWaitlist.map((item) => (

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
                    item.status === "Waiting"
                      ? "waiting"
                      : "soon"
                  }`}
                >
                  <span></span>
                  {item.status}
                </span>
              </div>


              <button className="cancel-waitlist-btn">
                Cancel
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Waitlist;