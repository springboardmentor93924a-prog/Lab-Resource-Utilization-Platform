import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Read the persisted session synchronously so the first render is already correct
function readStoredUser() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role) return null;
    return {
        token,
        role,
        name: localStorage.getItem("name"),
        userId: localStorage.getItem("userId"),
        email: localStorage.getItem("email"),
        firstName: localStorage.getItem("firstName"),
        lastName: localStorage.getItem("lastName")
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);

    const login = (userData) => {
        const firstName = userData.firstName || "";
        const lastName = userData.lastName || "";
        const fullName = userData.name || `${firstName} ${lastName}`.trim() || "User";

        localStorage.setItem("token", userData.token || userData.accessToken || "");
        localStorage.setItem("role", userData.role || "");
        localStorage.setItem("userId", userData.userId || userData.id || "");
        localStorage.setItem("name", fullName);
        localStorage.setItem("email", userData.email || "");
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);

        setUser({
            token: userData.token || userData.accessToken || "",
            role: userData.role || "",
            userId: userData.userId || userData.id || "",
            name: fullName,
            email: userData.email || "",
            firstName,
            lastName
        });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    };

    const isSystemAdmin = () => hasRole(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
    const isInstitutionAdmin = () => hasRole(["INSTITUTION_ADMIN"]);
    const isDepartmentHead = () => hasRole(["DEPARTMENT_HEAD", "FACULTY"]);
    const isLabManager = () => hasRole(["LAB_MANAGER"]);
    const isLabTechnician = () => hasRole(["TECHNICIAN"]);
    const isResearcher = () => hasRole(["RESEARCHER", "STUDENT"]);

    const isAdmin = () => isSystemAdmin() || isInstitutionAdmin();
    const isManager = () => isLabManager() || isDepartmentHead();

    return (
        <AuthContext.Provider value={{
            user, loading: false, login, logout, hasRole,
            isAdmin, isManager, isResearcher,
            isSystemAdmin, isInstitutionAdmin, isDepartmentHead, isLabManager, isLabTechnician
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
