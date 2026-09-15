import { useState } from "react";
import "./Login.css";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

function Login({ onLogin, onRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const profile = await login(email, password);
      setMessage("Login successful!");
      onLogin(profile);
    } catch (error) {
      // A 403/401 from Spring Security on bad credentials has no useful
      // body most of the time, so fall back to a friendly message.
      const friendly =
        error?.response?.status === 401 || error?.response?.status === 403
          ? "Invalid email or password."
          : extractErrorMessage(error, "Login failed. Please try again.");
      setMessage(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">LR</div>
          <h1>Lab Resource Platform</h1>
          <p>Laboratory Resource Utilization Platform</p>
        </div>

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to access your laboratory workspace</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label>Email Address</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <div className="login-register">
          <span>New user?</span>
          <button type="button" onClick={onRegister}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
