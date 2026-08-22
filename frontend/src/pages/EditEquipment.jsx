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


// ============================================================
// STATUS MAPPING
// ============================================================

function mapStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case "Available":
      return "AVAILABLE";

    case "Booked":
      return "IN_USE";

    case "Under maintenance":
      return "MAINTENANCE";

    case "Out of service":
      return "OUT_OF_SERVICE";

    case "Retired":
      return "RETIRED";

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

    case "OUT_OF_SERVICE":
      return "Out of service";

    case "RETIRED":
      return "Retired";

    default:
      return "Available";
  }
}


// ============================================================
// COMPONENT
// ============================================================

export default function EditEquipment() {

  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // RBAC
  // ==========================================================

  const userCanManageEquipment = canManageEquipment();

  // ==========================================================
  // STATE
  // ==========================================================

  const [form, setForm] = useState(null);

  const [status, setStatus] = useState("Available");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [manualFile, setManualFile] = useState(null);
  const [certFile, setCertFile] = useState(null);

  const [existingManual, setExistingManual] = useState(null);
  const [existingCert, setExistingCert] = useState(null);


  // ==========================================================
  // RBAC CHECK
  // ==========================================================

  useEffect(() => {

    if (!userCanManageEquipment) {

      alert(
        "You do not have permission to edit equipment."
      );

      navigate(`/equipment/${id}`);
    }

  }, [userCanManageEquipment, navigate, id]);


  // ==========================================================
  // LOAD EQUIPMENT
  // ==========================================================

  useEffect(() => {

    async function fetchEquipment() {

      try {

        const data = await getEquipmentById(id);

        console.log("Equipment loaded:", data);


        setForm({

          // ==================================================
          // BASIC INFORMATION
          // ==================================================

          equipmentName:
            data.equipmentName || "",

          category:
            data.category || "",

          assetId:
            data.assetTag || "",

          department:
            data.department || "",

          institution:
            data.institutionName || "",


          // ==================================================
          // SPECIFICATIONS
          // ==================================================

          manufacturer:
            data.manufacturer || "",

          modelNumber:
            data.model || "",

          notes:
            "",


          // ==================================================
          // HOURLY RATE
          // ==================================================

          hourlyRate:
            data.hourlyRate !== null &&
            data.hourlyRate !== undefined
              ? String(data.hourlyRate)
              : "",


          // ==================================================
          // CALIBRATION
          // ==================================================

          lastCalibrationDate:
            data.lastCalibrationDate || "",

          nextCalibrationDate:
            data.nextCalibrationDate ||
            data.calibrationDueDate ||
            "",


          // ==================================================
          // CERTIFICATION
          // ==================================================

          certificationDetails:
            data.certificationDetails || "",

          certificationExpiryDate:
            data.certificationExpiryDate || "",


          // ==================================================
          // IMAGE
          // ==================================================

          imageUrl:
            data.imageUrl || "",


          // ==================================================
          // PROCUREMENT
          // ==================================================

          supplier:
            data.supplier || "",

          purchaseDate:
            data.purchaseDate || "",

          purchaseCost:
            data.purchaseCost !== null &&
            data.purchaseCost !== undefined
              ? String(data.purchaseCost)
              : "",

        });


        // Set status

        setStatus(
          mapStatusToUI(data.status)
        );


        // Existing documents

        setExistingManual(
          data.manualDocument
        );

        setExistingCert(
          data.calibrationCertificate
        );

      }

      catch (err) {

        console.error(
          "Failed to load equipment:",
          err
        );

        alert(
          err.response?.data?.message ||
          "Failed to load equipment"
        );

        navigate("/equipment");

      }

      finally {

        setLoading(false);

      }

    }


    fetchEquipment();

  }, [id, navigate]);


  // ==========================================================
  // UPDATE FORM FIELD
  // ==========================================================

  function updateField(field, value) {

    setForm((prev) => ({

      ...prev,

      [field]: value,

    }));

  }


  // ==========================================================
  // SAVE EQUIPMENT
  // ==========================================================

  async function handleSave() {


    // ========================================================
    // RBAC SECURITY
    // ========================================================

    if (!userCanManageEquipment) {

      alert(
        "You do not have permission to update equipment."
      );

      return;
    }


    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (
      !form.equipmentName ||
      form.equipmentName.trim() === ""
    ) {

      alert(
        "Please enter Equipment Name."
      );

      return;
    }


    if (
      !form.assetId ||
      form.assetId.trim() === ""
    ) {

      alert(
        "Please enter Asset ID / tag."
      );

      return;
    }


    // ========================================================
    // HOURLY RATE VALIDATION
    // ========================================================

    if (
      form.hourlyRate !== "" &&
      form.hourlyRate !== null &&
      (
        isNaN(form.hourlyRate) ||
        Number(form.hourlyRate) < 0
      )
    ) {

      alert(
        "Please enter a valid hourly rate."
      );

      return;
    }


    // ========================================================
    // PURCHASE COST VALIDATION
    // ========================================================

    if (
      form.purchaseCost !== "" &&
      form.purchaseCost !== null &&
      (
        isNaN(form.purchaseCost) ||
        Number(form.purchaseCost) < 0
      )
    ) {

      alert(
        "Please enter a valid purchase cost."
      );

      return;
    }


    try {

      setSaving(true);


      // ======================================================
      // DOCUMENTS
      // ======================================================

      let manualFilename =
        existingManual;

      let certFilename =
        existingCert;


      // Upload new manual

      if (manualFile) {

        const uploaded =
          await uploadFile(manualFile);

        manualFilename =
          uploaded.filename;
      }


      // Upload new certificate

      if (certFile) {

        const uploaded =
          await uploadFile(certFile);

        certFilename =
          uploaded.filename;
      }


      // ======================================================
      // PAYLOAD
      // ======================================================

      const payload = {

        // ====================================================
        // BASIC INFORMATION
        // ====================================================

        equipmentName:
          form.equipmentName.trim(),

        assetTag:
          form.assetId.trim(),

        category:
          form.category,

        department:
          form.department,

        manufacturer:
          form.manufacturer,

        model:
          form.modelNumber,

        imageUrl:
          form.imageUrl || null,

        status:
          mapStatusToBackend(status),


        // ====================================================
        // HOURLY RATE
        // ====================================================

        hourlyRate:
          form.hourlyRate === "" ||
          form.hourlyRate === null
            ? null
            : Number(form.hourlyRate),


        // ====================================================
        // CALIBRATION
        // ====================================================

        calibrationDueDate:
          form.nextCalibrationDate ||
          null,

        lastCalibrationDate:
          form.lastCalibrationDate ||
          null,

        nextCalibrationDate:
          form.nextCalibrationDate ||
          null,


        // ====================================================
        // CERTIFICATION
        // ====================================================

        certificationDetails:
          form.certificationDetails ||
          null,

        certificationExpiryDate:
          form.certificationExpiryDate ||
          null,


        // ====================================================
        // DOCUMENTS
        // ====================================================

        manualDocument:
          manualFilename,

        calibrationCertificate:
          certFilename,


        // ====================================================
        // PROCUREMENT
        // ====================================================

        supplier:
          form.supplier &&
          form.supplier.trim() !== ""
            ? form.supplier.trim()
            : null,

        purchaseDate:
          form.purchaseDate ||
          null,

        purchaseCost:
          form.purchaseCost === "" ||
          form.purchaseCost === null
            ? null
            : Number(form.purchaseCost),

      };


      console.log(
        "Updating equipment with payload:",
        payload
      );


      // ======================================================
      // UPDATE BACKEND
      // ======================================================

      await updateEquipment(
        id,
        payload
      );


      alert(
        "Equipment updated successfully!"
      );


      navigate(
        `/equipment/${id}`
      );

    }

    catch (err) {

      console.error(
        "Update equipment error:",
        err
      );

      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update equipment."
      );

    }

    finally {

      setSaving(false);

    }

  }


  // ==========================================================
  // CLOSE
  // ==========================================================

  function handleClose() {

    if (
      window.confirm(
        "Discard changes?"
      )
    ) {

      navigate(
        `/equipment/${id}`
      );

    }

  }


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (
    loading ||
    !form
  ) {

    return (

      <div className="container">

        <aside className="sidebar">

          <Sidebar />

        </aside>


        <main className="main">

          <p>
            Loading equipment...
          </p>

        </main>

      </div>

    );

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="container">


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside className="sidebar">

        <Sidebar />

      </aside>


      {/* ====================================================
          MAIN
      ==================================================== */}

      <main className="main">


        {/* ==================================================
            HEADER
        ================================================== */}

        <header>

          <h2>
            Edit equipment
          </h2>


          <div className="right">

            <input
              type="text"
              placeholder="Search..."
            />


            <button
              className="profile-circle"
              onClick={() =>
                navigate("/profile")
              }
              title="My Profile"
              aria-label="My Profile"
            >
              👤
            </button>

          </div>

        </header>


        {/* ==================================================
            CARD
        ================================================== */}

        <div className="card">


          {/* CLOSE */}

          <button
            className="close-btn"
            onClick={handleClose}
          >
            ×
          </button>


          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="section">

            <h3>
              Basic info
            </h3>


            <div className="grid-3">


              {/* Equipment Name */}

              <div>

                <label>
                  Equipment name
                </label>

                <input
                  type="text"
                  value={
                    form.equipmentName
                  }
                  onChange={(e) =>
                    updateField(
                      "equipmentName",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Category */}

              <div>

                <label>
                  Category / type
                </label>

                <input
                  type="text"
                  value={
                    form.category
                  }
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Asset ID */}

              <div>

                <label>
                  Asset ID / tag
                </label>

                <input
                  type="text"
                  value={
                    form.assetId
                  }
                  onChange={(e) =>
                    updateField(
                      "assetId",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Department */}

              <div>

                <label>
                  Department
                </label>

                <input
                  type="text"
                  value={
                    form.department
                  }
                  onChange={(e) =>
                    updateField(
                      "department",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Hourly Rate */}

              <div>

                <label>
                  Hourly rate (₹ / hour)
                </label>

                <input
  type="number"
  min="0"
  step="0.01"
  className="equipment-form-input"
  placeholder="Enter hourly rate"
  value={form.hourlyRate}
  onChange={(e) =>
    updateField("hourlyRate", e.target.value)
  }
/>

              </div>


              {/* Image */}

              <div>

                <label>
                  Image URL
                </label>

                <input
                  type="text"
                  value={
                    form.imageUrl
                  }
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


          {/* =================================================
              SPECIFICATIONS
          ================================================= */}

          <div className="section">

            <h3>
              Specifications
            </h3>


            <div className="grid-3">


              {/* Manufacturer */}

              <div>

                <label>
                  Manufacturer
                </label>

                <input
                  type="text"
                  value={
                    form.manufacturer
                  }
                  onChange={(e) =>
                    updateField(
                      "manufacturer",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Model */}

              <div>

                <label>
                  Model number
                </label>

                <input
                  type="text"
                  value={
                    form.modelNumber
                  }
                  onChange={(e) =>
                    updateField(
                      "modelNumber",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Notes */}

              <div>

                <label>
                  Capacity / notes
                </label>

                <textarea
                  value={
                    form.notes
                  }
                  onChange={(e) =>
                    updateField(
                      "notes",
                      e.target.value
                    )
                  }
                />

              </div>


            </div>

          </div>


          {/* =================================================
              PROCUREMENT & COST
          ================================================= */}

          <div className="section">

            <h3>
              Procurement & Cost
            </h3>


            <div className="grid-3">


              {/* Supplier */}

              <div>

                <label>
                  Supplier
                </label>

                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={
                    form.supplier
                  }
                  onChange={(e) =>
                    updateField(
                      "supplier",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Purchase Date */}

              <div>

                <label>
                  Purchase date
                </label>

                <input
                  type="date"
                  className="date"
                  value={
                    form.purchaseDate
                  }
                  onChange={(e) =>
                    updateField(
                      "purchaseDate",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Purchase Cost */}

              <div>

                <label>
                  Purchase cost
                </label>

                <input
  type="number"
  min="0"
  step="0.01"
  className="equipment-form-input"
  placeholder="Enter purchase cost"
  value={form.purchaseCost}
  onChange={(e) =>
    updateField("purchaseCost", e.target.value)
  }
/>

              </div>


              {/* Hourly Rate - second display */}
              {/* 
                 Intentionally not repeated here.
                 Hourly rate is already shown under Basic Info.
              */}


            </div>

          </div>


          {/* =================================================
              STATUS
          ================================================= */}

          <div className="section">

            <h3>
              Status
            </h3>


            <div className="status">

              {statusOptions.map(
                (option) => (

                  <button
                    type="button"
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

                )
              )}

            </div>

            <small className="note">
              Select the current equipment status.
            </small>

          </div>


          {/* =================================================
              DOCUMENTS
          ================================================= */}

          <div className="section">

            <h3>
              Documents
            </h3>


            <div className="documents">


              {/* Manual */}

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
                      e.target.files[0] ||
                      null
                    )
                  }
                />

              </div>


              {/* Calibration Certificate */}

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
                      e.target.files[0] ||
                      null
                    )
                  }
                />

              </div>


            </div>

          </div>


          {/* =================================================
              CALIBRATION & CERTIFICATION
          ================================================= */}

          <div className="section">

            <h3>
              Calibration & certification
            </h3>


            <div className="grid-3">


              {/* Last Calibration */}

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


              {/* Next Calibration */}

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


              {/* Certification Expiry */}

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


              {/* Certification Details */}

              <div
                style={{
                  gridColumn:
                    "1 / -1",
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


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="buttons">


            <button
              className="cancel"
              onClick={handleClose}
              disabled={saving}
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