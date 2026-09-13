import React, { useEffect, useState } from "react";
import {
  createWorkOrder,
  getAllMaintenanceRequests,
  getTechnicians,
  assignTechnician,
} from "../services/maintenanceApi";
import "./CreateWorkOrderModal.css";

// __define-ocg__

function CreateWorkOrderModal({
  show,
  onClose,
  onSuccess,
}) {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [formData, setFormData] = useState({
    maintenanceRequestId: "",
    technicianId: "",
    workDescription: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD REQUESTS + TECHNICIANS
  // =========================================================

  useEffect(() => {
    if (show) {
      loadFormData();
    }
  }, [show]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [requestData, technicianData] =
        await Promise.all([
          getAllMaintenanceRequests(),
          getTechnicians(),
        ]);

      setRequests(
        Array.isArray(requestData)
          ? requestData
          : []
      );

      setTechnicians(
        Array.isArray(technicianData)
          ? technicianData
          : []
      );

    } catch (err) {
      console.error(
        "Failed to load work order data:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance requests or technicians."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleStartChange = (e) => {
    const value = e.target.value;
  
    setFormData((previous) => ({
      ...previous,
      scheduledStart: value,
  
      // Clear end time if it becomes invalid
      scheduledEnd:
        previous.scheduledEnd &&
        value &&
        new Date(previous.scheduledEnd) <= new Date(value)
          ? ""
          : previous.scheduledEnd,
    }));
  
    setError("");
  };


  // =========================================================
  // CREATE WORK ORDER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Request validation
    if (!formData.maintenanceRequestId) {
      setError(
        "Please select a maintenance request."
      );
      return;
    }

    // Technician validation
    if (!formData.technicianId) {
      setError(
        "Please select a technician."
      );
      return;
    }

    if (!formData.workDescription.trim()) {
      setError(
        "Please enter the work description."
      );
      return;
    }

    if (!formData.scheduledStart) {
      setError(
        "Please select the scheduled start time."
      );
      return;
    }
    
    if (!formData.scheduledEnd) {
      setError(
        "Please select the scheduled end time."
      );
      return;
    }
    
    const startTime = new Date(
      formData.scheduledStart
    );
    
    const endTime = new Date(
      formData.scheduledEnd
    );
    
    if (Number.isNaN(startTime.getTime())) {
      setError(
        "Invalid scheduled start time."
      );
      return;
    }
    
    if (Number.isNaN(endTime.getTime())) {
      setError(
        "Invalid scheduled end time."
      );
      return;
    }
    
    if (endTime <= startTime) {
      setError(
        "Scheduled end must be after scheduled start."
      );
      return;
    }

    // e

    if (
      new Date(formData.scheduledEnd) <=
      new Date(formData.scheduledStart)
    ) {
      setError(
        "Scheduled end must be after scheduled start."
      );
      return;
    }

    try {
      setSubmitting(true);

      /*
       * 1. Create the work order.
       *
       * POST /api/maintenance/work-orders
       */

      const createdWorkOrder =
        await createWorkOrder({
          maintenanceRequestId:
            formData.maintenanceRequestId,

          workDescription:
            formData.workDescription,

          scheduledStart:
            formData.scheduledStart,

          scheduledEnd:
            formData.scheduledEnd,
        });

      // =========================================================
      // ASSIGN SELECTED TECHNICIAN
      // =========================================================
      
      const workOrderId =
        createdWorkOrder?.id ||
        createdWorkOrder?.workOrderId;
      
      if (!workOrderId) {
        throw new Error(
          "Work order was created, but its ID was not returned by the server."
        );
      }
      
      await assignTechnician(
        workOrderId,
        formData.technicianId
      );
      
      console.log(
        "Work order created:",
        createdWorkOrder
      );

      /*
       * Technician assignment will be handled
       * in Task 1.3D.
       *
       * We intentionally DO NOT call assignTechnician()
       * here yet.
       */

      setSuccess(
        "Work order created successfully."
      );

      setTimeout(() => {
        resetForm();

        if (onSuccess) {
          onSuccess(createdWorkOrder);
        }

        onClose();
      }, 800);

    } catch (err) {
      console.error(
        "Failed to create work order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create work order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setFormData({
      maintenanceRequestId: "",
      technicianId: "",
      workDescription: "",
      scheduledStart: "",
      scheduledEnd: "",
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  };

  // =========================================================
  // TECHNICIAN DISPLAY NAME
  // =========================================================

  const getTechnicianName = (technician) => {
    if (!technician) {
      return "Unknown Technician";
    }

    if (
      technician.firstName ||
      technician.lastName
    ) {
      return `${technician.firstName || ""} ${
        technician.lastName || ""
      }`.trim();
    }

    return (
      technician.name ||
      technician.fullName ||
      technician.username ||
      technician.email ||
      `Technician #${technician.id}`
    );
  };

  // =========================================================
  // MODAL
  // =========================================================

  if (!show) {
    return null;
  }

  return (
    <div
      className="create-work-order-overlay"
      onClick={handleClose}
    >

      <div
        className="create-work-order-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="create-work-order-header">

          <div>
            <span className="create-work-order-eyebrow">
              WORK ORDER MANAGEMENT
            </span>

            <h2>
              Create Work Order
            </h2>

            <p>
              Create and schedule a maintenance work order.
            </p>
          </div>

          <button
            type="button"
            className="create-work-order-close"
            onClick={handleClose}
            disabled={submitting}
          >
            ×
          </button>

        </div>

        {/* FORM */}

        <form
          className="create-work-order-form"
          onSubmit={handleSubmit}
        >

          {/* ERROR */}

          {error && (
            <div className="create-work-order-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="create-work-order-success">
              {success}
            </div>
          )}

          {/* MAINTENANCE REQUEST */}

          <div className="create-work-order-field">

            <label>
              Maintenance Request
              <span>*</span>
            </label>

            <select
              name="maintenanceRequestId"
              value={
                formData.maintenanceRequestId
              }
              onChange={handleChange}
              disabled={
                loadingData ||
                submitting
              }
            >

              <option value="">
                {loadingData
                  ? "Loading..."
                  : "Select maintenance request"}
              </option>

              {requests.map((request) => (

                <option
                  key={request.id}
                  value={request.id}
                >
                  Request #{request.id}
                  {" — "}
                  {request.equipment?.name ||
                    request.equipment?.equipmentName ||
                    `Equipment #${
                      request.equipment?.id ||
                      "-"
                    }`}
                  {" — "}
                  {request.priority ||
                    "No priority"}
                </option>

              ))}

            </select>

          </div>

          {/* TECHNICIAN */}

          <div className="create-work-order-field">

            <label>
              Technician
              <span>*</span>
            </label>

            <select
              name="technicianId"
              value={
                formData.technicianId
              }
              onChange={handleChange}
              disabled={
                loadingData ||
                submitting
              }
            >

              <option value="">
                {loadingData
                  ? "Loading technicians..."
                  : "Select technician"}
              </option>

              {technicians.map(
                (technician) => (

                  <option
                    key={technician.id}
                    value={technician.id}
                  >
                    {getTechnicianName(
                      technician
                    )}
                  </option>

                )
              )}

            </select>

            {!loadingData &&
              technicians.length === 0 && (
                <small className="create-work-order-help">
                  No technicians available.
                </small>
              )}

          </div>

          {/* WORK DESCRIPTION */}

          <div className="create-work-order-field">

            <label>
              Work Description
              <span>*</span>
            </label>

            <textarea
              name="workDescription"
              value={
                formData.workDescription
              }
              onChange={handleChange}
              placeholder="Describe the maintenance work to be performed..."
              rows="4"
              disabled={submitting}
            />

          </div>

          {/* SCHEDULE */}

          <div className="create-work-order-date-grid">

            <div className="create-work-order-field">

              <label>
                Scheduled Start
                <span>*</span>
              </label>

              <input
                type="datetime-local"
                name="scheduledStart"
                value={formData.scheduledStart}
                onChange={handleStartChange}
                min={new Date().toISOString().slice(0, 16)}
                disabled={submitting}
              />

            </div>

            <div className="create-work-order-field">

              <label>
                Scheduled End
                <span>*</span>
              </label>

              <input
                type="datetime-local"
                name="scheduledEnd"
                value={formData.scheduledEnd}
                onChange={handleChange}
                min={
                  formData.scheduledStart ||
                  new Date().toISOString().slice(0, 16)
                }
                disabled={
                  submitting ||
                  !formData.scheduledStart
                }
              />

              <small className="create-work-order-help">
                End time must be after the scheduled start time.
              </small>
              
              {formData.scheduledStart &&
               formData.scheduledEnd && (
                 <div className="work-order-schedule-summary">
                   <strong>Scheduled Duration:</strong>{" "}
                   {(
                     (new Date(formData.scheduledEnd) -
                       new Date(formData.scheduledStart)) /
                     (1000 * 60 * 60)
                   ).toFixed(2)}{" "}
                   hours
                 </div>
               )}
            </div>

          </div>

          

          {/* FOOTER */}

          <div className="create-work-order-footer">

            <button
              type="button"
              className="create-work-order-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-work-order-submit"
              disabled={
                submitting ||
                loadingData
              }
            >
              {submitting
                ? "Creating..."
                : "Create Work Order"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateWorkOrderModal;