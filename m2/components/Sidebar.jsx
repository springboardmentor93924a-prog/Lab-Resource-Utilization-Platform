import { Link } from "react-router-dom";

function Sidebar() {
    return (
      <ul className="nav flex-column">
        <li className="nav-item">
                    <Link className="nav-link text-white" to="/utilization">
                       Utilization Dashboard
                    </Link>
                </li>

                <li className="nav-item">
                    <Link className="nav-link text-white" to="/heatmap">
                       Utilization Heatmap
                    </Link>
                </li>

                <li className="nav-item">
                    <Link className="nav-link text-white" to="/booking-approval">
                       Booking Approval
                    </Link>
                </li>
      </ul>
      );

}

export default Sidebar;