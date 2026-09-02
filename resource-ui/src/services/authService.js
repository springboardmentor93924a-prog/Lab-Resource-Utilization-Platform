import api from "./api";

export async function loginUser(credentials) {
    try {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data?.message ||
                `Login failed (${error.response.status})`,
                { cause: error }
            );
        }

        if (error.request) {
            throw new Error(
                "Cannot connect to the server. Make sure the backend is running on port 8080.",
                { cause: error }
            );
        }

        throw new Error(error.message || "Login failed", { cause: error });
    }
}

export async function registerUser(data) {
    try {
        const response = await api.post("/auth/register", data);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data?.message ||
                `Registration failed (${error.response.status})`,
                { cause: error }
            );
        }

        if (error.request) {
            throw new Error(
                "Cannot connect to the server. Make sure the backend is running on port 8080.",
                { cause: error }
            );
        }

        throw new Error(error.message || "Registration failed", { cause: error });
    }
}