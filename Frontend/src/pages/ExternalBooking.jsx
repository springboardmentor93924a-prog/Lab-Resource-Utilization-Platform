import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function ExternalBooking() {
  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    externalName: "",
    externalEmail: "",
    externalPhone: "",
    institutionId: "",
    equipmentId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  // =========================================================
  // DATA
  // =========================================================

  const [equipment, setEquipment] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // =========================================================
  // UI STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD EQUIPMENT + INSTITUTIONS
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [equipmentResponse, institutionResponse] =
        await Promise.all([
          api.get("/equipment"),
          api.get("/institutions"),
        ]);

      console.log(
        "Equipment:",
        equipmentResponse.data
      );

      console.log(
        "Institutions:",
        institutionResponse.data
      );

      // Equipment response
      const equipmentData =
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : equipmentResponse.data?.data || [];

      // Institution response
      const institutionData =
        Array.isArray(institutionResponse.data)
          ? institutionResponse.data
          : institutionResponse.data?.data || [];

      setEquipment(equipmentData);
      setInstitutions(institutionData);

    } catch (err) {
      console.error(
        "Error loading external booking data:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      setError(
        "Unable to load equipment and institutions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!formData.externalName.trim()) {
      return "Please enter your name.";
    }

    if (!formData.externalEmail.trim()) {
      return "Please enter your email.";
    }

    if (!formData.externalPhone.trim()) {
      return "Please enter your phone number.";
    }

    if (!formData.institutionId) {
      return "Please select an institution.";
    }

    if (!formData.equipmentId) {
      return "Please select equipment.";
    }

    if (!formData.bookingDate) {
      return "Please select a booking date.";
    }

    if (!formData.startTime) {
      return "Please select a start time.";
    }

    if (!formData.endTime) {
      return "Please select an end time.";
    }

    if (formData.endTime <= formData.startTime) {
      return "End time must be after start time.";
    }

    if (!formData.purpose.trim()) {
      return "Please enter the purpose of booking.";
    }

    return null;
  };

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      // Find selected objects
      const selectedEquipment = equipment.find(
        (item) =>
          String(item.id) ===
          String(formData.equipmentId)
      );

      const selectedInstitution = institutions.find(
        (item) =>
          String(item.id) ===
          String(formData.institutionId)
      );

      if (!selectedEquipment) {
        setError("Selected equipment was not found.");
        return;
      }

      if (!selectedInstitution) {
        setError("Selected institution was not found.");
        return;
      }

      // =====================================================
      // REQUEST BODY
      // =====================================================

      const bookingData = {
        externalName:
          formData.externalName.trim(),

        externalEmail:
          formData.externalEmail.trim(),

        externalPhone:
          formData.externalPhone.trim(),

        institution: {
          id: Number(formData.institutionId),
        },

        equipment: {
          id: Number(formData.equipmentId),
        },

        bookingDate:
          formData.bookingDate,

        startTime:
          formData.startTime,

        endTime:
          formData.endTime,

        purpose:
          formData.purpose.trim(),
      };

      console.log(
        "Submitting external booking:",
        bookingData
      );

      // =====================================================
      // POST API
      // =====================================================

      const response = await api.post(
        "/external-bookings",
        bookingData
      );

      console.log(
        "External booking response:",
        response.data
      );

      setSuccess(
        "External booking request submitted successfully."
      );

      // =====================================================
      // RESET FORM
      // =====================================================

      setFormData({
        externalName: "",
        externalEmail: "",
        externalPhone: "",
        institutionId: "",
        equipmentId: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
      });

    } catch (err) {
      console.error(
        "External booking error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const serverMessage =
        err.response?.data;

      if (typeof serverMessage === "string") {
        setError(serverMessage);
      } else if (
        serverMessage?.message
      ) {
        setError(serverMessage.message);
      } else {
        setError(
          "Unable to submit external booking request."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // TODAY
  // =========================================================

  const getToday = () => {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(today.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(today.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="app-layout">

        <Sidebar />

        <div className="main-area">

          <Topbar />

          <main className="main-content">

            <div className="external-booking-page">

              <div className="external-booking-loading">
                Loading booking information...
              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    

          <div className="external-booking-page">

          <div className="external-booking-container">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="external-booking-header">

              <div>

                <h1>
                  External Booking
                </h1>

                <p>
                  Request access to laboratory
                  equipment from another institution.
                </p>

              </div>

              <div className="external-booking-header-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    navigate("/external-bookings")
                  }
                >
                  My Requests
                </button>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="external-booking-error">
                {error}
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div className="external-booking-success">
                {success}
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="external-booking-form"
              onSubmit={handleSubmit}
            >

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <div className="external-form-section">

                <div className="external-form-section-header">

                  <h2>
                    Contact Information
                  </h2>

                  <p>
                    Enter your contact details.
                  </p>

                </div>

                <div className="external-form-grid">

                  {/* NAME */}

                  <div className="external-form-group">

                    <label htmlFor="externalName">
                      Full Name
                      <span>*</span>
                    </label>

                    <input
                      id="externalName"
                      type="text"
                      name="externalName"
                      value={formData.externalName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      maxLength={100}
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="external-form-group">

                    <label htmlFor="externalEmail">
                      Email Address
                      <span>*</span>
                    </label>

                    <input
                      id="externalEmail"
                      type="email"
                      name="externalEmail"
                      value={formData.externalEmail}
                      onChange={handleChange}
                      placeholder="example@email.com"
                    />

                  </div>

                  {/* PHONE */}

                  <div className="external-form-group">

                    <label htmlFor="externalPhone">
                      Phone Number
                      <span>*</span>
                    </label>

                    <input
                      id="externalPhone"
                      type="tel"
                      name="externalPhone"
                      value={formData.externalPhone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />

                  </div>

                  {/* INSTITUTION */}

                  <div className="external-form-group">

                    <label htmlFor="institutionId">
                      Institution
                      <span>*</span>
                    </label>

                    <select
                      id="institutionId"
                      name="institutionId"
                      value={formData.institutionId}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select institution
                      </option>

                      {institutions.map(
                        (institution) => (

                          <option
                            key={institution.id}
                            value={institution.id}
                          >
                            {institution.name}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

              </div>

              {/* =================================================
                  BOOKING INFORMATION
              ================================================= */}

              <div className="external-form-section">

                <div className="external-form-section-header">

                  <h2>
                    Booking Information
                  </h2>

                  <p>
                    Select the equipment and
                    required booking schedule.
                  </p>

                </div>

                <div className="external-form-grid">

                  {/* EQUIPMENT */}

                  <div className="external-form-group external-form-full">

                    <label htmlFor="equipmentId">
                      Equipment
                      <span>*</span>
                    </label>

                    <select
                      id="equipmentId"
                      name="equipmentId"
                      value={formData.equipmentId}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select equipment
                      </option>

                      {equipment.map(
                        (item) => (

                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                            {" - "}
                            {item.assetTag}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  {/* DATE */}

                  <div className="external-form-group">

                    <label htmlFor="bookingDate">
                      Booking Date
                      <span>*</span>
                    </label>

                    <input
                      id="bookingDate"
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={getToday()}
                    />

                  </div>

                  {/* START TIME */}

                  <div className="external-form-group">

                    <label htmlFor="startTime">
                      Start Time
                      <span>*</span>
                    </label>

                    <input
                      id="startTime"
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                    />

                  </div>

                  {/* END TIME */}

                  <div className="external-form-group">

                    <label htmlFor="endTime">
                      End Time
                      <span>*</span>
                    </label>

                    <input
                      id="endTime"
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                    />

                  </div>

                  {/* PURPOSE */}

                  <div className="external-form-group external-form-full">

                    <label htmlFor="purpose">
                      Purpose of Booking
                      <span>*</span>
                    </label>

                    <textarea
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Explain why you need this equipment..."
                      rows="5"
                      maxLength={500}
                    />

                    <small>
                      {formData.purpose.length}/500
                    </small>

                  </div>

                </div>

              </div>

              {/* =================================================
                  INFORMATION BOX
              ================================================= */}

              <div className="external-booking-info">

                <div className="external-booking-info-icon">
                  ℹ
                </div>

                <div>

                  <h3>
                    Booking Request Process
                  </h3>

                  <p>
                    Your request will initially be
                    marked as <strong>PENDING</strong>.
                    An administrator will review the
                    request and either approve or reject
                    it.
                  </p>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="external-booking-form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    navigate("/equipment")
                  }
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >

                  {submitting
                    ? "Submitting..."
                    : "Submit Booking Request"}

                </button>

              </div>

            </form>

          </div>
          </div>

    
  );
}

export default ExternalBooking;