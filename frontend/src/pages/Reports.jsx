import "./Reports.css";

function Reports() {
  const reports = [
    {
      id: 1,
      equipment: "Projector",
      bookings: 18,
      utilization: "85%",
      maintenance: "Good",
    },
    {
      id: 2,
      equipment: "Arduino Uno",
      bookings: 12,
      utilization: "65%",
      maintenance: "Good",
    },
    {
      id: 3,
      equipment: "Laptop",
      bookings: 25,
      utilization: "92%",
      maintenance: "Maintenance Due",
    },
  ];

  return (
    <div className="reports-container">

      <div className="reports-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>View equipment usage and laboratory resource utilization</p>
        </div>
      </div>

      <div className="report-summary">

        <div className="report-card">
          <h3>Total Bookings</h3>
          <p>55</p>
          <span>This Month</span>
        </div>

        <div className="report-card">
          <h3>Average Utilization</h3>
          <p>81%</p>
          <span>Equipment Usage</span>
        </div>

        <div className="report-card">
          <h3>Active Equipment</h3>
          <p>120</p>
          <span>Currently Available</span>
        </div>

        <div className="report-card">
          <h3>Maintenance Due</h3>
          <p>8</p>
          <span>Requires Attention</span>
        </div>

      </div>

      <div className="report-table-card">

        <h3>Equipment Utilization</h3>

        <table className="report-table">

          <thead>
            <tr>
              <th>Equipment</th>
              <th>Total Bookings</th>
              <th>Utilization</th>
              <th>Maintenance</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>

                <td className="report-equipment">
                  {report.equipment}
                </td>

                <td>{report.bookings}</td>

                <td>
                  <div className="utilization-wrapper">
                    <div className="utilization-bar">
                      <div
                        className="utilization-fill"
                        style={{ width: report.utilization }}
                      ></div>
                    </div>

                    <span>{report.utilization}</span>
                  </div>
                </td>

                <td>
                  <span
                    className={
                      report.maintenance === "Good"
                        ? "maintenance-good"
                        : "maintenance-due"
                    }
                  >
                    {report.maintenance}
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

export default Reports;