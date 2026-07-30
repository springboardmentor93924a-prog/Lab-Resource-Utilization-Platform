import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="cards">
        <div className="card">
          <h3>Total Equipment</h3>
          <p>150</p>
        </div>

        <div className="card">
          <h3>Available</h3>
          <p>120</p>
        </div>

        <div className="card">
          <h3>Reserved</h3>
          <p>20</p>
        </div>

        <div className="card">
          <h3>Users</h3>
          <p>45</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;