import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function MyAccessRequests() {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // USER ID
  // =========================================================

  const getUserId = () => {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {

      const user = JSON.parse(storedUser);

      return (
        user?.id ||
        user?.user?.id ||
        user?.userId ||
        null
      );

    } catch {

      return null;

    }
  };

  // =========================================================
  // LOAD
  // =========================================================

  const loadRequests = async () => {

    try {

      setLoading(true);
      setError("");

      const userId = getUserId();

      if (!userId) {

        setError(
          "Unable to identify the logged-in user."
        );

        return;
      }

      const response =
        await api.get(
          `/access-requests/user/${userId}`
        );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Access requests error:",
        err
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load access requests."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadRequests();

  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getEquipmentName = (request) => {

    return (
      request.sharedEquipment?.equipment?.name ||
      request.sharedEquipment?.equipmentName ||
      "Equipment"
    );

  };

  const getInstitutionName = (request) => {

    return (
      request.sharedEquipment
        ?.ownerInstitution?.name ||
      request.sharedEquipment
        ?.ownerInstitutionName ||
      "Unknown Institution"
    );

  };

  const getStatusClass = (status) => {

    const value =
      status?.toUpperCase();

    if (value === "APPROVED") {
      return "my-access-requests-status-approved";
    }

    if (value === "REJECTED") {
      return "my-access-requests-status-rejected";
    }

    return "my-access-requests-status-pending";

  };

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="app-layout">

      <Sidebar />

      <div className="main-area">

        <Topbar />

        <main className="main-content">

          <div className="my-access-requests-page">

            <div className="my-access-requests-header">

              <div>

                <h1>
                  My Access Requests
                </h1>

                <p>
                  Track your inter-institution equipment
                  access requests.
                </p>

              </div>

              <button
                type="button"
                className="my-access-requests-refresh-button"
                onClick={loadRequests}
              >
                ↻ Refresh
              </button>

            </div>

            {error && (

              <div className="my-access-requests-error">
                {error}
              </div>

            )}

            {loading ? (

              <div className="my-access-requests-loading">
                Loading your access requests...
              </div>

            ) : requests.length === 0 ? (

              <div className="my-access-requests-empty">

                <div>
                  📋
                </div>

                <h2>
                  No Access Requests
                </h2>

                <p>
                  You have not submitted any
                  equipment access requests yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/shared-equipment"
                    )
                  }
                >
                  Browse Shared Equipment
                </button>

              </div>

            ) : (

              <div className="my-access-requests-list">

                {requests.map((request) => (

                  <div
                    className="my-access-requests-card"
                    key={request.id}
                  >

                    <div className="my-access-requests-card-top">

                      <div>

                        <h2>
                          {getEquipmentName(request)}
                        </h2>

                        <p>
                          {getInstitutionName(request)}
                        </p>

                      </div>

                      <span
                        className={
                          `my-access-requests-status ` +
                          getStatusClass(
                            request.status
                          )
                        }
                      >
                        {request.status}
                      </span>

                    </div>

                    <div className="my-access-requests-details">

                      <div>

                        <span>
                          Requested
                        </span>

                        <strong>
                          {request.requestedAt
                            ? new Date(
                                request.requestedAt
                              ).toLocaleString()
                            : "-"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Response
                        </span>

                        <strong>
                          {request.respondedAt
                            ? new Date(
                                request.respondedAt
                              ).toLocaleString()
                            : "Pending"}
                        </strong>

                      </div>

                    </div>

                    {request.requestReason && (

                      <div className="my-access-requests-reason">

                        <span>
                          Request Reason
                        </span>

                        <p>
                          {request.requestReason}
                        </p>

                      </div>

                    )}

                    {request.adminResponse && (

                      <div className="my-access-requests-admin-response">

                        <span>
                          Admin Response
                        </span>

                        <p>
                          {request.adminResponse}
                        </p>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>

  );
}

export default MyAccessRequests;