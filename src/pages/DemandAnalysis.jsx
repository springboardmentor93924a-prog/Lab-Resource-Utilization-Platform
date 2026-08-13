import { useState } from "react";
import "./DemandAnalysis.css";

function DemandAnalysis() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const equipment = [
    {
      id: "EQ001",
      name: "Oscilloscope",
      category: "Electronics",
      department: "ECE",
      utilization: 82,
      bookings: 38,
      demand: "High",
    },
    {
      id: "EQ002",
      name: "Digital Multimeter",
      category: "Electronics",
      department: "ECE",
      utilization: 35,
      bookings: 18,
      demand: "Medium",
    },
    {
      id: "EQ003",
      name: "3D Printer",
      category: "Manufacturing",
      department: "Mechanical",
      utilization: 68,
      bookings: 31,
      demand: "High",
    },
    {
      id: "EQ004",
      name: "CNC Machine",
      category: "Manufacturing",
      department: "Mechanical",
      utilization: 18,
      bookings: 8,
      demand: "Low",
    },
    {
      id: "EQ005",
      name: "Spectrometer",
      category: "Optical",
      department: "Physics",
      utilization: 22,
      bookings: 11,
      demand: "Low",
    },
  ];

  const filteredEquipment =
    selectedDepartment === "All"
      ? equipment
      : equipment.filter(
          (item) => item.department === selectedDepartment
        );

  const averageUtilization = Math.round(
    filteredEquipment.reduce(
      (sum, item) => sum + item.utilization,
      0
    ) / filteredEquipment.length
  );

  const totalBookings = filteredEquipment.reduce(
    (sum, item) => sum + item.bookings,
    0
  );

  const highDemand = filteredEquipment.filter(
    (item) => item.demand === "High"
  ).length;

  const mediumDemand = filteredEquipment.filter(
    (item) => item.demand === "Medium"
  ).length;

  const lowDemand = filteredEquipment.filter(
    (item) => item.demand === "Low"
  ).length;

  return (
    <div className="demand-page">

      {/* HEADER */}

      <div className="demand-header">

        <div>
          <h1>Utilization & Demand Analysis</h1>

          <p>
            Analyze equipment utilization, booking demand,
            and resource usage patterns
          </p>
        </div>

        <div className="analysis-filter">

          <label>Department</label>

          <select
            value={selectedDepartment}
            onChange={(e) =>
              setSelectedDepartment(e.target.value)
            }
          >
            <option value="All">All Departments</option>
            <option value="ECE">ECE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Physics">Physics</option>
          </select>

        </div>

      </div>


      {/* SUMMARY CARDS */}

      <div className="demand-summary">

        <SummaryCard
          title="Average Utilization"
          value={`${averageUtilization}%`}
          subtitle="Across selected equipment"
          type="blue"
        />

        <SummaryCard
          title="Total Bookings"
          value={totalBookings}
          subtitle="Current booking demand"
          type="purple"
        />

        <SummaryCard
          title="High Demand"
          value={highDemand}
          subtitle="Equipment requiring attention"
          type="orange"
        />

        <SummaryCard
          title="Low Demand"
          value={lowDemand}
          subtitle="Potentially idle resources"
          type="green"
        />

      </div>


      {/* UTILIZATION OVERVIEW */}

      <div className="analysis-grid">

        <div className="analysis-card utilization-analysis">

          <div className="card-heading">

            <div>
              <h2>Equipment Utilization</h2>

              <p>
                Percentage of available time equipment is being used
              </p>
            </div>

          </div>

          <div className="utilization-bars">

            {filteredEquipment.map((item) => (

              <div
                className="utilization-bar-row"
                key={item.id}
              >

                <div className="bar-equipment">

                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {item.utilization}%
                  </strong>

                </div>

                <div className="analysis-progress">

                  <div
                    className={`analysis-progress-fill ${
                      item.utilization >= 70
                        ? "high"
                        : item.utilization >= 40
                        ? "medium"
                        : "low"
                    }`}
                    style={{
                      width: `${item.utilization}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* DEMAND DISTRIBUTION */}

        <div className="analysis-card">

          <div className="card-heading">

            <div>
              <h2>Demand Distribution</h2>

              <p>
                Equipment grouped by booking demand
              </p>
            </div>

          </div>

          <div className="demand-distribution">

            <DemandItem
              label="High Demand"
              count={highDemand}
              description="Frequently requested"
              type="high"
            />

            <DemandItem
              label="Medium Demand"
              count={mediumDemand}
              description="Moderately requested"
              type="medium"
            />

            <DemandItem
              label="Low Demand"
              count={lowDemand}
              description="Less frequently requested"
              type="low"
            />

          </div>

        </div>

      </div>


      {/* HIGH DEMAND EQUIPMENT */}

      <div className="analysis-card equipment-demand-card">

        <div className="card-heading">

          <div>
            <h2>Equipment Demand Analysis</h2>

            <p>
              Identify resources with high booking demand
            </p>
          </div>

        </div>

        <div className="demand-table">

          <div className="demand-table-header">
            <span>Equipment</span>
            <span>Department</span>
            <span>Utilization</span>
            <span>Bookings</span>
            <span>Demand</span>
          </div>

          {filteredEquipment.map((item) => (

            <div
              className="demand-table-row"
              key={item.id}
            >

              <div className="demand-equipment">

                <div className="demand-equipment-icon">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <strong>{item.name}</strong>

                  <small>
                    {item.id} • {item.category}
                  </small>
                </div>

              </div>

              <span>
                {item.department}
              </span>

              <strong>
                {item.utilization}%
              </strong>

              <span className="booking-count">
                {item.bookings}
              </span>

              <DemandBadge
                demand={item.demand}
              />

            </div>

          ))}

        </div>

        <div className="analysis-footer">
          Showing {filteredEquipment.length} of{" "}
          {equipment.length} equipment
        </div>

      </div>


      {/* INSIGHT */}

      <div className="demand-insight">

        <div className="insight-icon">
          ✦
        </div>

        <div>
          <h3>Resource Planning Insight</h3>

          <p>
            High-demand equipment may require additional
            booking slots or resource sharing, while
            low-utilization equipment can be reviewed for
            better allocation.
          </p>
        </div>

      </div>

    </div>
  );
}


/* =========================================
   SUMMARY CARD
========================================= */

function SummaryCard({
  title,
  value,
  subtitle,
  type,
}) {
  return (
    <div className="demand-summary-card">

      <div className={`summary-icon ${type}`}>
        {type === "blue" && "↗"}
        {type === "purple" && "◷"}
        {type === "orange" && "!"}
        {type === "green" && "✓"}
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{subtitle}</small>
      </div>

    </div>
  );
}


/* =========================================
   DEMAND ITEM
========================================= */

function DemandItem({
  label,
  count,
  description,
  type,
}) {
  return (
    <div className="demand-item">

      <div className={`demand-indicator ${type}`} />

      <div className="demand-item-info">

        <strong>{label}</strong>

        <span>{description}</span>

      </div>

      <strong className="demand-item-count">
        {count}
      </strong>

    </div>
  );
}


/* =========================================
   DEMAND BADGE
========================================= */

function DemandBadge({ demand }) {

  const type =
    demand === "High"
      ? "high"
      : demand === "Medium"
      ? "medium"
      : "low";

  return (
    <span className={`demand-badge ${type}`}>
      <span />
      {demand}
    </span>
  );
}


export default DemandAnalysis;