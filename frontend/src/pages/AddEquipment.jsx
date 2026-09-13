import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AddEquipment.css";
import { addEquipment } from "../services/equipmentService";
import { isAdmin } from "../utils/auth";
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

const initialForm = {
  equipmentName: "",
  categoryId: "",
  assetId: "",
  departmentId: "",
  manufacturer: "",
  modelNumber: "",
  notes: "",
  calibrationDate: "",
  imageUrl: "",
};

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
      return "Under Maintenance";
  }
}

export default function AddEquipment() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to add equipment.");
      navigate("/equipment");
    }
  }, [navigate]);

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("Available");
  const [manualFile, setManualFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutionId, setInstitutionId] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [cats, deps, insts] = await Promise.all([
          fetchList("/api/categories"),
          fetchList("/api/departments"),
          fetchList("/api/institutions"),
        ]);

        setCategories(cats);
        setDepartments(deps);
        setInstitutionId(insts.length > 0 ? insts[0].institutionId : 1);

        setForm((prev) => ({
          ...prev,
          categoryId: cats.length > 0 ? cats[0].categoryId : "",
          departmentId: deps.length > 0 ? deps[0].departmentId : "",
        }));
      } catch (err) {
        console.error("Failed to load category/department/institution options", err);
        setOptionsError("Could not load categories/departments from the server.");
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

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
      alert("Category and Department options are still loading or failed to load. Please wait or refresh.");
      return;
    }

    try {
      setSaving(true);

      let manualFilename = null;
      let certFilename = null;

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
        institution: { institutionId: Number(institutionId) },
        manufacturer: form.manufacturer,
        modelNumber: form.modelNumber,
        imageUrl: form.imageUrl || "https://picsum.photos/seed/newequipment/400/300",
        status: mapStatusToBackend(status),
        calibrationDueDate: form.calibrationDate || null,
        manualDocument: manualFilename,
        calibrationCertificate: certFilename,
      };

      await addEquipment(payload);
      alert("Equipment saved successfully!");
      navigate("/equipment");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save equipment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (window.confirm("Clear all fields?")) {
      setForm((prev) => ({
        ...initialForm,
        categoryId: categories.length > 0 ? categories[0].categoryId : "",
        departmentId: departments.length > 0 ? departments[0].departmentId : "",
      }));
      setStatus("Available");
      setManualFile(null);
      setCertFile(null);
    }
  }

  function handleClose() {
    if (window.confirm("Close this page?")) {
      navigate(-1);
    }
  }

  return (
    <div className="container add-equipment-page">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="main">
        <header>
          <h2>Add equipment</h2>
          <div className="right">
            <input type="text" placeholder="Search..." />
            <button
    className="profile-circle"
    onClick={() => navigate("/profile")}
    title="My Profile"
    aria-label="My Profile"
>
    ??
</button>
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
                <input type="text" value={form.assetId}onChange={(e) => updateField("assetId", e.target.value)} />
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
                <input type="text" placeholder="https://..." value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} />
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
              <div>
                <label>Capacity / notes</label>
                <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Documents</h3>
            <div className="documents">
              <div className="upload-box">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>{manualFile ? manualFile.name : "Upload manual (PDF)"}</p>
                <input type="file" onChange={(e) => setManualFile(e.target.files[0] || null)} />
              </div>
              <div className="upload-box">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>{certFile ? certFile.name : "Upload calibration certificate"}</p>
                <input type="file" onChange={(e) => setCertFile(e.target.files[0] || null)} />
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
            <small className="note">pill = single-select. "Out of service" and "Retired" currently map to Maintenance on the backend.</small>
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
            <button className="cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save" onClick={handleSave} disabled={saving || loadingOptions}>
              {saving ? "Saving..." : "Save equipment"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
