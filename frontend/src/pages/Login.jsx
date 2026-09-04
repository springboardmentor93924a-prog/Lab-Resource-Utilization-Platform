import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.9 32.1 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6-6C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.6 0 5 .9 6.9 2.4l6-6C33.5 6.5 29 4.5 24 4.5c-7.7 0-14.3 4.3-17.7 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 34.7 26.7 35.5 24 35.5c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.5 39.2 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.3-5.6 6.9l6.2 5.2C39.6 37.5 43.5 31.5 43.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
  window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
}

  const inputClass =
    "w-full h-12 px-4 bg-[#111c2d] border border-slate-700/80 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition";

  const labelClass =
    "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050b14] text-white flex items-center justify-center px-4 py-10">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Large laboratory-style glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.8) 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      {/* =====================================================
          DECORATIVE LAB EQUIPMENT
      ====================================================== */}

      {/* Microscope-like decoration */}
      <div className="hidden lg:block absolute left-[8%] top-[18%] opacity-[0.12] pointer-events-none">
        <svg
          width="220"
          height="260"
          viewBox="0 0 220 260"
          fill="none"
        >
          <path
            d="M75 25h35v35H75z"
            stroke="#67e8f9"
            strokeWidth="4"
          />
          <path
            d="M93 60v45"
            stroke="#67e8f9"
            strokeWidth="8"
          />
          <path
            d="M93 105c-40 0-60 25-60 60v20"
            stroke="#67e8f9"
            strokeWidth="8"
          />
          <path
            d="M33 185h110"
            stroke="#67e8f9"
            strokeWidth="8"
          />
          <path
            d="M75 185v30h85"
            stroke="#67e8f9"
            strokeWidth="8"
          />
          <circle
            cx="93"
            cy="105"
            r="14"
            stroke="#67e8f9"
            strokeWidth="4"
          />
        </svg>
      </div>

      {/* Flask decoration */}
      <div className="hidden lg:block absolute right-[8%] top-[20%] opacity-[0.12] pointer-events-none">
        <svg
          width="180"
          height="220"
          viewBox="0 0 180 220"
          fill="none"
        >
          <path
            d="M70 20h40"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M80 20v65L35 175c-8 14 2 30 18 30h74c16 0 26-16 18-30l-45-90V20"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M48 155c20 8 42 8 63 0"
            stroke="#38bdf8"
            strokeWidth="4"
          />
          <circle
            cx="70"
            cy="130"
            r="5"
            fill="#38bdf8"
          />
          <circle
            cx="100"
            cy="145"
            r="4"
            fill="#38bdf8"
          />
        </svg>
      </div>

      {/* Small floating circles */}
      <div className="hidden md:block absolute left-[20%] bottom-[15%] w-3 h-3 rounded-full bg-cyan-400/30" />
      <div className="hidden md:block absolute right-[25%] top-[12%] w-2 h-2 rounded-full bg-blue-400/40" />
      <div className="hidden md:block absolute right-[15%] bottom-[20%] w-4 h-4 rounded-full border border-cyan-400/20" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10 w-full max-w-[440px]">

        {/* ===================================================
    BRAND
==================================================== */}

<div className="flex flex-col items-center mb-7 -translate-y-3">
          {/* Logo */}
          <div className="relative mb-4">

            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-2xl" />

            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.75 3.1v5.72a2.25 2.25 0 0 1-.66 1.59L5 14.5" />
                <path d="M14.25 3.1v5.72c0 .6.24 1.17.66 1.59l4.89 4.89" />
                <path d="M5 14.5l-1.4 1.4c-1.23 1.23-.65 3.32 1.07 3.61 2.64.45 5.36.69 8.13.69s5.49-.24 8.14-.69c1.72-.29 2.3-2.38 1.07-3.61L19.8 15.3" />
                <path d="M7.5 17.5h9" />
              </svg>

            </div>
          </div>

          <h2 className="text-lg font-semibold text-white tracking-tight text-center">
            Lab Resource Utilization Platform
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <p className="text-xs text-slate-400 tracking-wide">
              SMART LAB RESOURCE MANAGEMENT
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>

        </div>

        {/* ===================================================
            LOGIN CARD
        ==================================================== */}

        <div className="relative">

          {/* Card glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-cyan-500/10 rounded-2xl blur-xl" />

          <div className="relative bg-[#0b1422]/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/40 px-7 py-8 sm:px-9">

            {/* Header */}

            <div className="text-center mb-7">

              <h1 className="text-2xl font-semibold text-white">
                Sign in to continue
              </h1>

              <p className="text-sm text-slate-400 mt-2">
                Access your laboratory resources and equipment.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div
                className="text-sm text-red-300 bg-red-950/40 border border-red-800/60 rounded-lg px-4 py-3 mb-5"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Google */}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-11 flex items-center justify-center gap-2.5 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 bg-[#111c2d] hover:bg-[#162338] hover:border-slate-600 active:bg-[#1a2940] transition"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}

            <div className="flex items-center gap-3 my-6">

              <div className="h-px flex-1 bg-slate-700" />

              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Or
              </span>

              <div className="h-px flex-1 bg-slate-700" />

            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="name@institution.edu"
                />

              </div>
              <br></br>
              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <Link
  to="/forgot-password"
  className="text-xs text-cyan-400 hover:text-cyan-300 transition"
>
  Forgot password?
</Link>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass + " pr-12"}
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon open={showPassword} />
                  </button>

                </div>

              </div>
              
              {/* REMEMBER ME */}

              <label className="flex items-center gap-2.5 cursor-pointer select-none">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-[#111c2d] text-cyan-500 focus:ring-cyan-500/30"
                />

                <span className="text-sm text-slate-400">
                  Remember me
                </span>

              </label>

              {/* SIGN IN */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

            </form>
    
            {/* Security indicator */}

            <div className="flex items-center justify-center gap-2 mt-6">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-emerald-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4"
                />
              </svg>

              <span className="text-xs text-slate-500">
                Secure laboratory resource management
              </span>

            </div>

          </div>

        </div>

<br></br>
        {/* ===================================================
            REGISTER
        ==================================================== */}

        <p className="text-sm text-slate-500 text-center mt-6">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition"
          >
            Create an account
          </Link>

        </p>

        {/* Footer */}

        <p className="text-[11px] text-slate-500 text-center mt-5">
          Laboratory Equipment • Resource Sharing • Utilization Analytics
        </p>

      </div>
    </div>
  );
}