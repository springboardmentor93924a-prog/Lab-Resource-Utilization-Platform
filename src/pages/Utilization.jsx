import { useState } from "react";
import "./Utilization.css";

function Utilization() {
  const [selectedStatus, setSelectedStatus] = useState("All");

  const equipment = [
    {
      id: "EQ001",
      name: "Oscilloscope",
      category: "Electronics",
      department: "ECE",
      location: "Lab 101",
      status: "In Use",
      utilization: 82,
      usageHours: 164,
      availableHours: 200,
    },
    {
      id: "EQ002",
      name: "Digital Multimeter",
      category: "Electronics",
      department: "ECE",
      location: "Lab 102",
      status: "Available",
      utilization: 35,
      usageHours: 70,
      availableHours: 200,
    },
    {
      id: "EQ003",
      name: "3D Printer",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Lab 201",
      status: "Booked",
      utilization: 68,
      usageHours: 136,
      availableHours: 200,
    },
    {
      id: "EQ004",
      name: "CNC Machine",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Workshop",
      status: "Under Maintenance",
      utilization: 18,
      usageHours: 36,
      availableHours: 200,
    },
    {
      id: "EQ005",
      name: "Spectrometer",
      category: "Optical",
      department: "Physics",
      location: "Lab 301",
      status: "Available",
      utilization: 22,
      usageHours: 44,
      availableHours: 200,
    },
  ];

  const filteredEquipment =
    selectedStatus === "All"
      ? equipment
      : equipment.filter(
          (item) => item.status === selectedStatus
        );

  const totalEquipment = equipment.length;

  const inUse = equipment.filter(
    (item) => item.status === "In Use"
  ).length;

  const booked = equipment.filter(
    (item) => item.status === "Booked"
  ).length;

  const available = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const maintenance = equipment.filter(
    (item) => item.status === "Under Maintenance"
  ).length;

  const averageUtilization = Math.round(
    equipment.reduce(
      (sum, item) => sum + item.utilization,
      0
    ) / equipment.length
  );

  return (
    <div className="utilization-page">

      {/* HEADER */}

      <div className="utilization-header">
        <div>
          <h1>Equipment Utilization</h1>

          <p>
            Monitor real-time laboratory equipment status
            and resource utilization
          </p>
        </div>

        <div className="live-status">
          <span></span>
          Live Status
        </div>
      </div>


      {/* SUMMARY CARDS */}

      <div className="utilization-stats">

        <StatCard
          title="Total Equipment"
          value={totalEquipment}
          icon="▣"
          className="blue"
        />

        <StatCard
          title="In Use"
          value={inUse}
          icon="◉"
          className="green"
        />

        <StatCard
          title="Booked"
          value={booked}
          icon="◷"
          className="purple"
        />

        <StatCard
          title="Available"
          value={available}
          icon="✓"
          className="teal"
        />

        <StatCard
          title="Maintenance"
          value={maintenance}
          icon="⚙"
          className="orange"
        />

      </div>


      {/* UTILIZATION OVERVIEW */}

      <div className="utilization-overview">

        <div>
          <h2>Overall Utilization</h2>

          <p>
            Average equipment utilization across the
            laboratory
          </p>
        </div>

        <div className="utilization-percentage">
          {averageUtilization}%
        </div>

      </div>

      <div className="main-progress">
        <div
          style={{
            width: `${averageUtilization}%`,
          }}
        ></div>
      </div>


      {/* FILTER */}

      <div className="equipment-section">

        <div className="section-header">

          <div>
            <h2>Equipment Status</h2>

            <p>
              Current operational state and utilization
            </p>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="In Use">In Use</option>
            <option value="Under Maintenance">
              Under Maintenance
            </option>
          </select>

        </div>


        {/* EQUIPMENT TABLE */}

        <div className="utilization-table">

          <div className="table-header">
            <span>Equipment</span>
            <span>Department</span>
            <span>Location</span>
            <span>Status</span>
            <span>Utilization</span>
            <span>Usage</span>
          </div>


          {filteredEquipment.map((item) => (

            <div
              className="table-row"
              key={item.id}
            >

              <div className="equipment-name">

                <div className="equipment-icon">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <strong>{item.name}</strong>

                  <small>
                    {item.id} • {item.category}
                  </small>
                </div>

              </div>


              <span>{item.department}</span>


              <span>{item.location}</span>


              <StatusBadge
                status={item.status}
              />


              <div className="utilization-cell">

                <div className="mini-progress">
                  <div
                    style={{
                      width: `${item.utilization}%`,
                    }}
                  ></div>
                </div>

                <strong>
                  {item.utilization}%
                </strong>

              </div>


              <span className="usage-hours">
                {item.usageHours}h /{" "}
                {item.availableHours}h
              </span>

            </div>

          ))}

        </div>


        <div className="table-footer">
          Showing {filteredEquipment.length} of{" "}
          {equipment.length} equipment
        </div>

      </div>

    </div>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  icon,
  className,
}) {
  return (
    <div className={`util-stat-card ${className}`}>

      <div className="util-stat-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>

    </div>
  );
}


/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {

  let className = "available";

  if (status === "Booked") {
    className = "booked";
  }

  if (status === "In Use") {
    className = "in-use";
  }

  if (status === "Under Maintenance") {
    className = "maintenance";
  }

  if (status === "Out of Service") {
    className = "out-service";
  }

  if (status === "Retired") {
    className = "retired";
  }

  return (
    <span className={`status-badge ${className}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

export default Utilization;