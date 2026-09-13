import { useEffect, useState } from "react";

import api from "../services/api";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

function AccessRequests() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD PENDING REQUESTS
  // =========================================================

  const loadRequests = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/access-requests/pending"
        );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(err);

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
  // EQUIPMENT
  // =========================================================

  const getEquipmentName = (request) => {

    return (
      request.sharedEquipment?.equipment?.name ||
      request.sharedEquipment?.equipmentName ||
      "Equipment"
    );

  };

  // =========================================================
  // USER
  // =========================================================

  const getUserName = (request) => {

    const user =
      request.user;

    if (!user) {
      return "Unknown User";
    }

    return (
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      user.email ||
      "User"
    );

  };

  // =========================================================
  // APPROVE
  // =========================================================

  const approveRequest = async (id) => {

    try {

      setError("");
      setSuccess("");

      await api.put(
        `/access-requests/${id}/approve`
      );

      setSuccess(
        "Access request approved successfully."
      );

      await loadRequests();

    } catch (err) {

      console.error(err);

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to approve request."
      );

    }

  };

  // =========================================================
  // REJECT
  // =========================================================

  const rejectRequest = async (id) => {

    const response =
      window.prompt(
        "Enter rejection reason:"
      );

    if (response === null) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      await api.put(
        `/access-requests/${id}/reject`,
        null,
        {
          params: {
            adminResponse:
              response.trim()
          }
        }
      );

      setSuccess(
        "Access request rejected."
      );

      await loadRequests();

    } catch (err) {

      console.error(err);

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to reject request."
      );

    }

  };

  // =========================================================
  // PAGE
  // =========================================================

  return (

    // <div className="app-layout">

    //   <Sidebar />

    //   <div className="main-area">

    //     <Topbar />

        <main className="main-content">

          <div className="access-requests-admin-page">

            <div className="access-requests-admin-header">

              <div>

                <h1>
                  Access Requests
                </h1>

                <p>
                  Review and manage inter-institution
                  equipment access requests.
                </p>

              </div>

              <button
                type="button"
                className="access-requests-admin-refresh"
                onClick={loadRequests}
              >
                ↻ Refresh
              </button>

            </div>

            {error && (

              <div className="access-requests-admin-error">
                {error}
              </div>

            )}

            {success && (

              <div className="access-requests-admin-success">
                ✓ {success}
              </div>

            )}

            {loading ? (

              <div className="access-requests-admin-loading">
                Loading access requests...
              </div>

            ) : requests.length === 0 ? (

              <div className="access-requests-admin-empty">

                <div>
                  ✓
                </div>

                <h2>
                  No Pending Requests
                </h2>

                <p>
                  There are currently no access requests
                  waiting for approval.
                </p>

              </div>

            ) : (

              <div className="access-requests-admin-list">

                {requests.map((request) => (

                  <div
                    className="access-requests-admin-card"
                    key={request.id}
                  >

                    <div className="access-requests-admin-card-header">

                      <div>

                        <h2>
                          {getEquipmentName(request)}
                        </h2>

                        <p>
                          Requested by{" "}
                          <strong>
                            {getUserName(request)}
                          </strong>
                        </p>

                      </div>

                      <span className="access-requests-admin-pending">
                        PENDING
                      </span>

                    </div>

                    <div className="access-requests-admin-details">

                      <div>

                        <span>
                          Institution
                        </span>

                        <strong>
                          {request.sharedEquipment
                            ?.sharedWithInstitution?.name ||
                            request.sharedEquipment
                              ?.sharedWithInstitutionName ||
                            "-"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Requested At
                        </span>

                        <strong>
                          {request.requestedAt
                            ? new Date(
                                request.requestedAt
                              ).toLocaleString()
                            : "-"}
                        </strong>

                      </div>

                    </div>

                    {request.requestReason && (

                      <div className="access-requests-admin-reason">

                        <span>
                          Request Reason
                        </span>

                        <p>
                          {request.requestReason}
                        </p>

                      </div>

                    )}

                    <div className="access-requests-admin-actions">

                      <button
                        type="button"
                        className="access-requests-admin-reject"
                        onClick={() =>
                          rejectRequest(
                            request.id
                          )
                        }
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        className="access-requests-admin-approve"
                        onClick={() =>
                          approveRequest(
                            request.id
                          )
                        }
                      >
                        ✓ Approve
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </main>

    //   </div>

    // </div>

  );
}

export default AccessRequests;