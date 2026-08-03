import { useState } from "react";
import "../styles/login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">

      <div className="login-card">

        <h1>Welcome Back 👋</h1>

        <p>Login to access the Lab Resource Utilization Platform</p>

        <form>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">

            <label>Password</label>

            <div className="password-box">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <div className="login-options">

            <label>
              <input type="checkbox" />
              Remember Me
            </label>

            <a href="#">Forgot Password?</a>

          </div>

          {/* Google Login Button */}

          <button type="button" className="google-btn">

            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />

            Continue with Google

          </button>

          <button className="login-btn">
            Login
          </button>

        </form>

        <p className="register-link">
          Don't have an account? <a href="/register">Register</a>
        </p>

      </div>

    </div>
  );
}

export default Login;