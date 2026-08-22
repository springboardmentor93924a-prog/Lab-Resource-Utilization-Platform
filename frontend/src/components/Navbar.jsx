import "./Navbar.css";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const fullName = sessionStorage.getItem("fullName") || "User";
  const role = sessionStorage.getItem("role") || "";

  const formattedRole = role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <header className="top-navbar">
      <div className="navbar-title">
        <h1>Lab Resource Utilization Platform</h1>
        <p>Laboratory Resource Management</p>
      </div>

      <div className="navbar-user">
        <NotificationBell />

        <div className="user-avatar">{fullName.charAt(0).toUpperCase()}</div>

        <div className="user-info">
          <strong>{fullName}</strong>
          <span>{formattedRole}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;