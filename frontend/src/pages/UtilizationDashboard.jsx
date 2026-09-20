import "../styles/utilization.css";

function UtilizationDashboard() {

  const summary = [
    {
      title: "Total Equipment",
      value: 120,
      color: "#2d4aa8",
    },
    {
      title: "High Utilization",
      value: 45,
      color: "#28a745",
    },
    {
      title: "Medium Utilization",
      value: 38,
      color: "#ffc107",
    },
    {
      title: "Idle Equipment",
      value: 37,
      color: "#dc3545",
    },
  ];

  // Dummy Data
  const utilizationData = [
    { lab: "AI Lab", utilization: 90 },
    { lab: "Cloud Lab", utilization: 72 },
    { lab: "IoT Lab", utilization: 55 },
    { lab: "Networking Lab", utilization: 30 },
  ];

  const heatmap = [
    {
      equipment: "Computer-01",
      lab: "AI Lab",
      status: "High",
    },
    {
      equipment: "Arduino Kit",
      lab: "IoT Lab",
      status: "Medium",
    },
    {
      equipment: "Projector",
      lab: "Cloud Lab",
      status: "Low",
    },
    {
      equipment: "3D Printer",
      lab: "Innovation Lab",
      status: "High",
    },
  ];

  // Idle Equipment Dummy Data
  const idleEquipment = [
    {
      name: "Projector",
      lab: "Cloud Lab",
      idle: "5 Days",
      status: "Idle",
    },
    {
      name: "Arduino Kit",
      lab: "IoT Lab",
      idle: "3 Days",
      status: "Idle",
    },
    {
      name: "Monitor-07",
      lab: "AI Lab",
      idle: "8 Days",
      status: "Idle",
    },
    {
      name: "Oscilloscope",
      lab: "ECE Lab",
      idle: "10 Days",
      status: "Idle",
    },
  ];

  return (
    <div className="utilization-container">

      <h1>Equipment Utilization Dashboard</h1>

      <p>
        Monitor laboratory equipment usage and identify idle resources.
      </p>

      {/* Summary Cards */}
      <div className="summary-grid">

        {summary.map((item, index) => (

          <div
            className="summary-card"
            key={index}
            style={{ borderTop: `5px solid ${item.color}` }}
          >

            <h3>{item.title}</h3>

            <h2>{item.value}</h2>

          </div>

        ))}

      </div>

      {/* Utilization Chart */}
      <h2 className="section-title">
        Equipment Utilization
      </h2>

      <div className="chart-container">

        {utilizationData.map((item) => (

          <div
            className="chart-item"
            key={item.lab}
          >

            <div className="chart-label">
              {item.lab}
            </div>

            <div className="progress">

              <div
                className="progress-fill"
                style={{ width: `${item.utilization}%` }}
              >
                {item.utilization}%
              </div>

            </div>

          </div>

        ))}

      </div>

      {/* Heatmap */}
      <h2 className="section-title">
        Equipment Heatmap
      </h2>

      <div className="heatmap-grid">

        {heatmap.map((item, index) => (

          <div
            className="heatmap-card"
            key={index}
          >

            <h3>{item.equipment}</h3>

            <p>{item.lab}</p>

            <span
              className={`badge ${item.status.toLowerCase()}`}
            >
              {item.status} Utilization
            </span>

          </div>

        ))}

      </div>

      {/* Idle Equipment Detection */}
      <h2 className="section-title">
        Idle Equipment Detection
      </h2>

      <div className="idle-table">

        <table>

          <thead>

            <tr>
              <th>Equipment</th>
              <th>Laboratory</th>
              <th>Idle Time</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {idleEquipment.map((item, index) => (

              <tr key={index}>

                <td>{item.name}</td>

                <td>{item.lab}</td>

                <td>{item.idle}</td>

                <td>
                  <span className="idle-badge">
                    {item.status}
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default UtilizationDashboard;