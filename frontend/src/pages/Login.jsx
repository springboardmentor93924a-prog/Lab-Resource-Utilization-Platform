import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Invalid credentials"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("institutionId", data.institutionId ?? "");
      localStorage.setItem("institutionName", data.institutionName ?? "");

      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* LEFT SIDE */}
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

          <div className="brand-features">

            <div className="brand-feature">
              <span>✓</span>
              <p>Real-time equipment tracking</p>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <p>Easy resource booking</p>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <p>Utilization insights</p>
            </div>

          </div>

        </div>

        <div className="decor-circle circle-one"></div>
        <div className="decor-circle circle-two"></div>

      </section>


      {/* RIGHT SIDE */}
      <section className="login-section">

        <div className="login-content">

          {/* Mobile logo */}
          <div className="mobile-logo">
            <div className="brand-logo">
              <span>⌘</span>
            </div>
          </div>


          <header className="login-header">

            <h2>Welcome back</h2>

            <p>
              Sign in to access your laboratory dashboard.
            </p>

          </header>


          {error && (
            <div className="login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}


          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon password-icon">
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* OPTIONS */}
            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>Remember me</span>

              </label>

              <Link to="/register">
                Create account
              </Link>

            </div>


            {/* BUTTON */}
            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="arrow">→</span>
                </>
              )}

            </button>

          </form>


          <footer className="login-footer">
            Laboratory Resource Management System
          </footer>

        </div>

      </section>

    </main>
  );
}

export default Login;