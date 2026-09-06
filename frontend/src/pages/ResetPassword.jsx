import "./Login.css";
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError("This reset link is missing its token. Request a new one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string" ? data : data.message || "Reset failed"
        );
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <span>⌘</span>
          </div>

          <h1>
            Lab Resource
            <br />
            Utilization
            <br />
            Platform
          </h1>
        </div>

        <div className="decor-circle circle-one"></div>
        <div className="decor-circle circle-two"></div>
      </section>

      <section className="login-section">
        <div className="login-content">
          <div className="mobile-logo">
            <div className="brand-logo">
              <span>⌘</span>
            </div>
          </div>

          <header className="login-header">
            <h2>Set a new password</h2>
            <p>Choose a new password for your account.</p>
          </header>

          {error && (
            <div className="login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="login-form">
              <p>Password reset successful. Redirecting to sign in...</p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword">New password</label>

                <div className="input-wrapper">
                  <span className="input-icon password-icon"></span>

                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>

                <div className="input-wrapper">
                  <span className="input-icon password-icon"></span>

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>

              <div className="login-options">
                <Link to="/">Back to sign in</Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;