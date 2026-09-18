import { useEffect, useState } from "react";
import "./ResearcherEquipment.css";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";

function ResearcherEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllEquipment()
      .then(setEquipment)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load equipment.")))
      .finally(() => setLoading(false));
  }, []);

  const available = equipment.filter((e) => e.status === "AVAILABLE").length;
  const inUse = equipment.filter((e) => e.status === "IN_USE").length;
  const booked = equipment.filter((e) => e.status === "BOOKED").length;
  const maintenance = equipment.filter((e) => e.status === "UNDER_MAINTENANCE").length;

  return (
    <div className="researcher-equipment-page">
      <div className="researcher-equipment-header">
        <div>
          <h1>Equipment Overview</h1>
          <p>View laboratory equipment available within the institution</p>
        </div>
        <div className="institution-label">Institution Equipment</div>
      </div>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      <div className="researcher-equipment-summary">
        <div className="equipment-summary-card total">
          <div className="summary-icon">▣</div>
          <div>
            <span>Total Equipment</span>
            <strong>{equipment.length}</strong>
          </div>
        </div>

        <div className="equipment-summary-card available">
          <div className="summary-icon">✓</div>
          <div>
            <span>Available</span>
            <strong>{available}</strong>
          </div>
        </div>

        <div className="equipment-summary-card in-use">
          <div className="summary-icon">●</div>
          <div>
            <span>In Use</span>
            <strong>{inUse}</strong>
          </div>
        </div>

        <div className="equipment-summary-card booked">
          <div className="summary-icon">◷</div>
          <div>
            <span>Booked</span>
            <strong>{booked}</strong>
          </div>
        </div>

        <div className="equipment-summary-card maintenance">
          <div className="summary-icon">⚙</div>
          <div>
            <span>Maintenance</span>
            <strong>{maintenance}</strong>
          </div>
        </div>
      </div>

      <div className="researcher-equipment-container">
        <div className="equipment-list-header">
          <div>
            <h2>Institution Equipment</h2>
            <p>Current equipment inventory and operational status</p>
          </div>
          <span>{equipment.length} Resources</span>
        </div>

        <div className="equipment-table">
          <div className="equipment-table-header">
            <div>Equipment</div>
            <div>Category</div>
            <div>Department</div>
            <div>Institution</div>
            <div>Status</div>
          </div>

          {loading ? (
            <p style={{ padding: 20 }}>Loading equipment...</p>
          ) : (
            equipment.map((item) => (
              <div className="equipment-table-row" key={item.equipmentId}>
                <div className="equipment-name-cell">
                  <div className="equipment-avatar">
                    {(item.equipmentName || "?").charAt(0)}
                  </div>
                  <div>
                    <strong>{item.equipmentName}</strong>
                    <small>{item.assetTag}</small>
                  </div>
                </div>

                <div className="equipment-category">{item.categoryName || "-"}</div>
                <div className="equipment-department">{item.departmentName || "-"}</div>
                <div className="equipment-location">{item.institutionName || "-"}</div>

                <div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="equipment-list-footer">
          Showing {equipment.length} of {equipment.length} equipment
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let className = "available";
  if (status === "IN_USE") className = "in-use";
  if (status === "BOOKED") className = "booked";
  if (status === "UNDER_MAINTENANCE" || status === "OUT_OF_SERVICE") className = "maintenance";

  return (
    <span className={`researcher-status-badge ${className}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

export default ResearcherEquipment;
