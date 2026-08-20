import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddEquipment.css";
import {
  getEquipmentById,
  updateEquipment,
} from "../services/equipmentService";
import { canManageEquipment } from "../utils/auth";
import { uploadFile } from "../services/fileService";

const statusOptions = [
  "Available",
  "Booked",
  "Under maintenance",
  "Out of service",
  "Retired",
];

function mapStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case "Available":
      return "AVAILABLE";

    case "Booked":
      return "IN_USE";

    case "Under maintenance":
      return "MAINTENANCE";

    case "Out of service":
      return "MAINTENANCE";

    case "Retired":
      return "MAINTENANCE";

    default:
      return "AVAILABLE";
  }
}

function mapStatusToUI(backendStatus) {
  switch (backendStatus) {
    case "AVAILABLE":
      return "Available";

    case "IN_USE":
      return "Booked";

    case "MAINTENANCE":
      return "Under maintenance";

    default:
      return "Available";
  }
}

export default function EditEquipment() {

  const { id } = useParams();
  const navigate = useNavigate();

  // ==============================
  // RBAC CHECK
  // ==============================

  const userCanManageEquipment = canManageEquipment();

  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("Available");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [manualFile, setManualFile] = useState(null);
  const [certFile, setCertFile] = useState(null);

  const [existingManual, setExistingManual] = useState(null);
  const [existingCert, setExistingCert] = useState(null);
  useEffect(() => {

  if (!userCanManageEquipment) {

    alert(
      "You do not have permission to edit equipment."
    );

    navigate(`/equipment/${id}`);

  }

}, [userCanManageEquipment, navigate, id]);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await getEquipmentById(id);

        setForm({
          equipmentName: data.equipmentName || "",
          category: data.category || "",
          assetId: data.assetTag || "",
          department: data.department || "",

          institution: "",

          manufacturer: data.manufacturer || "",
          modelNumber: data.model || "",

          // ==============================
          // HOURLY RATE
          // ==============================
          hourlyRate:
            data.hourlyRate !== null &&
            data.hourlyRate !== undefined
              ? String(data.hourlyRate)
              : "",

          notes: "",

          // ==============================
          // CALIBRATION
          // ==============================
          lastCalibrationDate:
            data.lastCalibrationDate || "",

          nextCalibrationDate:
            data.nextCalibrationDate ||
            data.calibrationDueDate ||
            "",

          // ==============================
          // CERTIFICATION
          // ==============================
          certificationDetails:
            data.certificationDetails || "",

          certificationExpiryDate:
            data.certificationExpiryDate || "",

          // ==============================
          // IMAGE
          // ==============================
          imageUrl: data.imageUrl || "",
        });

        setStatus(mapStatusToUI(data.status));

        setExistingManual(data.manualDocument);
        setExistingCert(data.calibrationCertificate);
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "Failed to load equipment"
        );

        navigate("/equipment");
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, [id, navigate]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {

    // ==============================
  // RBAC SECURITY CHECK
  // ==============================

  if (!userCanManageEquipment) {

    alert(
      "You do not have permission to update equipment."
    );

    return;
  }
    // ==============================
    // BASIC VALIDATION
    // ==============================

    if (form.equipmentName.trim() === "") {
      alert("Please enter Equipment Name.");
      return;
    }

    if (form.assetId.trim() === "") {
      alert("Please enter Asset ID / tag.");
      return;
    }

    // ==============================
    // HOURLY RATE VALIDATION
    // ==============================

    if (
      form.hourlyRate !== "" &&
      (isNaN(form.hourlyRate) ||
        Number(form.hourlyRate) < 0)
    ) {
      alert("Please enter a valid hourly rate.");
      return;
    }

    try {
      setSaving(true);

      // ==============================
      // DOCUMENTS
      // ==============================

      let manualFilename = existingManual;
      let certFilename = existingCert;

      if (manualFile) {
        const uploaded = await uploadFile(manualFile);
        manualFilename = uploaded.filename;
      }

      if (certFile) {
        const uploaded = await uploadFile(certFile);
        certFilename = uploaded.filename;
      }

      // ==============================
      // PAYLOAD
      // ==============================

      const payload = {
        equipmentName: form.equipmentName,

        assetTag: form.assetId,

        category: form.category,

        department: form.department,

        manufacturer: form.manufacturer,

        model: form.modelNumber,

        imageUrl: form.imageUrl || null,

        status: mapStatusToBackend(status),

        // ==============================
        // HOURLY RATE
        // ==============================
        hourlyRate:
          form.hourlyRate === "" ||
          form.hourlyRate === null
            ? null
            : Number(form.hourlyRate),

        // ==============================
        // CALIBRATION
        // ==============================

        calibrationDueDate:
          form.nextCalibrationDate || null,

        lastCalibrationDate:
          form.lastCalibrationDate || null,

        nextCalibrationDate:
          form.nextCalibrationDate || null,

        // ==============================
        // CERTIFICATION
        // ==============================

        certificationDetails:
          form.certificationDetails || null,

        certificationExpiryDate:
          form.certificationExpiryDate || null,

        // ==============================
        // DOCUMENTS
        // ==============================

        manualDocument: manualFilename,

        calibrationCertificate: certFilename,
      };

      console.log(
        "Updating equipment with payload:",
        payload
      );

      await updateEquipment(id, payload);

      alert("Equipment updated successfully!");

      navigate(`/equipment/${id}`);
    } catch (err) {
      console.error("Update equipment error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update equipment."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (window.confirm("Discard changes?")) {
      navigate(`/equipment/${id}`);
    }
  }

  if (loading || !form) {
    return (
      <div className="container">
        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main className="main">
          <p>Loading equipment...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="main">

        {/* ==============================
            HEADER
        ============================== */}

        <header>
          <h2>Edit equipment</h2>

          <div className="right">
            <input
              type="text"
              placeholder="Search..."
            />

            <div className="profile">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
        </header>

        <div className="card">

          <button
            className="close-btn"
            onClick={handleClose}
          >
            ×
          </button>

          {/* ==============================
              BASIC INFO
          ============================== */}

          <div className="section">
            <h3>Basic info</h3>

            <div className="grid-3">

              <div>
                <label>Equipment name</label>

                <input
                  type="text"
                  value={form.equipmentName}
                  onChange={(e) =>
                    updateField(
                      "equipmentName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Category / type</label>

                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Asset ID / tag</label>

                <input
                  type="text"
                  value={form.assetId}
                  onChange={(e) =>
                    updateField(
                      "assetId",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Department</label>

                <input
                  type="text"
                  value={form.department}
                  onChange={(e) =>
                    updateField(
                      "department",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* ==============================
                  HOURLY RATE
              ============================== */}

              <div>
                <label>Hourly rate (₹ / hour)</label>

                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter hourly rate"
                  value={form.hourlyRate}
                  onChange={(e) =>
                    updateField(
                      "hourlyRate",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "48px",
                    padding: "12px 14px",
                    background: "#071d35",
                    border: "1px solid #2a537d",
                    borderRadius: "7px",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label>Image URL</label>

                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) =>
                    updateField(
                      "imageUrl",
                      e.target.value
                    )
                  }
                />
              </div>

            </div>
          </div>

          {/* ==============================
              SPECIFICATIONS
          ============================== */}

          <div className="section">
            <h3>Specifications</h3>

            <div className="grid-3">

              <div>
                <label>Manufacturer</label>

                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(e) =>
                    updateField(
                      "manufacturer",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Model number</label>

                <input
                  type="text"
                  value={form.modelNumber}
                  onChange={(e) =>
                    updateField(
                      "modelNumber",
                      e.target.value
                    )
                  }
                />
              </div>

            </div>
          </div>

          {/* ==============================
              STATUS
          ============================== */}

          <div className="section">
            <h3>Status</h3>

            <div className="status">

              {statusOptions.map((option) => (
                <button
                  key={option}
                  className={`pill ${
                    status === option
                      ? "active-status"
                      : ""
                  }`}
                  onClick={() =>
                    setStatus(option)
                  }
                >
                  {option}
                </button>
              ))}

            </div>
          </div>

          {/* ==============================
              DOCUMENTS
          ============================== */}

          <div className="section">
            <h3>Documents</h3>

            <div className="documents">

              <div className="upload-box">

                <i className="fa-solid fa-cloud-arrow-up"></i>

                <p>
                  {manualFile
                    ? manualFile.name
                    : existingManual ||
                      "Upload manual (PDF)"}
                </p>

                <input
                  type="file"
                  onChange={(e) =>
                    setManualFile(
                      e.target.files[0] || null
                    )
                  }
                />

              </div>

              <div className="upload-box">

                <i className="fa-solid fa-cloud-arrow-up"></i>

                <p>
                  {certFile
                    ? certFile.name
                    : existingCert ||
                      "Upload calibration certificate"}
                </p>

                <input
                  type="file"
                  onChange={(e) =>
                    setCertFile(
                      e.target.files[0] || null
                    )
                  }
                />

              </div>

            </div>
          </div>

          {/* ==============================
              CALIBRATION & CERTIFICATION
          ============================== */}

          <div className="section">
            <h3>
              Calibration & certification
            </h3>

            <div className="grid-3">

              <div>
                <label>
                  Last calibration date
                </label>

                <input
                  type="date"
                  className="date"
                  value={
                    form.lastCalibrationDate
                  }
                  onChange={(e) =>
                    updateField(
                      "lastCalibrationDate",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>
                  Next calibration date
                </label>

                <input
                  type="date"
                  className="date"
                  value={
                    form.nextCalibrationDate
                  }
                  onChange={(e) =>
                    updateField(
                      "nextCalibrationDate",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>
                  Certification expiry date
                </label>

                <input
                  type="date"
                  className="date"
                  value={
                    form.certificationExpiryDate
                  }
                  onChange={(e) =>
                    updateField(
                      "certificationExpiryDate",
                      e.target.value
                    )
                  }
                />
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label>
                  Certification details
                </label>

                <textarea
                  value={
                    form.certificationDetails
                  }
                  onChange={(e) =>
                    updateField(
                      "certificationDetails",
                      e.target.value
                    )
                  }
                  placeholder="Enter certificate number, issuing authority, certification type, etc."
                  rows={3}
                />
              </div>

            </div>
          </div>

          {/* ==============================
              BUTTONS
          ============================== */}

          <div className="buttons">

            <button
              className="cancel"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              className="save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>

          </div>

        </div>
      </main>
    </div>
  );
}