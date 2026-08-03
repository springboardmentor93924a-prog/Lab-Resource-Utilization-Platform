import { useState } from "react";
import "../styles/register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-container">
      <div className="register-card">

        <h1>Create Account</h1>
        <p>Register to access the Lab Resource Utilization Platform</p>

        <form>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Register Number</label>
            <input
              type="text"
              placeholder="Enter your register number"
            />
          </div>

          <div className="input-group">
            <label>Department</label>

            <select>
              <option>Select Department</option>
              <option>AI & DS</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>
          </div>

          <div className="input-group">
            <label>Password</label>

            <div className="password-box">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
              />

              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          <button className="register-btn">
            Create Account
          </button>

        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>

      </div>
    </div>
  );
}

export default Register;