import "./Navbar.css";

function Navbar() {
  const fullName =
    localStorage.getItem("fullName") || "User";

  const role =
    localStorage.getItem("role") || "";

  const formattedRole = role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return (
    <header className="top-navbar">

      <div className="navbar-title">
        <h1>Lab Resource Utilization Platform</h1>
        <p>Laboratory Resource Management</p>
      </div>

      <div className="navbar-user">

        <div className="user-avatar">
          {fullName.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{fullName}</strong>
          <span>{formattedRole}</span>
        </div>

      </div>

    </header>
  );
}

export default Navbar;