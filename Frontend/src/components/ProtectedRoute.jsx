import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  const userData = localStorage.getItem("user");

  // =========================================================
  // USER IS NOT LOGGED IN
  // =========================================================

  if (!token || !userData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // =========================================================
  // USER IS LOGGED IN
  // =========================================================

  return children;
}

export default ProtectedRoute;