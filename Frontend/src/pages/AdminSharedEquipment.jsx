import { useEffect, useState } from "react";

import api from "../services/api";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

function AdminSharedEquipment() {

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEquipment = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get("/shared-equipment");

      setEquipment(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(err);

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load shared equipment."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadEquipment();

  }, []);

  const getEquipmentName = (item) => {

    return (
      item.equipment?.name ||
      item.equipmentName ||
      "Equipment"
    );

  };

  return (

    // <div className="app-layout">

    //   <Sidebar />

    //   <div className="main-area">

    //     <Topbar />

        <main className="main-content">

          <div className="admin-shared-equipment-page">

            <div className="admin-shared-equipment-header">

              <div>

                <h1>
                  Shared Equipment Management
                </h1>

                <p>
                  Manage equipment shared with
                  other institutions.
                </p>

              </div>

              <button
                type="button"
                className="admin-shared-equipment-refresh"
                onClick={loadEquipment}
              >
                ↻ Refresh
              </button>

            </div>

            {error && (

              <div className="admin-shared-equipment-error">
                {error}
              </div>

            )}

            {loading ? (

              <div className="admin-shared-equipment-loading">
                Loading shared equipment...
              </div>

            ) : equipment.length === 0 ? (

              <div className="admin-shared-equipment-empty">

                <div>
                  🔬
                </div>

                <h2>
                  No Shared Equipment
                </h2>

                <p>
                  No shared equipment records
                  are currently available.
                </p>

              </div>

            ) : (

              <div className="admin-shared-equipment-table-wrapper">

                <table className="admin-shared-equipment-table">

                  <thead>

                    <tr>

                      <th>
                        Equipment
                      </th>

                      <th>
                        Owner Institution
                      </th>

                      <th>
                        Shared With
                      </th>

                      <th>
                        Availability
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {equipment.map((item) => (

                      <tr key={item.id}>

                        <td>

                          <strong>
                            {getEquipmentName(item)}
                          </strong>

                        </td>

                        <td>
                          {item.ownerInstitution?.name ||
                            item.ownerInstitutionName ||
                            "-"}
                        </td>

                        <td>
                          {item.sharedWithInstitution?.name ||
                            item.sharedWithInstitutionName ||
                            "-"}
                        </td>

                        <td>

                          <span
                            className={
                              item.available
                                ? "admin-shared-equipment-available"
                                : "admin-shared-equipment-unavailable"
                            }
                          >
                            {item.available
                              ? "Available"
                              : "Unavailable"}
                          </span>

                        </td>

                        <td>

                          <span className="admin-shared-equipment-status">

                            {item.sharingStatus ||
                              "ACTIVE"}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

    //   </div>

    // </div>

  );
}

export default AdminSharedEquipment;