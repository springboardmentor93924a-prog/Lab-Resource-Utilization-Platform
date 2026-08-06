import api from "./api";

export const loginUser = async (credentials) => {
    const isDevMode = localStorage.getItem("devMode") === "true";
    if (isDevMode) {
        const requestedRole = String(credentials?.role || "").toUpperCase();
        const byEmail = credentials.email.toLowerCase().includes("super");
        const isSuper = requestedRole.includes("SUPER") || byEmail;
        const role = requestedRole === "ADMIN" ? "ADMIN" : requestedRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : (isSuper ? "SUPER_ADMIN" : "ADMIN");

        return {
            token: "mock-jwt-token-12345",
            user: {
                id: "d8c34b2a-de74-4382-8832-a5392f99cec1",
                firstName: isSuper ? "Super" : "Dev",
                lastName: isSuper ? "Admin" : "User",
                email: credentials.email,
                role,
                institutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654",
                departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba"
            }
        };
    }

    const response = await api.post("/auth/login", credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const isDevMode = localStorage.getItem("devMode") === "true";
    if (isDevMode) {
        return { message: "User registered successfully in mock mode." };
    }

    const response = await api.post("/auth/register", userData);
    return response.data;
};