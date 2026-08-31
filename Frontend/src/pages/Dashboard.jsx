import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const response = await api.get("/equipment");

      if (Array.isArray(response.data)) {
        setEquipment(response.data);
      } else {
        setEquipment([]);
      }

    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError("Unable to load dashboard data.");

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">


      <main className="dashboard-content">

        <section className="welcome-section">

          <h2>
            Welcome, {user?.fullName || "User"}!
          </h2>

          <p>
            Manage laboratory equipment, bookings,
            utilization and resource sharing.
          </p>

        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="dashboard-cards">

          <div className="dashboard-card">

            <div className="card-icon">
              🔬
            </div>

            <div>
              <h3>Equipment</h3>
              <p>{equipment.length}</p>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">
              📅
            </div>

            <div>
              <h3>My Bookings</h3>
              <p>0</p>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">
              ⏱️
            </div>

            <div>
              <h3>Utilization</h3>
              <p>0%</p>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">
              🔔
            </div>

            <div>
              <h3>Pending Requests</h3>
              <p>0</p>
            </div>

          </div>

        </section>

        <section className="equipment-section">

          <div className="section-header">

            <div>
              <h2>Equipment</h2>
              <p>
                Available laboratory resources
              </p>
            </div>

            <button
              onClick={() => navigate("/equipment")}
              className="view-all-button"
            >
              View All
            </button>

          </div>

          {equipment.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🔬
              </div>

              <h3>No equipment available</h3>

              <p>
                Equipment will appear here once
                it has been added to the platform.
              </p>

            </div>

          ) : (

            <div className="equipment-grid">

              {equipment.slice(0, 6).map((item) => (

                <div
                  className="equipment-card"
                  key={item.id}
                >

                  <div className="equipment-image">
                    🔬
                  </div>

                  <div className="equipment-info">

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      {item.category || "Laboratory Equipment"}
                    </p>

                    <span
                      className={
                        `status ${String(
                          item.status || "AVAILABLE"
                        ).toLowerCase()}`
                      }
                    >
                      {item.status || "AVAILABLE"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;