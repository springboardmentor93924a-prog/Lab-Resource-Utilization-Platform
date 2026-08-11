import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./MainLayout.css";

function MainLayout({ children }) {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: "Overview of laboratory resources and utilization",
    },

    "/equipment": {
      title: "Equipment Management",
      subtitle: "View and manage laboratory equipment",
    },

    "/reservations": {
      title: "Reservations",
      subtitle: "Manage laboratory equipment bookings",
    },

    "/reports": {
      title: "Reports & Analytics",
      subtitle: "Analyze resource utilization and demand",
    },

    "/users": {
      title: "User Management",
      subtitle: "Manage users and access permissions",
    },
  };

  const currentPage = pageTitles[location.pathname] || {
    title: "Lab Resource Utilization Platform",
    subtitle: "",
  };

  return (
    <div className="app-layout">

      {/* Global application header */}
      <Navbar />

      <div className="app-body">

        {/* Navigation */}
        <Sidebar />

        {/* Main page area */}
        <main className="main-content">

          {/* Page heading */}
          <div className="page-header">

            <div>
              <h2>{currentPage.title}</h2>

              {currentPage.subtitle && (
                <p>{currentPage.subtitle}</p>
              )}
            </div>

          </div>

          {/* Actual page */}
          <div className="page-content">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}

export default MainLayout;
