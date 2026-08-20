import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { submitFeedback } from "../services/feedbackService";

import "./EquipmentFeedback.css";

export default function EquipmentFeedback() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bookingId,
    equipmentId,
    equipmentName,
  } = location.state || {};

  const [functioningStatus, setFunctioningStatus] =
    useState("");

  const [severity, setSeverity] = useState("");

  const [comments, setComments] = useState("");

  const [submitting, setSubmitting] = useState(false);


  /* =========================================================
     MISSING INFORMATION
  ========================================================= */

  if (!bookingId || !equipmentId) {
    return (
      <div className="feedback-page">

        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main className="feedback-main">

          <div className="feedback-error-card">

            <div className="feedback-error-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>

            <h2>Feedback information missing</h2>

            <p>
              Please open the feedback form from one of
              your completed bookings.
            </p>

            <button
              className="feedback-back-btn"
              onClick={() => navigate("/my-bookings")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to My Bookings
            </button>

          </div>

        </main>
      </div>
    );
  }


  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!functioningStatus) {
      alert(
        "Please select how the equipment is functioning."
      );
      return;
    }

    if (!severity) {
      alert("Please select the problem severity.");
      return;
    }

    setSubmitting(true);

    try {

      const payload = {
        bookingId: Number(bookingId),
        equipmentId: Number(equipmentId),
        functioningStatus,
        severity,
        comments: comments.trim(),
      };

      console.log(
        "Submitting feedback:",
        payload
      );

      await submitFeedback(payload);

      alert("Feedback submitted successfully!");

      navigate("/my-bookings");

    } catch (err) {

      console.error(
        "Feedback submission error:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit feedback."
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="feedback-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="feedback-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="feedback-header">

          <div className="feedback-title-area">

            <div className="feedback-title-icon">

              <i className="bi bi-chat-heart-fill"></i>

              <span className="feedback-sparkle sparkle-one">
                ✦
              </span>

              <span className="feedback-sparkle sparkle-two">
                ✧
              </span>

            </div>

            <div>

              <h1>Equipment Feedback</h1>

              <p>
                Share your experience and help us keep
                laboratory equipment reliable.
              </p>

            </div>

          </div>


          <button
            className="feedback-back-top"
            onClick={() => navigate("/my-bookings")}
          >
            <i className="bi bi-arrow-left"></i>
            My Bookings
          </button>

        </header>


        {/* ===================================================
            MAIN CARD
        =================================================== */}

        <section className="feedback-card">

          {/* decorative lights */}

          <div className="feedback-orb orb-one"></div>
          <div className="feedback-orb orb-two"></div>

          <div className="feedback-star star-one">
            ✦
          </div>

          <div className="feedback-star star-two">
            ✧
          </div>


          {/* =================================================
              EQUIPMENT INFORMATION
          ================================================= */}

          <div className="equipment-info-box">

            <div className="equipment-info-icon">

              <i className="bi bi-cpu-fill"></i>

              <span className="equipment-icon-glow"></span>

            </div>


            <div className="equipment-info-text">

              <span className="equipment-label">
                EQUIPMENT
              </span>

              <h2>
                {equipmentName}
              </h2>

              <div className="booking-reference">

                <i className="bi bi-receipt-cutoff"></i>

                Booking ID:
                <strong>#{bookingId}</strong>

              </div>

            </div>


            <div className="experience-badge">

              <i className="bi bi-stars"></i>

              Your Experience

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>

            {/* =================================================
                FUNCTIONING
            ================================================= */}

            <div className="feedback-field">

              <div className="field-heading">

                <div className="field-heading-left">

                  <span className="field-number">
                    01
                  </span>

                  <div>

                    <label>
                      How is the equipment functioning?
                      <span className="required">*</span>
                    </label>

                    <small>
                      Select the option that best describes
                      your experience.
                    </small>

                  </div>

                </div>

                <i className="bi bi-activity field-heading-icon"></i>

              </div>


              <div className="feedback-options">

                {/* WORKING */}

                <label
                  className={`feedback-option working-option ${
                    functioningStatus === "WORKING"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="functioningStatus"
                    value="WORKING"
                    checked={
                      functioningStatus === "WORKING"
                    }
                    onChange={(e) =>
                      setFunctioningStatus(
                        e.target.value
                      )
                    }
                  />

                  <div className="option-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>

                  <div className="option-content">

                    <strong>Working</strong>

                    <small>
                      Equipment is functioning normally
                    </small>

                  </div>

                  <div className="option-check">
                    <i className="bi bi-check-lg"></i>
                  </div>

                </label>


                {/* MINOR ISSUE */}

                <label
                  className={`feedback-option minor-option ${
                    functioningStatus === "MINOR_ISSUE"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="functioningStatus"
                    value="MINOR_ISSUE"
                    checked={
                      functioningStatus ===
                      "MINOR_ISSUE"
                    }
                    onChange={(e) =>
                      setFunctioningStatus(
                        e.target.value
                      )
                    }
                  />

                  <div className="option-icon">
                    <i className="bi bi-exclamation-circle-fill"></i>
                  </div>

                  <div className="option-content">

                    <strong>Minor Issue</strong>

                    <small>
                      Equipment works but has a minor
                      problem
                    </small>

                  </div>

                  <div className="option-check">
                    <i className="bi bi-check-lg"></i>
                  </div>

                </label>


                {/* NOT FUNCTIONING */}

                <label
                  className={`feedback-option broken-option ${
                    functioningStatus ===
                    "NOT_FUNCTIONING"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="functioningStatus"
                    value="NOT_FUNCTIONING"
                    checked={
                      functioningStatus ===
                      "NOT_FUNCTIONING"
                    }
                    onChange={(e) =>
                      setFunctioningStatus(
                        e.target.value
                      )
                    }
                  />

                  <div className="option-icon">
                    <i className="bi bi-x-circle-fill"></i>
                  </div>

                  <div className="option-content">

                    <strong>
                      Not Functioning
                    </strong>

                    <small>
                      Equipment cannot be used properly
                    </small>

                  </div>

                  <div className="option-check">
                    <i className="bi bi-check-lg"></i>
                  </div>

                </label>

              </div>

            </div>


            {/* =================================================
                SEVERITY
            ================================================= */}

            <div className="feedback-field">

              <div className="field-heading">

                <div className="field-heading-left">

                  <span className="field-number">
                    02
                  </span>

                  <div>

                    <label htmlFor="severity">
                      Problem Severity
                      <span className="required">*</span>
                    </label>

                    <small>
                      How serious is the problem you noticed?
                    </small>

                  </div>

                </div>

                <i className="bi bi-shield-exclamation field-heading-icon"></i>

              </div>


              <div className="severity-wrapper">

                <i className="bi bi-lightning-charge-fill"></i>

                <select
                  id="severity"
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value)
                  }
                >

                  <option value="">
                    Select problem severity
                  </option>

                  <option value="LOW">
                    Low — Minor inconvenience
                  </option>

                  <option value="MEDIUM">
                    Medium — Needs attention
                  </option>

                  <option value="HIGH">
                    High — Significant problem
                  </option>

                  <option value="CRITICAL">
                    Critical — Equipment unusable
                  </option>

                </select>

                <i className="bi bi-chevron-down severity-arrow"></i>

              </div>

            </div>


            {/* =================================================
                COMMENTS
            ================================================= */}

            <div className="feedback-field">

              <div className="field-heading">

                <div className="field-heading-left">

                  <span className="field-number">
                    03
                  </span>

                  <div>

                    <label htmlFor="comments">
                      Tell us more
                    </label>

                    <small>
                      Describe your experience or any
                      problem you noticed.
                    </small>

                  </div>

                </div>

                <i className="bi bi-chat-square-text field-heading-icon"></i>

              </div>


              <div className="comments-wrapper">

                <textarea
                  id="comments"
                  rows="6"
                  maxLength="2000"
                  value={comments}
                  onChange={(e) =>
                    setComments(e.target.value)
                  }
                  placeholder="Write your feedback here..."
                />

                <div className="comments-footer">

                  <span>
                    <i className="bi bi-pencil"></i>

                    Your feedback helps improve the lab.
                  </span>

                  <span className="character-count">
                    {comments.length}/2000
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="feedback-actions">

              <button
                type="button"
                className="feedback-cancel-btn"
                onClick={() =>
                  navigate("/my-bookings")
                }
                disabled={submitting}
              >

                <i className="bi bi-arrow-left"></i>

                Cancel

              </button>


              <button
                type="submit"
                className="feedback-submit-btn"
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <i className="bi bi-arrow-repeat feedback-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill"></i>

                    Submit Feedback

                    <span className="submit-sparkle">
                      ✦
                    </span>
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}