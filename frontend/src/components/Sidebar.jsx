import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#f4f4f4",
        minHeight: "calc(100vh - 60px)",
        padding: "20px",
      }}
    >
      <h3>Menu</h3>

      <p><Link to="/dashboard">Dashboard</Link></p>
      <p><Link to="/equipment">Equipment</Link></p>
      <p><Link to="/reservations">Reservations</Link></p>
      <p><Link to="/reports">Reports</Link></p>
      <p><Link to="/user">User</Link></p>
    </div>
  );
}

export default Sidebar;