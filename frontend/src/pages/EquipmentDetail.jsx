import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./EquipmentDetail.css";
import { getEquipmentById, deleteEquipment } from "../services/equipmentService";
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
        setError(err.response?.data?.message || "Failed to load equipment details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleBook() {
    navigate(`/bookings?equipmentId=${id}`);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${equipment.equipmentName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteEquipment(id);
      alert("Equipment deleted successfully.");
      navigate("/equipment");
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Cannot delete: this equipment has existing bookings.");
      } else {
        alert(err.response?.data?.message || "Failed to delete equipment.");
      }
    }
  }

  function handleEdit() {
    navigate(`/equipment/${id}/edit`);
  }

  async function handleDownload(fileName) {
  try {
    const blobUrl = await downloadFileAsBlob(fileName);
    window.open(blobUrl, "_blank");
  } catch {
    alert("Failed to open document. It may not exist or you may not have access.");
  }
}

  if (loading) {
    return (
      <div className="wrapper equipment-detail-page">
        <aside className="sidebar">
          <Sidebar />
        </aside>
        <main className="content">
          <p>Loading equipment details...</p>
        </main>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="wrapper equipment-detail-page">
        <aside className="sidebar">
          <Sidebar />
        </aside>
        <main className="content">
          <p style={{ color: "red" }}>{error || "Equipment not found"}</p>
        </main>
      </div>
    );
  }

  const specs = [
    { label: "Asset tag", value: equipment.assetTag },
    { label: "Category", value: equipment.category?.categoryName },
    { label: "Department", value: equipment.department?.departmentName },
    { label: "Manufacturer", value: equipment.manufacturer },
    { label: "Model", value: equipment.model },
    { label: "Calibration due", value: equipment.calibrationDueDate },
  ];

  const documents = [equipment.manualDocument, equipment.calibrationCertificate].filter(Boolean);

  return (
    <div className="wrapper equipment-detail-page">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="content">
        <div className="topbar rd-topbar-fix">
          <h4>Equipment detail</h4>
          <div className="right">
            <input type="text" className="form-control search" placeholder="Search..." />
            <div
  className="profile"
  onClick={() => navigate("/profile")}
  title="My Profile"
>
  👤
</div>
          </div>
        </div>

        <section className="equipment-section">
          <div className="image-box">
            <img src={equipment.imageUrl} alt={equipment.equipmentName} />
          </div>

          <div className="details">
            <h2>{equipment.equipmentName}</h2>
            <span className="badge bg-success rounded-pill status">{equipment.status}</span>

            <table className="table">
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label}>
                    <td>{spec.label}</td>
                    <td>{spec.value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="documents">
          <div className="doc-left">
            <h5>Documents</h5>
            <div className="files">
              {documents.length === 0 && <p>No documents uploaded.</p>}
              {documents.map((doc) => (
                <div className="file" key={doc} onClick={() => handleDownload(doc)}>
                  {doc}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-dark book-btn" onClick={handleBook}>
              Book this equipment
            </button>
            {userIsAdmin && (
              <>
                <button className="btn btn-outline-dark" onClick={handleEdit}>
                  Edit
                </button>
                <button className="btn btn-outline-dark" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="history">
          <h5>Booking history</h5>
          <div className="history-box">
            {bookingHistory.length === 0 && <p>No bookings yet.</p>}
            {bookingHistory.map((b) => (
              <div className="row-item" key={b.id}>
                <span>{b.userFullName} — {b.bookingDate}, {b.startTime}-{b.endTime}</span>
                <span className="badge bg-secondary rounded-pill">{b.bookingStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
