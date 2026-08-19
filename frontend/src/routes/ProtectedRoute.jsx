import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles
}) {

  const token =
    sessionStorage.getItem("token");

  const role =
    sessionStorage.getItem("role");


  // User is not logged in
  if (!token) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  // User does not have permission
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  return children;
}

export default ProtectedRoute;