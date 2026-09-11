import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddEquipment.css";
import { getEquipmentById, updateEquipment } from "../services/equipmentService";
import { uploadFile } from "../services/fileService";

const statusOptions = ["Available", "Booked", "Under maintenance", "Out of service", "Retired"];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://lab-resource-utilization-platform-o09v.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

async function fetchList(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

function mapStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case "Available":
      return "Available";
    case "Booked":
      return "Booked";
    case "Under maintenance":
      return "Under Maintenance";
    case "Out of service":
      return "Out of Service";
    case "Retired":
      return "Retired";
    default:
      return "Available";
  }
}

function mapStatusToUI(backendStatus) {
  switch (backendStatus) {
    case "Available":
      return "Available";
    case "Booked":
      return "Booked";
    case "Under Maintenance":
      return "Under maintenance";
    case "Out of Service":
      return "Out of service";
    case "Retired":
      return "Retired";
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

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [cats, deps] = await Promise.all([
          fetchList("/api/categories"),
          fetchList("/api/departments"),
        ]);
        setCategories(cats);
        setDepartments(deps);
      } catch (err) {
        console.error("Failed to load category/department options", err);
        setOptionsError("Could not load categories/departments from the server.");
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await getEquipmentById(id);
        setForm({
          equipmentName: data.name || "",
          categoryId: data.category?.categoryId || "",
          assetId: data.assetTag || "",
          departmentId: data.department?.departmentId || "",
          institutionId: data.institution?.institutionId || null,
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
    if (!form.categoryId || !form.departmentId) {
      alert("Please select a Category and Department.");
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
        name: form.equipmentName,
        assetTag: form.assetId,
        category: { categoryId: Number(form.categoryId) },
        department: { departmentId: Number(form.departmentId) },
        institution: { institutionId: form.institutionId },
        manufacturer: form.manufacturer,
        modelNumber: form.modelNumber,
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

          {optionsError && (
            <div className="section">
              <p style={{ color: "#f87171" }}>{optionsError}</p>
            </div>
          )}

          <div className="section">
            <h3>Basic info</h3>
            <div className="grid-3">
              <div>
                <label>Equipment name</label>
                <input type="text" value={form.equipmentName} onChange={(e) => updateField("equipmentName", e.target.value)} />
              </div>
              <div>
                <label>Category / type</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  disabled={loadingOptions || categories.length === 0}
                >
                  {loadingOptions && <option>Loading...</option>}
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Asset ID / tag</label>
                <input type="text" value={form.assetId} onChange={(e) => updateField("assetId", e.target.value)} />
              </div>
              <div>
                <label>Department</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => updateField("departmentId", e.target.value)}
                  disabled={loadingOptions || departments.length === 0}
                >
                  {loadingOptions && <option>Loading...</option>}
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                  ))}
                </select>
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
            <button className="save" onClick={handleSave} disabled={saving || loadingOptions}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}