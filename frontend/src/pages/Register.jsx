import "./Register.css";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
    institutionId: "",
    departmentId: "",
  });

  const [roles, setRoles] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRole = roles.find(
    (r) => r.roleId === Number(formData.roleId)
  );
  const selectedRoleName = selectedRole ? selectedRole.roleName : "";
  const isInstitutionAdmin = selectedRoleName === "INSTITUTION_ADMIN";

  // Fetch roles and institutions once on mount
  useEffect(() => {
    fetch("http://localhost:8080/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error fetching roles:", err));

    fetch("http://localhost:8080/api/institutions")
      .then((res) => res.json())
      .then((data) => setInstitutions(data))
      .catch((err) => console.error("Error fetching institutions:", err));
  }, []);

  // Fetch departments only for the selected institution
  useEffect(() => {
    if (!formData.institutionId) {
      setDepartments([]);
      return;
    }

    fetch(
      `http://localhost:8080/api/institutions/${formData.institutionId}/departments`
    )
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));
  }, [formData.institutionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "institutionId") {
      // Changing institution invalidates any previously chosen department
      setFormData({
        ...formData,
        institutionId: value,
        departmentId: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            roleId: Number(formData.roleId),
            institutionId: Number(formData.institutionId),
            departmentId: isInstitutionAdmin
              ? null
              : Number(formData.departmentId),
          }),
        }
      );

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Registration failed"
        );
      }

      alert("Registration successful! Please login.");
      navigate("/");

    } catch (error) {
      setError(
        error.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">
          Lab Resource Utilization Platform
        </h1>
        <p className="subtitle">
          Create your account
        </p>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Role (Dynamic Mapping) */}
          <div className="form-group">
            <label>Role</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Role
              </option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>

          {/* Institution (Dynamic Mapping) */}
          <div className="form-group">
            <label>Institution</label>
            <select
              name="institutionId"
              value={formData.institutionId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Institution
              </option>
              {institutions.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>

          {/* Department (Dynamic Mapping, filtered by Institution) */}
          {!isInstitutionAdmin && (
            <div className="form-group">
            <label>Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
              disabled={!formData.institutionId}
            >
              <option value="">
                {formData.institutionId
                  ? "Select Department"
                  : "Select an institution first"}
              </option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>
)}

          {/* Register Button */}
          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "REGISTERING..."
              : "REGISTER"}
          </button>
        </form>

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;