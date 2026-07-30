import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary navigation
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">


        <h1 className="title">
          Lab Resource Utilization Platform
        </h1>

        <p className="subtitle">
          Sign in to continue
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="options">

            <label className="remember">
              <input type="checkbox" />
              Remember Me
            </label>

            <a href="/">Forgot Password?</a>

          </div>

          <button className="login-btn" type="submit">
            LOGIN
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;