import "./Login.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

// "Sign in with Google" (free). Set VITE_GOOGLE_CLIENT_ID to turn the
// button on; leave it unset and the page shows only email + password.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const saveSession = (data) => {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("userId", data.userId);
    sessionStorage.setItem("fullName", data.fullName);
    sessionStorage.setItem("email", data.email);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("institutionId", data.institutionId ?? "");
    sessionStorage.setItem("institutionName", data.institutionName ?? "");
    sessionStorage.setItem("departmentId", data.departmentId ?? "");
    sessionStorage.setItem("departmentName", data.departmentName ?? "");
  };

  const handleGoogleCredential = async (googleResponse) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: googleResponse.credential }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google sign-in failed");
      }

      saveSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // Load Google's sign-in script and draw its button.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const render = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        width: 320,
      });
    };

    if (window.google) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
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

      saveSession(data);

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

              <Link to="/forgot-password">
                Forgot password?
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

          {GOOGLE_CLIENT_ID && (
            <div style={{ marginTop: "18px", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 10px" }}>
                or
              </p>
              <div
                ref={googleButtonRef}
                style={{ display: "flex", justifyContent: "center" }}
              ></div>
              <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px" }}>
                Google sign-in works only for accounts that are already
                registered and approved.
              </p>
            </div>
          )}


          <footer className="login-footer">
            Laboratory Resource Management System
          </footer>

        </div>

      </section>

    </main>
  );
}

export default Login;