import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function SharedEquipment() {

  const navigate = useNavigate();

  const [sharedEquipment, setSharedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD SHARED EQUIPMENT
  // =========================================================

  const loadSharedEquipment = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/shared-equipment");

      const data = response.data;

      if (Array.isArray(data)) {

        setSharedEquipment(data);

      } else if (Array.isArray(data?.data)) {

        setSharedEquipment(data.data);

      } else {

        setSharedEquipment([]);

      }

    } catch (err) {

      console.error(
        "Shared equipment loading error:",
        err
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load shared equipment."
      );

      setSharedEquipment([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadSharedEquipment();

  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getEquipmentName = (item) => {

    return (
      item.equipmentName ||
      item.equipment?.name ||
      item.name ||
      "Equipment"
    );

  };

  const getDescription = (item) => {

    return (
      item.description ||
      item.equipment?.description ||
      "No description available."
    );

  };

  const getOwnerInstitution = (item) => {

    return (
      item.ownerInstitutionName ||
      item.ownerInstitution?.name ||
      "Unknown Institution"
    );

  };

  const getSharedInstitution = (item) => {

    return (
      item.sharedWithInstitutionName ||
      item.sharedWithInstitution?.name ||
      "Unknown Institution"
    );

  };

  const isAvailable = (item) => {

    return (
      item.available === true &&
      (
        !item.sharingStatus ||
        item.sharingStatus.toUpperCase() === "ACTIVE"
      )
    );

  };

  // =========================================================
  // REQUEST ACCESS
  // =========================================================

  const handleRequestAccess = (item) => {

    navigate(
      `/request-access/${item.id}`,
      {
        state: {
          sharedEquipment: item
        }
      }
    );

  };

  // =========================================================
  // PAGE
  // =========================================================

  return (

          <div className="shared-equipment-page">

            {/* HEADER */}

            <div className="shared-equipment-page-header">

              <div>

                <h1 className="shared-equipment-page-title">
                  Shared Equipment
                </h1>

                <p className="shared-equipment-page-subtitle">
                  Browse equipment shared by other institutions
                </p>

              </div>

              <button
                type="button"
                className="shared-equipment-refresh-button"
                onClick={loadSharedEquipment}
              >
                ↻ Refresh
              </button>

            </div>

            {/* ERROR */}

            {error && (

              <div className="shared-equipment-error">
                {error}
              </div>

            )}

            {/* LOADING */}

            {loading ? (

              <div className="shared-equipment-loading">
                <div className="shared-equipment-loading-icon">
                  ⏳
                </div>

                <p>
                  Loading shared equipment...
                </p>
              </div>

            ) : sharedEquipment.length === 0 ? (

              /* EMPTY */

              <div className="shared-equipment-empty">

                <div className="shared-equipment-empty-icon">
                  🔬
                </div>

                <h2>
                  No Shared Equipment
                </h2>

                <p>
                  There is currently no equipment available
                  for inter-institution sharing.
                </p>

                <button
                  type="button"
                  onClick={loadSharedEquipment}
                  className="shared-equipment-empty-button"
                >
                  Refresh
                </button>

              </div>

            ) : (

              /* GRID */

              <div className="shared-equipment-grid">

                {sharedEquipment.map((item, index) => {

                  const available = isAvailable(item);

                  return (

                    <div
                      className="shared-equipment-card"
                      key={
                        item.id ||
                        item.equipmentId ||
                        index
                      }
                    >

                      {/* CARD HEADER */}

                      <div className="shared-equipment-card-header">

                        <div className="shared-equipment-equipment-icon">
                          🔬
                        </div>

                        <span
                          className={
                            available
                              ? "shared-equipment-status shared-equipment-status-available"
                              : "shared-equipment-status shared-equipment-status-unavailable"
                          }
                        >
                          {available
                            ? "AVAILABLE"
                            : "UNAVAILABLE"}
                        </span>

                      </div>

                      {/* CONTENT */}

                      <div className="shared-equipment-card-content">

                        <h2>
                          {getEquipmentName(item)}
                        </h2>

                        <p className="shared-equipment-card-description">
                          {getDescription(item)}
                        </p>

                        <div className="shared-equipment-institution-details">

                          <div className="shared-equipment-institution-row">

                            <span>
                              Owning Institution
                            </span>

                            <strong>
                              {getOwnerInstitution(item)}
                            </strong>

                          </div>

                          <div className="shared-equipment-institution-row">

                            <span>
                              Shared With
                            </span>

                            <strong>
                              {getSharedInstitution(item)}
                            </strong>

                          </div>

                        </div>

                      </div>

                      {/* NOTES */}

                      {item.sharingNotes && (

                        <div className="shared-equipment-sharing-notes">

                          <span>
                            Sharing Note
                          </span>

                          <p>
                            {item.sharingNotes}
                          </p>

                        </div>

                      )}

                      {/* ACTION */}

                      <div className="shared-equipment-card-footer">

                        <button
                          type="button"
                          disabled={!available}
                          className={
                            available
                              ? "shared-equipment-request-button"
                              : "shared-equipment-request-button shared-equipment-request-button-disabled"
                          }
                          onClick={() =>
                            handleRequestAccess(item)
                          }
                        >

                          {available
                            ? "Request Access"
                            : "Currently Unavailable"}

                        </button>

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

          </div>

  );
}

export default SharedEquipment;