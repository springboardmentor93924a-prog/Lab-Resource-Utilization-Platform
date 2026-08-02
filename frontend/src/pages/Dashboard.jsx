import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="dashboard-header">
          <h1>Welcome, Harini 👋</h1>
          <p>
            Monitor laboratory resources, bookings and equipment usage
            from one dashboard.
          </p>
        </div>

        <div className="dashboard-cards">

          <DashboardCard title="Total Laboratories" value="25" />
          <DashboardCard title="Available Labs" value="18" />
          <DashboardCard title="Today's Bookings" value="42" />
          <DashboardCard title="Resource Utilization" value="98%" />

        </div>

        <div className="recent-bookings">

          <h2>Recent Bookings</h2>

          <table>

            <thead>
              <tr>
                <th>Laboratory</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>AI Laboratory</td>
                <td>02 Aug 2026</td>
                <td>09:00 - 11:00</td>
                <td className="available">Approved</td>
              </tr>

              <tr>
                <td>Cloud Computing Lab</td>
                <td>03 Aug 2026</td>
                <td>01:00 - 03:00</td>
                <td className="pending">Pending</td>
              </tr>

              <tr>
                <td>IoT Laboratory</td>
                <td>05 Aug 2026</td>
                <td>10:00 - 12:00</td>
                <td className="rejected">Rejected</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;