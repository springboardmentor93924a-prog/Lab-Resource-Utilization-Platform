import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./EquipmentDetails.css";

function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEquipment();
  }, [id]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/equipment/${id}`);

      setEquipment(response.data);
    } catch (err) {
      console.error("Equipment details error:", err);
      setError("Unable to load equipment details.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "status-available";

      case "IN_USE":
        return "status-in-use";

      case "BOOKED":
        return "status-booked";

      case "UNDER_MAINTENANCE":
        return "status-maintenance";

      default:
        return "";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          Loading equipment details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/equipment")}
        >
          Back to Equipment
        </button>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="page-container">
        <div className="error-message">
          Equipment not found.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      <button
        className="back-button"
        onClick={() => navigate("/equipment")}
      >
        ← Back to Equipment
      </button>

      <div className="equipment-details-card">

        <div className="equipment-details-image">

          {equipment.imageUrl ? (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
            />
          ) : (
            <div className="no-image">
              No Image Available
            </div>
          )}

        </div>

        <div className="equipment-details-content">

          <div className="details-header">

            <div>
              <h1>{equipment.name}</h1>

              <p className="asset-tag">
                Asset Tag: {equipment.assetTag}
              </p>
            </div>

            <span
              className={`equipment-status ${getStatusClass(
                equipment.status
              )}`}
            >
              {formatStatus(equipment.status)}
            </span>

          </div>

          <div className="details-section">

            <h2>Equipment Information</h2>

            <div className="details-grid">

              <div>
                <strong>Category</strong>
                <span>{equipment.category || "N/A"}</span>
              </div>

              <div>
                <strong>Manufacturer</strong>
                <span>
                  {equipment.manufacturer || "N/A"}
                </span>
              </div>

              <div>
                <strong>Model Number</strong>
                <span>
                  {equipment.modelNumber || "N/A"}
                </span>
              </div>

              <div>
                <strong>Institution</strong>
                <span>
                  {equipment.institution?.name || "N/A"}
                </span>
              </div>

              <div>
                <strong>Department</strong>
                <span>
                  {equipment.department?.name || "N/A"}
                </span>
              </div>

              <div>
                <strong>Calibration Due</strong>
                <span>
                  {equipment.calibrationDueDate || "N/A"}
                </span>
              </div>

            </div>

          </div>

          <div className="details-section">

            <h2>Capacity & Notes</h2>

            <p>
              {equipment.capacityNotes ||
                "No additional information available."}
            </p>

          </div>

          <div className="details-actions">

            {equipment.status === "AVAILABLE" ? (
              <button
                className="primary-button"
                onClick={() =>
                  navigate(`/booking?equipmentId=${equipment.id}`)
                }
              >
                Book Now
              </button>
            ) : (
              <button
                className="primary-button"
                disabled
              >
                Equipment Not Available
              </button>
            )}

            {equipment.manualUrl && (
              <a
                href={equipment.manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-button"
              >
                View Manual
              </a>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default EquipmentDetails;
