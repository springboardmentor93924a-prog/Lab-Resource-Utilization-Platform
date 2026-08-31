import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="topbar">

      {/* Platform Header */}

      <div className="topbar-title">
        <h1>Lab Equipment Utilization Platform</h1>
        <p>
          Manage laboratory resources, bookings and utilization
        </p>
      </div>

      {/* Right Side */}

      <div className="topbar-right">

        <button
          className="notification-button"
          title="Notifications"
        >
          🔔
        </button>

        <div className="topbar-user">

          <div className="user-avatar">
            {user?.fullName
              ? user.fullName.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="user-info">

            <strong>
              {user?.fullName || "User"}
            </strong>

            <span>
              {user?.role || "Researcher"}
            </span>

          </div>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Topbar;