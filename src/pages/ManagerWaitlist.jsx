import "./ManagerWaitlist.css";

function ManagerWaitlist() {
  const waitlist = [
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
  ];

  const totalWaiting = waitlist.reduce(
    (sum, item) => sum + item.waiting,
    0
  );

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
            <strong>1</strong>
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


              <button className="manage-request-btn">
                View Requests
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default ManagerWaitlist;