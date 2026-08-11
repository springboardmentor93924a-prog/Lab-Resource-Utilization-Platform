import "./Navbar.css";

function Navbar() {
  const fullName =
    localStorage.getItem("fullName") || "User";

  const role =
    localStorage.getItem("role") || "USER";

  return (
    <header className="top-navbar">

      {/* Brand */}
      <div className="navbar-brand">

        <div className="navbar-logo">
          🔬
        </div>

        <div className="navbar-title">

          <h1>
            Lab Resource Utilization Platform
          </h1>

          <span>
            Laboratory Resource Management System
          </span>

        </div>

      </div>


      {/* User information */}
      <div className="navbar-user">

        <div className="user-info">

          <strong>
            {fullName}
          </strong>

          <span>
            {role.replace("_", " ")}
          </span>

        </div>

        <div className="user-avatar">
          {fullName.charAt(0).toUpperCase()}
        </div>

      </div>

    </header>
  );
}

export default Navbar;
