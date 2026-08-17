import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleRegisterUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "STUDENT", label: "Student" },
  { value: "RESEARCHER", label: "Researcher" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
  { value: "LAB_MANAGER", label: "Lab Manager" },
  { value: "DEPARTMENT_HEAD", label: "Department Head" },
  {
    value: "INSTITUTION_ADMIN",
    label: "Institution Administrator",
  },
];

export default function GoogleRegister() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("RESEARCHER");
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { persistGoogleResponse } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!institutionId.trim()) {
      setError("Institution is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await googleRegisterUser({
        fullName,
        role,
        institutionId,
        departmentId,
      });

      persistGoogleResponse(response);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google registration failed:", err);

      setError(
        err.response?.data?.message ||
          "Could not complete Google registration"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full h-11 px-4 border border-slate-700 rounded-md " +
    "text-sm text-slate-100 bg-[#0b1422]/90 " +
    "placeholder:text-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-cyan-400/30 " +
    "focus:border-cyan-400 transition";

  const labelClass =
    "block text-xs font-semibold text-slate-300 mb-2";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#02070d] flex items-center justify-center px-4">

      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Laboratory grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(51, 196, 255, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 196, 255, 0.18) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        {/* Left microscope */}
        <div className="absolute left-[7%] top-[28%] opacity-[0.13]">
          <svg
            width="190"
            height="230"
            viewBox="0 0 190 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M75 28H103V48H75V28Z"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M89 48V72"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <circle
              cx="89"
              cy="84"
              r="17"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M89 101C89 101 65 111 65 141V169"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M65 169H126"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M45 169H144"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M65 169V192"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M48 192H105"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M89 102L125 133"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M125 133H157"
              stroke="#39c6f4"
              strokeWidth="5"
            />
          </svg>
        </div>

        {/* Right laboratory flask */}
        <div className="absolute right-[7%] top-[27%] opacity-[0.13]">
          <svg
            width="190"
            height="250"
            viewBox="0 0 190 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M76 24H116"
              stroke="#39c6f4"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M86 24V89L42 177C34 194 47 211 66 211H126C145 211 158 194 150 177L106 89V24"
              stroke="#39c6f4"
              strokeWidth="5"
            />
            <path
              d="M52 166C77 151 109 180 145 159"
              stroke="#39c6f4"
              strokeWidth="4"
            />
            <circle
              cx="77"
              cy="148"
              r="5"
              fill="#39c6f4"
            />
            <circle
              cx="119"
              cy="177"
              r="4"
              fill="#39c6f4"
            />
            <circle
              cx="101"
              cy="137"
              r="3"
              fill="#39c6f4"
            />
          </svg>
        </div>

        {/* Small decorative equipment circles */}
        <div className="absolute left-[20%] bottom-[20%] w-3 h-3 rounded-full bg-cyan-400 opacity-20" />
        <div className="absolute right-[22%] bottom-[25%] w-4 h-4 rounded-full border border-cyan-400 opacity-20" />
        <div className="absolute left-[16%] top-[20%] w-2 h-2 rounded-full bg-blue-400 opacity-20" />
        <div className="absolute right-[19%] top-[20%] w-2 h-2 rounded-full bg-cyan-400 opacity-20" />

        {/* Background glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.035] rounded-full blur-3xl" />
      </div>

      {/* =========================================================
          MAIN CARD
      ========================================================== */}

      <div className="relative z-10 w-full max-w-[440px]">

        <div className="text-center mb-6">

          <h1 className="text-lg font-semibold text-cyan-300">
            Lab Resource Utilization Platform
          </h1>

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />

            <p className="text-[11px] tracking-wide text-slate-500 uppercase">
              Smart Laboratory Resource Management
            </p>

            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>

        </div>

        <div className="bg-[#07101c]/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl px-7 py-7">

          {/* Header */}

          <div className="text-center mb-6">

            <h2 className="text-2xl font-bold text-white">
              Complete your account
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Set up your profile to continue
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="text-sm text-red-300 bg-red-950/40 border border-red-800/60 rounded-md px-3.5 py-2.5 mb-5">
              {error}
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Full Name */}

            <div>
              <label className={labelClass}>
                Full Name
              </label>

              <input
                type="text"
                required
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            {/* Role */}

            <div>
              <label className={labelClass}>
                Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className={inputClass}
              >
                {ROLES.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    className="bg-[#07101c] text-white"
                  >
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution */}

            <div>
              <label className={labelClass}>
                Institution
              </label>

              <input
                type="text"
                required
                value={institutionId}
                onChange={(e) =>
                  setInstitutionId(e.target.value)
                }
                placeholder="e.g. IIT Bombay"
                className={inputClass}
              />
            </div>

            {/* Department */}

            <div>
              <label className={labelClass}>
                Department
                <span className="text-slate-600 ml-1 font-normal">
                  (optional)
                </span>
              </label>

              <input
                type="text"
                value={departmentId}
                onChange={(e) =>
                  setDepartmentId(e.target.value)
                }
                placeholder="e.g. Computer Science"
                className={inputClass}
              />
            </div>

            {/* Extra gap before button */}

            <div className="pt-3">

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-md hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-500/10"
              >
                {submitting
                  ? "Creating account..."
                  : "Complete registration"}
              </button>

            </div>

          </form>

          {/* Footer */}

          <div className="flex items-center justify-center gap-2 mt-5">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
              />
            </svg>

            <span className="text-[11px] text-slate-600">
              Secure laboratory resource management
            </span>

          </div>

        </div>

        <p className="text-center text-[11px] text-slate-600 mt-4">
          Laboratory Equipment • Resource Sharing • Utilization Analytics
        </p>

      </div>

    </div>
  );
}