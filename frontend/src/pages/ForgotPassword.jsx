import "./Login.css";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
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

          <p>
            Smart management of laboratory
            equipment, bookings and resources.
          </p>
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
            <h2>Reset your password</h2>
            <p>
              Enter your account email and we'll send you a link to
              reset your password.
            </p>
          </header>

          {error && (
            <div className="login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {submitted ? (
            <div className="login-form">
              <p>{message}</p>
              <Link to="/" className="login-btn" style={{ textDecoration: "none", textAlign: "center", display: "block" }}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <span className="input-icon"></span>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  "Send reset link"
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

export default ForgotPassword;