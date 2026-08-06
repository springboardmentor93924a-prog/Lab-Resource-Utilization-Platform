import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext();

const normalizeRole = (value) => {
    if (!value) return "";

    return String(value)
        .trim()
        .toUpperCase()
        .replace(/^ROLE_/, "")
        .replace(/\s+/g, "_");
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        if (token) {
            return {
                token,
                role: localStorage.getItem("role"),
                userId: localStorage.getItem("userId"),
                name: localStorage.getItem("name"),
                email: localStorage.getItem("email"),
                institutionId: localStorage.getItem("institutionId"),
                departmentId: localStorage.getItem("departmentId"),
            };
        }
        return null;
    });
    const loading = false;

    useEffect(() => {
        // Sync handled in state
    }, []);

    const login = async (credentials) => {
        const response = await loginUser(credentials);

        const token = response.token || response.accessToken || response.jwt || "";
        const actualToken = token || (response.user && response.user.token) || "mock-token";
        const userData = response.user || response;
        const normalizedRole = normalizeRole(userData.role || credentials?.role || "");

        localStorage.setItem("token", actualToken);
        localStorage.setItem("role", normalizedRole || "");
        localStorage.setItem("userId", userData.userId || userData.id || "");
        localStorage.setItem("name", userData.name || userData.firstName || "User");
        localStorage.setItem("email", userData.email || credentials.email);
        localStorage.setItem("institutionId", userData.institutionId || "");
        localStorage.setItem("departmentId", userData.departmentId || "");

        setUser({
            token: actualToken,
            role: normalizedRole,
            userId: userData.userId || userData.id,
            name: userData.name || userData.firstName,
            email: userData.email || credentials.email,
            institutionId: userData.institutionId,
            departmentId: userData.departmentId
        });

        return response;
    };

    const logout = () => {
        const devMode = localStorage.getItem("devMode");
        localStorage.clear();
        if (devMode) localStorage.setItem("devMode", devMode);
        setUser(null);
    };

    const role = normalizeRole(user?.role);
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isAdmin = role === "ADMIN";

    const hasRole = (allowedRoles = []) => {
        if (!allowedRoles.length) return true;
        const normalizedAllowedRoles = allowedRoles.map((item) => normalizeRole(item));
        return normalizedAllowedRoles.includes(role);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
                isSuperAdmin,
                isAdmin,
                hasRole,
                role,
                roleLabel: role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : "User"
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}