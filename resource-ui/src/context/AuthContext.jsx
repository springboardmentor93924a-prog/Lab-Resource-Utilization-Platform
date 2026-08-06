import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext();

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

        // Based on typical spring boot responses, token is either token, accessToken, or jwt
        const token = response.token || response.accessToken || response.jwt || "";

        if (!token) {
            // For devMode fallback if token is in user object
            if (response.user && response.user.token) {
                // fallthrough
            } else if (!response.token) {
                 console.warn("Token not explicitly returned, checking response structure", response);
            }
        }

        const actualToken = token || (response.user && response.user.token) || "mock-token";
        const userData = response.user || response; // Sometimes backend nests user info

        localStorage.setItem("token", actualToken);
        localStorage.setItem("role", userData.role || "");
        localStorage.setItem("userId", userData.userId || userData.id || "");
        localStorage.setItem("name", userData.name || userData.firstName || "User");
        localStorage.setItem("email", userData.email || credentials.email);
        localStorage.setItem("institutionId", userData.institutionId || "");
        localStorage.setItem("departmentId", userData.departmentId || "");

        setUser({
            token: actualToken,
            role: userData.role,
            userId: userData.userId || userData.id,
            name: userData.name || userData.firstName,
            email: userData.email || credentials.email,
            institutionId: userData.institutionId,
            departmentId: userData.departmentId
        });

        return response;
    };

    const logout = () => {
        // Keep devMode but clear everything else
        const devMode = localStorage.getItem("devMode");
        localStorage.clear();
        if (devMode) localStorage.setItem("devMode", devMode);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
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