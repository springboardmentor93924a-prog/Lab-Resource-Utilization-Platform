import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "RESEARCHER", label: "Researcher / Student" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
  { value: "LAB_MANAGER", label: "Lab Manager" },
  { value: "DEPARTMENT_HEAD", label: "Department Head" },
  { value: "INSTITUTION_ADMIN", label: "Institution Administrator" },
];

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
      // eslint-disable-next-line no-unused-vars
const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8">
        <h1 className="text-lg font-semibold text-center text-gray-900 mb-6">
          Create your account
        </h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Institutional email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Confirm password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Institution</label>
            <input
              required
              value={form.institutionId}
              onChange={(e) => update("institutionId", e.target.value)}
              placeholder="e.g. IIT Bombay"
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}