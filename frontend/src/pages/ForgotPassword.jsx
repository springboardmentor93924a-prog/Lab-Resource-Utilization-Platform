import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const trimmedEmail = email.trim();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // -------------------------------------------------------
    // CALL BACKEND
    // -------------------------------------------------------

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        }
      );

      const data = await response.json();

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      if (response.ok) {
        setSuccess(true);
      } else {
        // ---------------------------------------------------
        // BACKEND ERROR
        // ---------------------------------------------------

        setError(
          data?.message ||
            "Unable to process your password reset request."
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      {/* Background decoration */}
      <div className="forgot-bg-circle circle-one"></div>
      <div className="forgot-bg-circle circle-two"></div>
      <div className="forgot-bg-grid"></div>

      {/* Main container */}
      <div className="forgot-container">

        {/* Logo */}
        <div className="forgot-logo">

          <div className="forgot-logo-icon">
            <FlaskConical
              size={30}
              strokeWidth={2.2}
            />
          </div>

          <div className="forgot-brand">

            <h1>
              Lab Resource Utilization Platform
            </h1>

            <div className="forgot-tagline">
              <span></span>
              SMART LAB RESOURCE MANAGEMENT
              <span></span>
            </div>

          </div>
        </div>

        {/* Card */}
        <div className="forgot-card">

          {/* Main Icon */}
          <div className="forgot-main-icon">
            <KeyRound
              size={34}
              strokeWidth={2}
            />
          </div>

          {/* Heading */}
          <h2>
            Forgot Password?
          </h2>

          <p className="forgot-description">
            Don't worry! Enter your registered email address and
            we'll help you reset your password.
          </p>

          {/* =================================================
              SUCCESS MESSAGE
              ================================================= */}
          {success && (
            <div className="forgot-success">

              <CheckCircle2 size={20} />

              <div>

                <strong>
                  Reset link sent!
                </strong>

                <p>
                  If an account exists for{" "}
                  <b>{email}</b>, you will receive
                  password reset instructions.
                </p>

              </div>

            </div>
          )}

          {/* =================================================
              FORM
              ================================================= */}
          {!success && (
            <form onSubmit={handleSubmit}>

              {/* Email label */}
              <label htmlFor="email">
                Email address
              </label>

              {/* Email input */}
              <div className="forgot-input-wrapper">

                <Mail size={20} />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

              {/* Error */}
              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="forgot-spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={19} />
                    Send Reset Link
                  </>
                )}

              </button>

            </form>
          )}

          {/* =================================================
              BACK TO LOGIN
              ================================================= */}
          <Link
            to="/login"
            className="back-login"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>

        </div>

        {/* Footer */}
        <div className="forgot-footer">
          <span className="footer-shield">
            ✓
          </span>

          Secure laboratory resource management
        </div>

        <div className="forgot-footer-links">
          Laboratory Equipment&nbsp; • &nbsp;
          Resource Sharing&nbsp; • &nbsp;
          Utilization Analytics
        </div>

      </div>

    </div>
  );
}