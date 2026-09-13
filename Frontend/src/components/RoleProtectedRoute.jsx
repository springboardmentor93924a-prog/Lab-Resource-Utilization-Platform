import { Navigate, useLocation } from "react-router-dom";

function RoleProtectedRoute({
  allowedRoles = [],
  children,
}) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  // =========================================================
  // AUTHENTICATION CHECK
  // =========================================================

  if (!token || !storedUser) {
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
  // PARSE USER DATA
  // =========================================================

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Invalid user data:",
      error
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =========================================================
  // GET ROLE
  // =========================================================

  const role = (
    user?.role ||
    user?.user?.role ||
    ""
  )
    .toString()
    .toUpperCase();

  // =========================================================
  // ROLE AUTHORIZATION CHECK
  // =========================================================

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // =========================================================
  // ACCESS GRANTED
  // =========================================================

  return children;
}

export default RoleProtectedRoute;