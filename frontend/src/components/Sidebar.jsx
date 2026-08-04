import { Link, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const role =
    localStorage.getItem("role");


  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/");
  };


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


      {/* Dashboard */}

      <p>
        <Link to="/dashboard">
          Dashboard
        </Link>
      </p>


      {/* Equipment */}

      {(role === "ADMIN" ||
        role === "FACULTY" ||
        role === "STUDENT" ||
        role === "LAB_TECHNICIAN") && (

        <p>
          <Link to="/equipment">
            Equipment
          </Link>
        </p>

      )}


      {/* Reservations */}

      {(role === "ADMIN" ||
        role === "FACULTY" ||
        role === "STUDENT") && (

        <p>
          <Link to="/reservations">
            Reservations
          </Link>
        </p>

      )}


      {/* Reports */}

      {(role === "ADMIN" ||
        role === "FACULTY" ||
        role === "LAB_TECHNICIAN") && (

        <p>
          <Link to="/reports">
            Reports
          </Link>
        </p>

      )}


      {/* User Management */}

      {role === "ADMIN" && (

        <p>
          <Link to="/user">
            User Management
          </Link>
        </p>

      )}


      <hr />

    </div>

  );
}

export default Sidebar;
