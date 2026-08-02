import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import "../styles/admin.css";

function AdminDashboard() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage laboratories, equipment and student bookings.</p>
        </div>

        <div className="dashboard-cards">

          <DashboardCard title="Total Laboratories" value="25" />
          <DashboardCard title="Resources" value="350" />
          <DashboardCard title="Registered Students" value="1240" />
          <DashboardCard title="Pending Requests" value="12" />

        </div>

        <div className="recent-bookings">

          <h2>Pending Booking Requests</h2>

          <table>

            <thead>

              <tr>
                <th>Student</th>
                <th>Laboratory</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              <tr>
                <td>Harini Sri</td>
                <td>AI Laboratory</td>
                <td>02 Aug 2026</td>
                <td className="pending">Pending</td>

                <td>

                  <button className="approve-btn">
                    Approve
                  </button>

                  <button className="reject-btn">
                    Reject
                  </button>

                </td>

              </tr>

              <tr>
                <td>Priya</td>
                <td>Cloud Computing Lab</td>
                <td>03 Aug 2026</td>
                <td className="pending">Pending</td>

                <td>

                  <button className="approve-btn">
                    Approve
                  </button>

                  <button className="reject-btn">
                    Reject
                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;