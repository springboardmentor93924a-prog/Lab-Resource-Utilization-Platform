import "./Register.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
    departmentId: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

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
            departmentId: Number(formData.departmentId),
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
              onChange={handleChange
              }
            />

          </div>


          {/* Role */}

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

              <option value="1">Student</option>
  <option value="2">Lab Technician</option>
  <option value="3">Lab Manager</option>
  <option value="4">Department Head</option>
  <option value="5">Institution Administrator</option>
  <option value="6">System Administrator</option>
            </select>

          </div>


          {/* Department */}

          <div className="form-group">

            <label>Department</label>

            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Department
              </option>

              <option value="1">
                Computer Science and Business Systems
              </option>

              <option value="2">
                Computer Science and Engineering
              </option>

              <option value="3">
                Electronics and Communication Engineering
              </option>

              <option value="4">
                Information Technology
              </option>

            </select>

          </div>


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
