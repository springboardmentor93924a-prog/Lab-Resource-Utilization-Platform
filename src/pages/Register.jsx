import { useEffect, useState } from "react";
import "./Register.css";
import { useAuth } from "../context/AuthContext";
import { getAllInstitutions } from "../api/institutionApi";
import { getDepartmentsByInstitution } from "../api/departmentApi";
import { extractErrorMessage } from "../api/client";
import { ROLES, ROLE_LABELS } from "../utils/constants";

function Register({ onLogin }) {
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // GET /api/institutions is public - powers the registration dropdown.
  useEffect(() => {
    getAllInstitutions()
      .then(setInstitutions)
      .catch(() => setInstitutions([]));
  }, []);

  // GET /api/departments/institution/{id} is public - dependent dropdown.
  useEffect(() => {
    if (!institutionId) {
      setDepartments([]);
      setDepartmentId("");
      return;
    }
    getDepartmentsByInstitution(institutionId)
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, [institutionId]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!role) {
      setMessage("Please select your role.");
      setIsSuccess(false);
      return;
    }

    setSubmitting(true);
    try {
      // RegisterRequestDTO: firstName, lastName, email, password, phone, role,
      // institutionId, departmentId
      await register({
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        institutionId: institutionId ? Number(institutionId) : null,
        departmentId: departmentId ? Number(departmentId) : null,
      });

      setMessage(
        "Registration successful! Your account may need admin approval before you can log in."
      );
      setIsSuccess(true);

      setTimeout(() => {
        if (onLogin) onLogin();
      }, 1800);
    } catch (error) {
      setMessage(extractErrorMessage(error, "Registration failed. Please try again."));
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-brand">
          <div className="register-brand-icon">LR</div>
          <h1>Lab Resource Platform</h1>
          <p>Laboratory Resource Utilization Platform</p>
        </div>

        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">
          Create your account to access laboratory resources
        </p>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-field">
            <label>First Name</label>
            <input
              className="register-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="register-field">
            <label>Last Name</label>
            <input
              className="register-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="register-field">
            <label>Email Address</label>
            <input
              className="register-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="register-field">
            <label>Phone</label>
            <input
              className="register-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone number"
              maxLength={10}
            />
          </div>

          <div className="register-field">
            <label>Password</label>
            <input
              className="register-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="register-field">
            <label>Select Role</label>
            <select
              className="register-input register-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="register-field">
            <label>Institution</label>
            <select
              className="register-input register-select"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
            >
              <option value="">Select institution</option>
              {institutions.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>

          <div className="register-field">
            <label>Department</label>
            <select
              className="register-input register-select"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={!institutionId}
            >
              <option value="">
                {institutionId ? "Select department" : "Select an institution first"}
              </option>
              {departments.map((dept) => (
                <option key={dept.departId} value={dept.departId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          <button className="register-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p className={`register-message ${isSuccess ? "success" : "error"}`}>{message}</p>
        )}

        <div className="register-login">
          <span>Already have an account?</span>
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
