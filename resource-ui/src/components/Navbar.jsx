import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const name = localStorage.getItem("name");

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        navigate("/login");
    }

    return (
        <header className="app-navbar">

            <Link to="/" className="app-navbar-brand">
                Resource Utilization
            </Link>

            <nav className="app-navbar-links">
                <Link to="/">Dashboard</Link>
                <Link to="/users">Users</Link>
                <Link to="/equipment">Equipment</Link>
                <Link to="/bookings">Bookings</Link>
            </nav>

            <div className="navbar-account">

                <div className="user-profile">
                    <span className="user-avatar">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </span>

                    <span className="welcome-user">
                        {name || "User"}
                    </span>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </header>
    );
}

export default Navbar;