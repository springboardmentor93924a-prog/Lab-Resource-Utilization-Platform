import { FaFlask, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../styles/resourcecard.css";
import { Link } from "react-router-dom";

function ResourceCard({ title, department, status }) {
  return (
    <div className="resource-card">

      <div className="resource-icon">
        <FaFlask />
      </div>

      <h3>{title}</h3>

      <p>
        <strong>Department:</strong> {department}
      </p>

      <p className={status.toLowerCase()}>
        {status === "Available" ? (
          <>
            <FaCheckCircle /> Available
          </>
        ) : status === "Busy" ? (
          <>
            <FaTimesCircle /> Busy
          </>
        ) : (
          <>
            ⚙️ Maintenance
          </>
        )}
      </p>

      <Link to="/booking">
    <button className="book-btn">
        Book Now
    </button>
</Link>

    </div>
  );
}

export default ResourceCard;