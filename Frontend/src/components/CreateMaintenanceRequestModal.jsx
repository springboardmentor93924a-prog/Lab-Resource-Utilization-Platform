import React, { useEffect, useState } from "react";
import {
  createMaintenanceRequest,
} from "../services/maintenanceApi";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

function CreateMaintenanceRequestModal({
  show,
  onClose,
  onSuccess,
}) {
  const [equipment, setEquipment] = useState([]);

  const [equipmentId, setEquipmentId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [notes, setNotes] = useState("");

  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD EQUIPMENT
  // =========================================================

  useEffect(() => {
    if (!show) return;

    const loadEquipment = async () => {
      try {
        setLoadingEquipment(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/equipment`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEquipment(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (err) {
        console.error(
          "Failed to load equipment:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Failed to load equipment."
        );
      } finally {
        setLoadingEquipment(false);
      }
    };

    loadEquipment();
  }, [show]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setEquipmentId("");
    setDescription("");
    setPriority("MEDIUM");
    setNotes("");
    setError("");
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  // =========================================================
  // SUBMIT REQUEST
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equipmentId) {
      setError("Please select equipment.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a maintenance description.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createMaintenanceRequest({
        equipmentId: Number(equipmentId),
        description: description.trim(),
        priority,
        notes: notes.trim(),
      });

      resetForm();

      onSuccess?.();

      onClose();

    } catch (err) {
      console.error(
        "Failed to create maintenance request:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create maintenance request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="maintenance-modal-overlay"
      onClick={handleClose}
    >
      <div
        className="maintenance-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <div className="maintenance-modal-header">

          <div>
            <h2>Create Maintenance Request</h2>

            <p>
              Submit a maintenance request for equipment
            </p>
          </div>

          <button
            type="button"
            className="maintenance-modal-close"
            onClick={handleClose}
            disabled={submitting}
          >
            ×
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="maintenance-form-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          className="maintenance-form"
          onSubmit={handleSubmit}
        >

          {/* EQUIPMENT */}

          <div className="maintenance-form-group">

            <label>
              Equipment <span>*</span>
            </label>

            <select
              value={equipmentId}
              onChange={(e) =>
                setEquipmentId(e.target.value)
              }
              disabled={
                loadingEquipment || submitting
              }
            >

              <option value="">
                {loadingEquipment
                  ? "Loading equipment..."
                  : "Select equipment"}
              </option>

              {equipment.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name ||
                    item.equipmentName ||
                    `Equipment #${item.id}`}
                </option>
              ))}

            </select>

          </div>

          {/* DESCRIPTION */}

          <div className="maintenance-form-group">

            <label>
              Description <span>*</span>
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe the maintenance problem..."
              rows="4"
              disabled={submitting}
            />

          </div>

          {/* PRIORITY */}

          <div className="maintenance-form-group">

            <label>
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              disabled={submitting}
            >

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>

            </select>

          </div>

          {/* NOTES */}

          <div className="maintenance-form-group">

            <label>
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Additional notes (optional)..."
              rows="3"
              disabled={submitting}
            />

          </div>

          {/* ACTIONS */}

          <div className="maintenance-modal-actions">

            <button
              type="button"
              className="maintenance-secondary-button"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="maintenance-primary-button"
              disabled={submitting}
            >

              {submitting
                ? "Submitting..."
                : "Submit Request"}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateMaintenanceRequestModal;