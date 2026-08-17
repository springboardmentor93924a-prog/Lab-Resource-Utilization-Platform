import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "STUDENT", label: "Student" },
  { value: "RESEARCHER", label: "Researcher" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
  { value: "LAB_MANAGER", label: "Lab Manager" },
  { value: "DEPARTMENT_HEAD", label: "Department Head" },
  { value: "INSTITUTION_ADMIN", label: "Institution Administrator" },
];

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

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "RESEARCHER",
    institutionId: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
  const payload = { ...form };
  delete payload.confirmPassword;

  await register(payload);
  navigate("/dashboard");
} catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full h-11 px-4 border border-slate-700 rounded-md text-sm text-slate-100 bg-slate-900/80 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition";

  const labelClass =
    "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-[#020914] px-4 py-10">

      {/* =====================================================
          LAB BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,120,150,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(45,120,150,0.12) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />

        {/* Blue glow - left */}
        <div className="absolute -left-40 top-20 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Blue glow - right */}
        <div className="absolute -right-40 bottom-0 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />

        {/* Microscope */}
        <svg
          className="absolute left-[8%] top-[22%] w-40 h-40 text-cyan-900/60"
          fill="none"
          viewBox="0 0 120 120"
        >
          <path
            stroke="currentColor"
            strokeWidth="3"
            d="M37 21h20v16H37zM47 37v22M47 59c-17 0-29 10-29 27h58M29 86h50M47 59c0 9-8 15-17 15M47 59c0 9 8 15 17 15"
          />
          <circle
            cx="47"
            cy="59"
            r="6"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>

        {/* Flask */}
        <svg
          className="absolute right-[8%] top-[22%] w-40 h-40 text-blue-900/60"
          fill="none"
          viewBox="0 0 120 120"
        >
          <path
            stroke="currentColor"
            strokeWidth="3"
            d="M48 12h24M54 12v35L29 91c-4 7 1 15 9 15h44c8 0 13-8 9-15L66 47V12"
          />
          <path
            stroke="currentColor"
            strokeWidth="3"
            d="M38 76c12 6 31 6 44 0"
          />
          <circle cx="49" cy="69" r="3" fill="currentColor" />
          <circle cx="72" cy="61" r="3" fill="currentColor" />
        </svg>

        {/* Decorative dots */}
        <div className="absolute left-[20%] bottom-[15%] w-3 h-3 rounded-full bg-cyan-500/40" />
        <div className="absolute right-[23%] bottom-[20%] w-2 h-2 rounded-full bg-blue-400/50" />
        <div className="absolute right-[25%] top-[12%] w-2 h-2 rounded-full bg-blue-400/50" />

      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10 w-full max-w-[470px]">

        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="flex flex-col items-center mb-5 -translate-y-2">

          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-2">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.7}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.696L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>

          </div>

          {/* Platform name */}
          <h2 className="text-lg font-bold text-white tracking-tight">
            Lab Resource Utilization Platform
          </h2>

          {/* Subtitle */}
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />

            <span className="text-xs font-medium text-slate-400 tracking-wide">
              SMART LAB RESOURCE MANAGEMENT
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>

        </div>

        {/* =====================================================
            REGISTER CARD
        ====================================================== */}

        <div className="bg-[#081321]/95 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 px-7 py-6">

          <h1 className="text-2xl font-bold text-center text-white">
            Create your account
          </h1>

          <p className="text-sm text-slate-400 text-center mt-1 mb-5">
            Join your laboratory resource network.
          </p>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-300 bg-red-950/40 border border-red-800/60 rounded-md px-3.5 py-2.5 mb-5">
              {error}
            </p>
          )}

          {/* =====================================================
              FORM
          ====================================================== */}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full name */}
            <div>
              <label className={labelClass}>
                Full name
              </label>

              <input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
          <br></br>
            {/* Email */}
            <div>
              <label className={labelClass}>
                Institutional email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
                placeholder="name@institution.edu"
              />
            </div>
            <br></br>
            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">

              {/* Password */}
              <div>
                <label className={labelClass}>
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={inputClass + " pr-10"}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>

                </div>
              </div>
              
              {/* Confirm password */}
              <div>
                <label className={labelClass}>
                  Confirm password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) =>
                      update("confirmPassword", e.target.value)
                    }
                    className={inputClass + " pr-10"}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showConfirmPassword} />
                  </button>

                </div>
              </div>

            </div>
            <br></br>
            {/* Role */}
            <div>
              <label className={labelClass}>
                Role
              </label>

              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className={inputClass}
              >
                {ROLES.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    className="bg-slate-900 text-white"
                  >
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          <br></br>
            {/* Institution */}
            <div>
              <label className={labelClass}>
                Institution
              </label>

              <input
                required
                value={form.institutionId}
                onChange={(e) =>
                  update("institutionId", e.target.value)
                }
                placeholder="e.g. IIT Bombay"
                className={inputClass}
              />
            </div>
          <br></br>
            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-md hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 transition shadow-lg shadow-cyan-500/10 mt-2"
            >
              {submitting
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          {/* Security text */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
              />
            </svg>

            Secure laboratory resource management

          </div>

        </div>
  
     <br></br>
        {/* =====================================================
            FOOTER
        ====================================================== */}

        <p className="text-sm text-slate-500 text-center mt-5">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-cyan-400 font-semibold hover:text-cyan-300 transition"
          >
            Sign in
          </Link>

        </p>

        <p className="text-xs text-slate-600 text-center mt-2">
          Laboratory Equipment • Resource Sharing • Utilization Analytics
        </p>

      </div>

    </div>
  );
}