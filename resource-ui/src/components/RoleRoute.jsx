import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Unauthorized from "../pages/Unauthorized";

function RoleRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Unauthorized />;
    }

    return children;
}

export default RoleRoute;
