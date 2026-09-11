import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0F1B2D 0%, #1e3a5f 50%, #0F1B2D 100%)" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-8" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
          style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #1557a8, #0F1B2D)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        <h1 className="text-xl font-bold text-center text-gray-900">
          Lab Resource Platform
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Sign in to your account
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-slate-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ "--tw-ring-color": "#1557a8" }}
              onFocus={(e) => { e.target.style.borderColor = "#1557a8"; e.target.style.boxShadow = "0 0 0 3px rgba(21,87,168,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              placeholder="name@institution.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg text-sm text-slate-900 placeholder-gray-400 transition focus:outline-none"
                onFocus={(e) => { e.target.style.borderColor = "#1557a8"; e.target.style.boxShadow = "0 0 0 3px rgba(21,87,168,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-xs font-medium" style={{ color: "#1557a8" }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #1557a8, #0F1B2D)" }}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold" style={{ color: "#1557a8" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
