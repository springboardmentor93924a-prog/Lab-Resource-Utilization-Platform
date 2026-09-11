import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: 1, label: "Researcher / Student" },
  { value: 2, label: "Lab Technician" },
  { value: 3, label: "Lab Manager" },
  { value: 4, label: "Department Head" },
  { value: 5, label: "Institution Administrator" },
  { value: 6, label: "System Administrator" },
];

const DEPARTMENTS = [
  { value: 1, label: "Computer Science" },
  { value: 2, label: "External Research Department" },
  { value: 3, label: "Mechanical Engineering" },
  { value: 4, label: "Electrical Engineering" },
  { value: 5, label: "Computer Science Engineering" },
  { value: 6, label: "Information Technology" },
  { value: 7, label: "CSE (AI & ML)" },
  { value: 8, label: "Civil Engineering" },
  { value: 9, label: "Electronics and Communication Engineering" },
  { value: 10, label: "Computer Science Engineering" },
  { value: 11, label: "Computer Science Engineering" },
];

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 1,
    departmentId: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function focusStyle(e) {
    e.target.style.borderColor = "#1557a8";
    e.target.style.boxShadow =
      "0 0 0 3px rgba(21,87,168,0.15)";
  }

  function blurStyle(e) {
    e.target.style.borderColor = "";
    e.target.style.boxShadow = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedName = form.fullName.trim();

    if (!trimmedName) {
      setError("Please enter your full name");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!form.departmentId) {
      setError("Please select a department");
      return;
    }

    // Split full name into firstName and lastName.
    const nameParts = trimmedName.split(/\s+/);

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Build the payload expected by RegisterRequest.
    const payload = {
      firstName,
      lastName,
      email: form.email.trim(),
      password: form.password,
      roleId: Number(form.role),
      departmentId: Number(form.departmentId),
    };

    setSubmitting(true);

    try {
      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not create account"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "text-slate-900 placeholder-gray-400 w-full h-12 px-4 border border-gray-300 rounded-lg text-sm transition focus:outline-none";

  const labelClass =
    "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        background:
          "linear-gradient(135deg, #0F1B2D 0%, #1e3a5f 50%, #0F1B2D 100%)",
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl px-10 pt-12 pb-10"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #1557a8, #0F1B2D)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Create your account
        </h1>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full name</label>

            <input
              required
              value={form.fullName}
              onChange={(e) =>
                update("fullName", e.target.value)
              }
              onFocus={focusStyle}
              onBlur={blurStyle}
              className={inputClass}
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>
              Institutional email
            </label>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
              onFocus={focusStyle}
              onBlur={blurStyle}
              className={inputClass}
              placeholder="name@institution.edu"
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-5">
            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    update("password", e.target.value)
                  }
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  className={inputClass}
                  placeholder="Password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>
                Confirm password
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={form.confirmPassword}
                  onChange={(e) =>
                    update(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  className={inputClass}
                  placeholder="Confirm password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className={labelClass}>Role</label>

            <select
              required
              value={form.role}
              onChange={(e) =>
                update("role", Number(e.target.value))
              }
              onFocus={focusStyle}
              onBlur={blurStyle}
              className={`${inputClass} bg-white`}
            >
              {ROLES.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                >
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>Department</label>

            <select
              required
              value={form.departmentId}
              onChange={(e) =>
                update("departmentId", e.target.value)
              }
              onFocus={focusStyle}
              onBlur={blurStyle}
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>
                Select a department
              </option>

              {DEPARTMENTS.map((department) => (
                <option
                  key={department.value}
                  value={department.value}
                >
                  {department.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 mt-2"
            style={{
              background:
                "linear-gradient(135deg, #1557a8, #0F1B2D)",
            }}
          >
            {submitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-sm text-gray-500 text-center mt-10">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold"
            style={{ color: "#1557a8" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
