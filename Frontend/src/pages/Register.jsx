import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  // -----------------------------
  // State
  // -----------------------------

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "RESEARCHER",
    institutionId: "",
    departmentId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // -----------------------------
  // Load institutions
  // -----------------------------

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
  try {
    setLoadingInstitutions(true);
    setError("");

    const response = await api.get("/institutions");

    console.log("FULL INSTITUTION RESPONSE:", response);
    console.log("INSTITUTION DATA:", response.data);

    let institutionData = [];

    // Case 1:
    // Backend returns:
    // [
    //   { id: 1, name: "..." }
    // ]
    if (Array.isArray(response.data)) {
      institutionData = response.data;
    }

    // Case 2:
    // Backend returns:
    // {
    //   data: [
    //     { id: 1, name: "..." }
    //   ]
    // }
    else if (Array.isArray(response.data?.data)) {
      institutionData = response.data.data;
    }

    // Case 3:
    // Backend returns:
    // {
    //   institutions: [
    //     { id: 1, name: "..." }
    //   ]
    // }
    else if (
      Array.isArray(response.data?.institutions)
    ) {
      institutionData = response.data.institutions;
    }

    // Case 4:
    // Backend returns:
    // {
    //   content: [
    //     { id: 1, name: "..." }
    //   ]
    // }
    else if (
      Array.isArray(response.data?.content)
    ) {
      institutionData = response.data.content;
    }

    // Final check
    if (institutionData.length > 0) {

      console.log(
        "Institutions loaded successfully:",
        institutionData
      );

      setInstitutions(institutionData);
      setError("");

    } else {

      console.error(
        "No institution array found:",
        response.data
      );

      setInstitutions([]);

      setError(
        "No institutions found. Please add institutions to the database."
      );
    }

  } catch (err) {

    console.error(
      "Institution API error:",
      err
    );

    setInstitutions([]);

    if (err.response) {

      console.error(
        "Status:",
        err.response.status
      );

      console.error(
        "Backend response:",
        err.response.data
      );

      setError(
        `Unable to load institutions. Server error ${err.response.status}.`
      );

    } else {

      setError(
        "Unable to connect to Spring Boot. Make sure the backend is running on port 8080."
      );
    }

  } finally {

    setLoadingInstitutions(false);
  }
};

  // -----------------------------
  // Input change
  // -----------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    // Remove old messages when user starts typing
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // -----------------------------
  // Institution change
  // -----------------------------

  const handleInstitutionChange = async (e) => {
    const institutionId = e.target.value;

    setForm((previousForm) => ({
      ...previousForm,
      institutionId: institutionId,
      departmentId: "",
    }));

    // Clear previous departments
    setDepartments([]);

    if (!institutionId) {
      return;
    }

    /*
     * Department API will be connected here.
     *
     * For now departments remain empty until
     * the Spring Boot department endpoint is added.
     */

    try {
      const response = await api.get(
        `/departments/institution/${institutionId}`
      );

      console.log(
        "Departments API response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
        console.warn(
          "Department response is not an array."
        );
      }
    } catch (err) {
      /*
       * Don't display a registration error just because
       * the department endpoint has not been created yet.
       */
      console.warn(
        "Department API not available:",
        err
      );

      setDepartments([]);
    }
  };

  // -----------------------------
  // Register
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!form.institutionId) {
      setError("Please select an institution.");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,

        institutionId: Number(
          form.institutionId
        ),

        departmentId: form.departmentId
          ? Number(form.departmentId)
          : null,
      };

      console.log(
        "Registration request:",
        requestData
      );

      const response = await api.post(
        "/auth/register",
        requestData
      );

      console.log(
        "Registration response:",
        response.data
      );

      const data = response.data;

      /*
       * Save JWT only if backend actually returns one.
       */
      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      setSuccess(
        "Registration successful!"
      );

      /*
       * Redirect after successful registration.
       */
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      if (err.response) {
        console.error(
          "Status:",
          err.response.status
        );

        console.error(
          "Response:",
          err.response.data
        );

        if (
          typeof err.response.data ===
          "string"
        ) {
          setError(
            err.response.data
          );
        } else if (
          err.response.data?.message
        ) {
          setError(
            err.response.data.message
          );
        } else {
          setError(
            "Registration failed. Please check your details."
          );
        }
      } else {
        setError(
          "Unable to connect to the backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="auth-page">

      <div className="auth-card register-card">

        {/* Header */}

        <div className="auth-header">

          <div className="logo-circle">
            LR
          </div>

          <h1>
            Create Account
          </h1>

          <p>
            Register for the Lab Resource Platform
          </p>

        </div>

        {/* Form */}

        <form onSubmit={handleSubmit}>

          {/* Error */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* Full Name */}

          <div className="form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />

          </div>

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />

          </div>

          {/* Role */}

          <div className="form-group">

            <label htmlFor="role">
              Role
            </label>

            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >

              <option value="RESEARCHER">
                Researcher
              </option>

              <option value="LAB_TECHNICIAN">
                Lab Technician
              </option>

              <option value="LAB_MANAGER">
                Lab Manager
              </option>

              <option value="DEPARTMENT_HEAD">
                Department Head
              </option>

              <option value="INSTITUTION_ADMIN">
                Institution Administrator
              </option>

              <option value="SYSTEM_ADMIN">
                System Administrator
              </option>

            </select>

          </div>

          {/* Institution */}

          <div className="form-group">

            <label htmlFor="institutionId">
              Institution
            </label>

            <select
              id="institutionId"
              name="institutionId"
              value={form.institutionId}
              onChange={handleInstitutionChange}
              disabled={loadingInstitutions}
              required
            >

              <option value="">
                {loadingInstitutions
                  ? "Loading institutions..."
                  : "Select institution"}
              </option>

              {Array.isArray(institutions) &&
                institutions.map(
                  (institution) => (
                    <option
                      key={institution.id}
                      value={institution.id}
                    >
                      {institution.name}
                    </option>
                  )
                )}

            </select>

          </div>

          {/* Department */}

          <div className="form-group">

            <label htmlFor="departmentId">
              Department
            </label>

            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={
                !form.institutionId ||
                departments.length === 0
              }
            >

              <option value="">
                {!form.institutionId
                  ? "Select institution first"
                  : departments.length === 0
                  ? "No departments available"
                  : "Select department"}
              </option>

              {Array.isArray(departments) &&
                departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  )
                )}

            </select>

          </div>

          {/* Submit */}

          <button
            type="submit"
            className="auth-button"
            disabled={
              loading ||
              loadingInstitutions
            }
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>

        {/* Footer */}

        <div className="auth-footer">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign In
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;