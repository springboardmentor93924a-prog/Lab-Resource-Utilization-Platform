import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "STUDENT",
    institutionId: "",
    departmentId: "",
  });
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch institutions on component mount
  useEffect(() => {
    api
      .get("/institutions")
      .then((r) => setInstitutions(r.data || []))
      .catch((err) => {
        console.error("Failed to fetch institutions:", err);
        setInstitutions([]);
      });
  }, []);

  // Fetch departments when institution changes
  useEffect(() => {
    if (!form.institutionId) return;
    api
      .get(`/departments/institution/${form.institutionId}`)
      .then((r) => setDepartments(r.data || []))
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
        setDepartments([]);
      });
  }, [form.institutionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "institutionId") {
      // Switching institution invalidates the previous department list
      setDepartments([]);
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-visual register-visual">
        <div className="brand-mark">RU</div>
        <div>
          <span className="eyebrow">JOIN RESOURCEHUB</span>
          <h1>One workspace for every resource.</h1>
          <p>
            Create your account and make institutional equipment easier to
            discover, book and manage.
          </p>
          <div className="benefit-list">
            <div>
              <b>01</b>
              <span>
                <strong>Discover</strong>
                <small>Find available equipment quickly.</small>
              </span>
            </div>
            <div>
              <b>02</b>
              <span>
                <strong>Book</strong>
                <small>Plan research time without conflicts.</small>
              </span>
            </div>
            <div>
              <b>03</b>
              <span>
                <strong>Track</strong>
                <small>Stay informed about asset status.</small>
              </span>
            </div>
          </div>
        </div>
        <small>Secure access • Role-based permissions</small>
      </section>
      <section className="auth-panel">
        <form className="pro-auth-card register-card" onSubmit={handleSubmit}>
          <span className="eyebrow dark">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="subtext">
            Use your institutional details to set up your profile.
          </p>
          {error && <div className="pro-alert">⚠ {error}</div>}
          <div className="form-grid">
            <div>
              <label>First name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label>Last name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
            <div className="full">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@institution.edu"
                required
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <div>
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="STUDENT">Researcher / Student</option>
                <option value="TECHNICIAN">Lab Technician</option>
                <option value="LAB_MANAGER">Lab Manager</option>
                <option value="FACULTY">Department Head</option>
                <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                <option value="SUPER_ADMIN">System Administrator</option>
              </select>
            </div>
            <div>
              <label>Institution</label>
              <select
                name="institutionId"
                value={form.institutionId}
                onChange={handleChange}
                required
              >
                <option value="">Select institution</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Department</label>
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
                disabled={!form.institutionId}
              >
                <option value="">
                  {form.institutionId
                    ? departments.length > 0
                      ? "Select department"
                      : "No departments available"
                    : "Select institution first"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="full">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength="8"
                required
              />
            </div>
          </div>
          <button
            className="btn btn-primary w-100 mt-4"
            type="submit"
            disabled={loading || !form.institutionId || !form.departmentId}
          >
            {loading ? "Creating account…" : "Create account →"}
          </button>
          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
