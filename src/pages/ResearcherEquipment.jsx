import "./ResearcherEquipment.css";

function ResearcherEquipment() {
  const equipment = [
    {
      id: "EQ001",
      name: "Oscilloscope",
      category: "Electronics",
      department: "ECE",
      location: "Lab 101",
      status: "Available",
    },
    {
      id: "EQ002",
      name: "Digital Multimeter",
      category: "Electronics",
      department: "ECE",
      location: "Lab 102",
      status: "In Use",
    },
    {
      id: "EQ003",
      name: "3D Printer",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Lab 201",
      status: "Booked",
    },
    {
      id: "EQ004",
      name: "CNC Machine",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Workshop",
      status: "Under Maintenance",
    },
    {
      id: "EQ005",
      name: "Spectrometer",
      category: "Optical",
      department: "Physics",
      location: "Lab 301",
      status: "Available",
    },
  ];

  const available = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const inUse = equipment.filter(
    (item) => item.status === "In Use"
  ).length;

  const booked = equipment.filter(
    (item) => item.status === "Booked"
  ).length;

  const maintenance = equipment.filter(
    (item) => item.status === "Under Maintenance"
  ).length;

  return (
    <div className="researcher-equipment-page">

      {/* HEADER */}

      <div className="researcher-equipment-header">
        <div>
          <h1>Equipment Overview</h1>

          <p>
            View laboratory equipment available within the institution
          </p>
        </div>

        <div className="institution-label">
          Institution Equipment
        </div>
      </div>


      {/* SUMMARY */}

      <div className="researcher-equipment-summary">

        <div className="equipment-summary-card total">
          <div className="summary-icon">▣</div>

          <div>
            <span>Total Equipment</span>
            <strong>{equipment.length}</strong>
          </div>
        </div>


        <div className="equipment-summary-card available">
          <div className="summary-icon">✓</div>

          <div>
            <span>Available</span>
            <strong>{available}</strong>
          </div>
        </div>


        <div className="equipment-summary-card in-use">
          <div className="summary-icon">●</div>

          <div>
            <span>In Use</span>
            <strong>{inUse}</strong>
          </div>
        </div>


        <div className="equipment-summary-card booked">
          <div className="summary-icon">◷</div>

          <div>
            <span>Booked</span>
            <strong>{booked}</strong>
          </div>
        </div>


        <div className="equipment-summary-card maintenance">
          <div className="summary-icon">⚙</div>

          <div>
            <span>Maintenance</span>
            <strong>{maintenance}</strong>
          </div>
        </div>

      </div>


      {/* EQUIPMENT LIST */}

      <div className="researcher-equipment-container">

        <div className="equipment-list-header">
          <div>
            <h2>Institution Equipment</h2>

            <p>
              Current equipment inventory and operational status
            </p>
          </div>

          <span>
            {equipment.length} Resources
          </span>
        </div>


        <div className="equipment-table">

          {/* TABLE HEADER */}

          <div className="equipment-table-header">

            <div>Equipment</div>
            <div>Category</div>
            <div>Department</div>
            <div>Location</div>
            <div>Status</div>

          </div>


          {/* ROWS */}

          {equipment.map((item) => (

            <div
              className="equipment-table-row"
              key={item.id}
            >

              {/* EQUIPMENT */}

              <div className="equipment-name-cell">

                <div className="equipment-avatar">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <strong>{item.name}</strong>

                  <small>{item.id}</small>
                </div>

              </div>


              {/* CATEGORY */}

              <div className="equipment-category">
                {item.category}
              </div>


              {/* DEPARTMENT */}

              <div className="equipment-department">
                {item.department}
              </div>


              {/* LOCATION */}

              <div className="equipment-location">
                {item.location}
              </div>


              {/* STATUS */}

              <div>
                <StatusBadge status={item.status} />
              </div>

            </div>

          ))}

        </div>


        <div className="equipment-list-footer">
          Showing {equipment.length} of {equipment.length} equipment
        </div>

      </div>

    </div>
  );
}


/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {

  let className = "available";

  if (status === "In Use") {
    className = "in-use";
  }

  if (status === "Booked") {
    className = "booked";
  }

  if (status === "Under Maintenance") {
    className = "maintenance";
  }

  return (
    <span className={`researcher-status-badge ${className}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

export default ResearcherEquipment;