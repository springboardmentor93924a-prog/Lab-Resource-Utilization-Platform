import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddEquipment.css";
import { getEquipmentById, updateEquipment } from "../services/equipmentService";
import { uploadFile } from "../services/fileService";


const statusOptions = ["Available", "Booked", "Under maintenance", "Out of service", "Retired"];

function mapStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case "Available":
      return "AVAILABLE";
    case "Booked":
      return "IN_USE";
    case "Under maintenance":
      return "MAINTENANCE";
    default:
      return "MAINTENANCE";
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
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("Available");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manualFile, setManualFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [existingManual, setExistingManual] = useState(null);
  const [existingCert, setExistingCert] = useState(null);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await getEquipmentById(id);
        setForm({
          equipmentName: data.name || "",
          category: data.category?.categoryName || "",
            categoryId: data.category?.categoryId || null,
          assetId: data.assetTag || "",
          department: data.department?.departmentName || "",
            departmentId: data.department?.departmentId || null,
          institution: "",
          manufacturer: data.manufacturer || "",
          modelNumber: data.model || "",
          notes: "",
          calibrationDate: data.calibrationDueDate || "",
          imageUrl: data.imageUrl || "",
        });
        setStatus(mapStatusToUI(data.status));
        setExistingManual(data.manualDocument);
        setExistingCert(data.calibrationCertificate);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load equipment");
        navigate("/equipment");
      } finally {
        setLoading(false);
      }
    }
    fetchEquipment();
  }, [id, navigate]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
  if (form.equipmentName.trim() === "") {
    alert("Please enter Equipment Name.");
    return;
  }
  if (form.assetId.trim() === "") {
    alert("Please enter Asset ID / tag.");
    return;
  }

  try {
    setSaving(true);

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

    const payload = {
      equipmentName: form.equipmentName,
      assetTag: form.assetId,
      category: { categoryId: form.categoryId },
        department: { departmentId: form.departmentId },
      manufacturer: form.manufacturer,
      model: form.modelNumber,
      imageUrl: form.imageUrl,
      status: mapStatusToBackend(status),
      calibrationDueDate: form.calibrationDate || null,
      manualDocument: manualFilename,
      calibrationCertificate: certFilename,
    };

    await updateEquipment(id, payload);
    alert("Equipment updated successfully!");
    navigate(`/equipment/${id}`);
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update equipment.");
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
        <header>
          <h2>Edit equipment</h2>
          <div className="right">
            <input type="text" placeholder="Search..." />
            <div className="profile">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
        </header>

        <div className="card">
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>

          <div className="section">
            <h3>Basic info</h3>
            <div className="grid-3">
              <div>
                <label>Equipment name</label>
                <input type="text" value={form.equipmentName} onChange={(e) => updateField("equipmentName", e.target.value)} />
              </div>
              <div>
                <label>Category / type</label>
                <input type="text" value={form.category} onChange={(e) => updateField("category", e.target.value)} />
              </div>
              <div>
                <label>Asset ID / tag</label>
                <input type="text" value={form.assetId} onChange={(e) => updateField("assetId", e.target.value)} />
              </div>
              <div>
                <label>Department</label>
                <input type="text" value={form.department} onChange={(e) => updateField("department", e.target.value)} />
              </div>
              <div>
                <label>Image URL</label>
                <input type="text" value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Specifications</h3>
            <div className="grid-3">
              <div>
                <label>Manufacturer</label>
                <input type="text" value={form.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
              </div>
              <div>
                <label>Model number</label>
                <input type="text" value={form.modelNumber} onChange={(e) => updateField("modelNumber", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Status</h3>
            <div className="status">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  className={`pill ${status === option ? "active-status" : ""}`}
                  onClick={() => setStatus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="section">
  <h3>Documents</h3>
  <div className="documents">
    <div className="upload-box">
      <i className="fa-solid fa-cloud-arrow-up"></i>
      <p>{manualFile ? manualFile.name : existingManual || "Upload manual (PDF)"}</p>
      <input type="file" onChange={(e) => setManualFile(e.target.files[0] || null)} />
    </div>
    <div className="upload-box">
      <i className="fa-solid fa-cloud-arrow-up"></i>
      <p>{certFile ? certFile.name : existingCert || "Upload calibration certificate"}</p>
      <input type="file" onChange={(e) => setCertFile(e.target.files[0] || null)} />
    </div>
  </div>
</div>

          <div className="section">
            <label>Calibration due date</label>
            <input
              type="date"
              className="date"
              value={form.calibrationDate}
              onChange={(e) => updateField("calibrationDate", e.target.value)}
            />
          </div>

          <div className="buttons">
            <button className="cancel" onClick={handleClose}>
              Cancel
            </button>
            <button className="save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}