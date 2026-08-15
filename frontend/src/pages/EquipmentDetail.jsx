import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./EquipmentDetail.css";
import {
  getEquipmentById,
  deleteEquipment,
} from "../services/equipmentService";
import { getBookingsByEquipment } from "../services/bookingService";
import { isAdmin } from "../utils/auth";
import { downloadFileAsBlob } from "../services/fileService";

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userIsAdmin = isAdmin();

  // ================= FETCH EQUIPMENT =================

  useEffect(() => {
    async function fetchData() {
      try {
        const equipmentData = await getEquipmentById(id);
        setEquipment(equipmentData);

        try {
          const bookings = await getBookingsByEquipment(id);
          setBookingHistory(bookings);
        } catch {
          setBookingHistory([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load equipment details"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // ================= BOOK EQUIPMENT =================

  function handleBook() {
    navigate(`/bookings?equipmentId=${id}`);
  }

  // ================= DELETE EQUIPMENT =================

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${equipment.equipmentName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteEquipment(id);

      alert("Equipment deleted successfully.");

      navigate("/equipment");
    } catch (err) {
      if (err.response?.status === 409) {
        alert(
          "Cannot delete: this equipment has existing bookings."
        );
      } else {
        alert(
          err.response?.data?.message ||
            "Failed to delete equipment."
        );
      }
    }
  }

  // ================= EDIT EQUIPMENT =================

  function handleEdit() {
    navigate(`/equipment/${id}/edit`);
  }

  // ================= OPEN DOCUMENT =================
  /*
   * The browser may block window.open() if it is called
   * after an asynchronous request.
   *
   * Therefore, we open a blank tab immediately when the
   * user clicks the document and then load the Blob URL
   * into that tab after the API request finishes.
   */

  async function handleDownload(fileName) {
    if (!fileName) {
      alert("Document is not available.");
      return;
    }

    // Open tab immediately because this is directly triggered
    // by the user's click.
    const newTab = window.open("", "_blank");

    if (!newTab) {
      alert(
        "Please allow pop-ups for this site to open documents."
      );
      return;
    }

    try {
      console.log("Opening document:", fileName);

      // Download authenticated file from backend
      const blobUrl = await downloadFileAsBlob(fileName);

      // Load PDF into the already-open tab
      newTab.location.href = blobUrl;

      /*
       * Keep the Blob URL alive for some time so the browser
       * has enough time to load the PDF.
       */
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);

    } catch (err) {
      console.error("Document error:", err);

      // Close blank tab if download failed
      newTab.close();

      if (err.response?.status === 403) {
        alert(
          "You do not have permission to access this document."
        );
      } else if (err.response?.status === 404) {
        alert(
          "This document was not found on the server."
        );
      } else {
        alert(
          err.response?.data?.message ||
            `Failed to open document: ${fileName}`
        );
      }
    }
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="wrapper">

        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main className="content">
          <p>Loading equipment details...</p>
        </main>

      </div>
    );
  }

  // ================= ERROR =================

  if (error || !equipment) {
    return (
      <div className="wrapper">

        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main className="content">
          <p style={{ color: "red" }}>
            {error || "Equipment not found"}
          </p>
        </main>

      </div>
    );
  }

  // ================= EQUIPMENT SPECS =================

  const specs = [
    {
      label: "Asset tag",
      value: equipment.assetTag,
    },
    {
      label: "Category",
      value: equipment.category,
    },
    {
      label: "Department",
      value: equipment.department,
    },
    {
      label: "Manufacturer",
      value: equipment.manufacturer,
    },
    {
      label: "Model",
      value: equipment.model,
    },
    {
      label: "Calibration due",
      value: equipment.calibrationDueDate,
    },
  ];

  // ================= DOCUMENTS =================

  /*
   * Keep the actual stored filename.
   *
   * Example:
   * manualDocument = "a7d92b1e-....pdf"
   *
   * This filename is what the backend expects.
   */

  const documents = [
    equipment.manualDocument
      ? {
          name: "Manual",
          fileName: equipment.manualDocument,
        }
      : null,

    equipment.calibrationCertificate
      ? {
          name: "Calibration certificate",
          fileName: equipment.calibrationCertificate,
        }
      : null,

  ].filter(Boolean);

  // ================= PAGE =================

  return (
    <div className="wrapper">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="content">

        {/* ================= TOP BAR ================= */}

        <div className="topbar">

          <h4>Equipment detail</h4>

          <div className="right">

            {/* SEARCH */}

            <input
              type="text"
              className="form-control search"
              placeholder="Search..."
            />

            {/* NOTIFICATION */}

            <button
              className="notification-button"
              onClick={() => navigate("/notifications")}
              title="Notifications"
              aria-label="Notifications"
            >
              <i className="bi bi-bell"></i>
            </button>

            {/* PROFILE */}

            <button
              className="profile"
              onClick={() => navigate("/profile")}
              title="My Profile"
              aria-label="My Profile"
            >
              👤
            </button>

          </div>

        </div>

        {/* ================= EQUIPMENT SECTION ================= */}

        <section className="equipment-section">

          {/* IMAGE */}

          <div className="image-box">

            <img
              src={equipment.imageUrl}
              alt={equipment.equipmentName}
            />

          </div>

          {/* DETAILS */}

          <div className="details">

            <h2>{equipment.equipmentName}</h2>

            <span className="badge bg-success rounded-pill status">
              {equipment.status}
            </span>

            <table className="table">

              <tbody>

                {specs.map((spec) => (
                  <tr key={spec.label}>

                    <td>{spec.label}</td>

                    <td>
                      {spec.value || "—"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* ================= DOCUMENTS ================= */}

        <div className="documents">

          <div className="doc-left">

            <h5>Documents</h5>

            <div className="files">

              {documents.length === 0 && (
                <p>No documents uploaded.</p>
              )}

              {documents.map((doc) => (

                <div
                  className="file"
                  key={doc.fileName}
                  onClick={() =>
                    handleDownload(doc.fileName)
                  }
                  title="Click to open document"
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <i
                    className="fa-solid fa-file-pdf"
                    style={{
                      marginRight: "8px",
                    }}
                  ></i>

                  {doc.name}

                </div>

              ))}

            </div>

          </div>

          {/* ================= ACTION BUTTONS ================= */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >

            {/* BOOK */}

            <button
              className="btn btn-dark book-btn"
              onClick={handleBook}
            >
              Book this equipment
            </button>

            {/* ADMIN ACTIONS */}

            {userIsAdmin && (
              <>

                <button
                  className="btn btn-outline-dark"
                  onClick={handleEdit}
                >
                  Edit
                </button>

                <button
                  className="btn btn-outline-dark"
                  onClick={handleDelete}
                >
                  Delete
                </button>

              </>
            )}

          </div>

        </div>

        {/* ================= BOOKING HISTORY ================= */}

        <div className="history">

          <h5>Booking history</h5>

          <div className="history-box">

            {bookingHistory.length === 0 && (
              <p>No bookings yet.</p>
            )}

            {bookingHistory.map((b) => (

              <div
                className="row-item"
                key={b.id}
              >

                <span>
                  {b.userFullName} — {b.bookingDate},{" "}
                  {b.startTime}-{b.endTime}
                </span>

                <span className="badge bg-secondary rounded-pill">
                  {b.bookingStatus}
                </span>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>
  );
}