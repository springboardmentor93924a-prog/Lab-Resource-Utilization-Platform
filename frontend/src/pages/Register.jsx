import "./Register.css";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Special dropdown value: an Institution Admin whose college isn't in the
// list yet. The System Admin creates the college when approving.
const NEW_COLLEGE = "__new__";

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
    newInstitutionName: "",
    newInstitutionLocation: "",
  });

  const [roles, setRoles] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const selectedRole = roles.find(
  (role) => String(role.roleId) === String(formData.roleId)
);

// Real-world scoping, matching UserService.registerUserInternal on the
// backend: SYSTEM_ADMIN is platform-wide (no institution, no department),
// INSTITUTION_ADMIN oversees one whole institution (institution, no
// department), everyone else is scoped to one department inside one
// institution (both required). Until a role is picked, default to
// requiring both, since that's true for the majority of roles.
const roleName = selectedRole?.roleName;
const isSystemAdmin = roleName === "SYSTEM_ADMIN";
const isInstitutionAdmin = roleName === "INSTITUTION_ADMIN";
const needsInstitution = !isSystemAdmin;
const needsDepartment = !isSystemAdmin && !isInstitutionAdmin;
  // Fetch roles and institutions once on mount
  useEffect(() => {

  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/roles`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load roles");
      }
      return res.json();
    })
    .then((data) => {
      // System Admin can never be self-registered - it is created by the
      // platform owner only, so it is not offered here.
      setRoles(
        Array.isArray(data)
          ? data.filter((r) => String(r.roleName).toUpperCase() !== "SYSTEM_ADMIN")
          : []
      );
    })
    .catch((err) => {
      console.error("Error fetching roles:", err);
      setRoles([]);
    });

  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/institutions`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load institutions");
      }
      return res.json();
    })
    .then((data) => {
      setInstitutions(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.error("Error fetching institutions:", err);
      setInstitutions([]);
    });

}, []); 

  // Fetch departments only for the selected institution
  useEffect(() => {

  if (!formData.institutionId || formData.institutionId === NEW_COLLEGE) {
    //setDepartments([]); if required remove slashes
    return;
  }

  fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/institutions/${formData.institutionId}/departments`
  )
    .then((res) => {

      if (!res.ok) {
        throw new Error("Failed to load departments");
      }

      return res.json();
    })
    .then((data) => {

      setDepartments(
        Array.isArray(data) ? data : []
      );

    })
    .catch((err) => {

      console.error(
        "Error fetching departments:",
        err
      );

      setDepartments([]);
    });

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
    } else if (name === "roleId") {
      const nextRole = roles.find((role) => String(role.roleId) === String(value));
      const nextIsSystemAdmin = nextRole?.roleName === "SYSTEM_ADMIN";

      // SYSTEM_ADMIN is platform-wide — drop any institution/department
      // picked while a different role was selected, so stale IDs never
      // get submitted for a role that shouldn't have them.
      setFormData({
        ...formData,
        roleId: value,
        institutionId:
          nextIsSystemAdmin || (nextRole?.roleName !== "INSTITUTION_ADMIN" && formData.institutionId === NEW_COLLEGE)
            ? ""
            : formData.institutionId,
        departmentId: nextIsSystemAdmin ? "" : formData.departmentId,
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

    const requestingNewCollege = formData.institutionId === NEW_COLLEGE;

    if (requestingNewCollege && !formData.newInstitutionName.trim()) {
      setError("Please enter your college name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
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
            institutionId: needsInstitution && formData.institutionId && !requestingNewCollege
              ? Number(formData.institutionId)
              : null,
            newInstitutionName: requestingNewCollege ? formData.newInstitutionName.trim() : null,
            newInstitutionLocation: requestingNewCollege ? formData.newInstitutionLocation.trim() : null,
            departmentId: needsDepartment && formData.departmentId
              ? Number(formData.departmentId)
              : null,
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

      alert(
        (typeof data === "object" && data?.message) ||
          "Registration successful! You can log in now."
      );
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

          {/* Institution (Dynamic Mapping) — hidden for SYSTEM_ADMIN, who
              is platform-wide and isn't tied to a single institution */}
          {needsInstitution && (
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
                {isInstitutionAdmin && (
                  <option value={NEW_COLLEGE}>
                    My college is not listed - request to add it
                  </option>
                )}
              </select>
            </div>
          )}

          {needsInstitution && isInstitutionAdmin && formData.institutionId === NEW_COLLEGE && (
            <>
              <div className="form-group">
                <label>College Name</label>
                <input
                  type="text"
                  name="newInstitutionName"
                  value={formData.newInstitutionName}
                  onChange={handleChange}
                  placeholder="Full name of your college"
                  maxLength={150}
                  required
                />
              </div>
              <div className="form-group">
                <label>College Location (optional)</label>
                <input
                  type="text"
                  name="newInstitutionLocation"
                  value={formData.newInstitutionLocation}
                  onChange={handleChange}
                  placeholder="City, State"
                  maxLength={200}
                />
              </div>
              <p style={{ color: "#555", fontSize: "0.9em", margin: "4px 0 12px" }}>
                Your college will be created for you. Add its departments
                from the Departments page after you log in.
              </p>
            </>
          )}

          {isSystemAdmin && (
            <p style={{ color: "#555", fontSize: "0.9em", margin: "4px 0 12px" }}>
              System Admin accounts are platform-wide and aren't tied to a
              specific institution or department.
            </p>
          )}

          {/* Department (Dynamic Mapping, filtered by Institution) —
              hidden for INSTITUTION_ADMIN (oversees the whole institution,
              not one department) and SYSTEM_ADMIN (platform-wide) */}
          {needsDepartment && (
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
        <option
          key={dept.departmentId}
          value={dept.departmentId}
        >
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