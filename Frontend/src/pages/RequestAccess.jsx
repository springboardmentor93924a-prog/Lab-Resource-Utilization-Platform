import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";

import { useEffect, useState } from "react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function RequestAccess() {

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [sharedEquipment, setSharedEquipment] =
    useState(
      location.state?.sharedEquipment || null
    );

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [equipmentLoading, setEquipmentLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET USER
  // =========================================================

  const getLoggedInUserId = () => {

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

    } catch (err) {

      console.error(
        "Invalid user data:",
        err
      );

      return null;

    }
  };

  // =========================================================
  // LOAD SHARED EQUIPMENT
  // =========================================================

  useEffect(() => {

    if (!sharedEquipment && id) {
      loadSharedEquipment();
    }

  }, [id]);

  const loadSharedEquipment = async () => {

    try {

      setEquipmentLoading(true);
      setError("");

      const response =
        await api.get(
          `/shared-equipment/${id}`
        );

      setSharedEquipment(
        response.data
      );

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

    } finally {

      setEquipmentLoading(false);

    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getEquipmentName = () => {

    return (
      sharedEquipment?.equipmentName ||
      sharedEquipment?.equipment?.name ||
      sharedEquipment?.name ||
      "Equipment"
    );

  };

  const getOwnerInstitution = () => {

    return (
      sharedEquipment?.ownerInstitutionName ||
      sharedEquipment?.ownerInstitution?.name ||
      "Unknown Institution"
    );

  };

  const getSharedInstitution = () => {

    return (
      sharedEquipment?.sharedWithInstitutionName ||
      sharedEquipment?.sharedWithInstitution?.name ||
      "Unknown Institution"
    );

  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!sharedEquipment?.id) {

      setError(
        "Shared equipment information is missing."
      );

      return;
    }

    if (!reason.trim()) {

      setError(
        "Please enter a reason for requesting access."
      );

      return;
    }

    const userId =
      getLoggedInUserId();

    if (!userId) {

      setError(
        "Unable to identify the logged-in user. Please login again."
      );

      return;
    }

    try {

      setLoading(true);

      await api.post(
        "/access-requests",
        null,
        {
          params: {
            userId,
            sharedEquipmentId:
              sharedEquipment.id,
            requestReason:
              reason.trim()
          }
        }
      );

      setSuccess(
        "Access request submitted successfully. Your request is now PENDING."
      );

      setReason("");

      setTimeout(() => {

        navigate(
          "/my-access-requests"
        );

      }, 1200);

    } catch (err) {

      console.error(
        "Access request error:",
        err
      );

      const backendMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

      setError(
        backendMessage ||
        "Unable to submit access request."
      );

    } finally {

      setLoading(false);

    }
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

          <div className="request-access-page">

            {/* HEADER */}

            <div className="request-access-page-header">

              <div>

                <h1>
                  Request Equipment Access
                </h1>

                <p>
                  Submit a request to access equipment
                  shared by another institution.
                </p>

              </div>

              <button
                type="button"
                className="request-access-back-button"
                onClick={() =>
                  navigate(
                    "/shared-equipment"
                  )
                }
              >
                ← Back
              </button>

            </div>

            {/* ERROR */}

            {error && (

              <div className="request-access-error">
                {error}
              </div>

            )}

            {/* SUCCESS */}

            {success && (

              <div className="request-access-success">
                ✓ {success}
              </div>

            )}

            {/* LOADING */}

            {equipmentLoading ? (

              <div className="request-access-loading">
                Loading equipment details...
              </div>

            ) : sharedEquipment ? (

              <div className="request-access-layout">

                {/* EQUIPMENT */}

                <div className="request-access-equipment-card">

                  <div className="request-access-equipment-icon">
                    🔬
                  </div>

                  <h2>
                    {getEquipmentName()}
                  </h2>

                  {sharedEquipment.equipment?.assetTag && (

                    <p className="request-access-asset-tag">
                      Asset Tag:{" "}
                      {sharedEquipment.equipment.assetTag}
                    </p>

                  )}

                  <div className="request-access-equipment-details">

                    <div>

                      <span>
                        Owning Institution
                      </span>

                      <strong>
                        {getOwnerInstitution()}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Shared With
                      </span>

                      <strong>
                        {getSharedInstitution()}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Availability
                      </span>

                      <strong
                        className={
                          sharedEquipment.available
                            ? "request-access-available"
                            : "request-access-unavailable"
                        }
                      >
                        {sharedEquipment.available
                          ? "AVAILABLE"
                          : "UNAVAILABLE"}
                      </strong>

                    </div>

                  </div>

                  {sharedEquipment.sharingNotes && (

                    <div className="request-access-sharing-notes">

                      <span>
                        Sharing Notes
                      </span>

                      <p>
                        {sharedEquipment.sharingNotes}
                      </p>

                    </div>

                  )}

                </div>

                {/* FORM */}

                <div className="request-access-form-card">

                  <h2>
                    Access Request
                  </h2>

                  <p className="request-access-form-description">
                    Explain why you need access to this
                    equipment. A Lab Manager or Admin will
                    review your request.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                  >

                    <div className="request-access-form-group">

                      <label htmlFor="request-reason">
                        Reason for Access
                        <span>*</span>
                      </label>

                      <textarea
                        id="request-reason"
                        value={reason}
                        onChange={(event) =>
                          setReason(
                            event.target.value
                          )
                        }
                        placeholder="Explain why you need access to this equipment..."
                        rows="6"
                        maxLength="1000"
                        required
                      />

                      <small>
                        {reason.length}/1000 characters
                      </small>

                    </div>

                    <div className="request-access-pending-info">

                      <div className="request-access-pending-icon">
                        ⏳
                      </div>

                      <div>

                        <strong>
                          Request Status: PENDING
                        </strong>

                        <p>
                          Your request will be sent to the
                          Lab Manager or Admin for approval.
                        </p>

                      </div>

                    </div>

                    <div className="request-access-form-actions">

                      <button
                        type="button"
                        className="request-access-cancel-button"
                        onClick={() =>
                          navigate(
                            "/shared-equipment"
                          )
                        }
                        disabled={loading}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="request-access-submit-button"
                        disabled={
                          loading ||
                          !reason.trim() ||
                          !sharedEquipment?.available
                        }
                      >
                        {loading
                          ? "Submitting..."
                          : "Submit Access Request"}
                      </button>

                    </div>

                  </form>

                </div>

              </div>

            ) : (

              <div className="request-access-no-equipment">

                <div>
                  ⚠
                </div>

                <h2>
                  Equipment Not Found
                </h2>

                <p>
                  The shared equipment could not be
                  found or is no longer available.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/shared-equipment"
                    )
                  }
                >
                  View Shared Equipment
                </button>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>

  );
}

export default RequestAccess;